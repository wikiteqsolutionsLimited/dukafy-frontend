import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Save,
  Store,
  Loader2,
  Smartphone,
  Building2,
  Settings2,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { shopSettingsApi, shopsApi, mpesaTestApi } from "@/lib/api";
import { useShop } from "@/hooks/useShop";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardSection } from "@/components/shared/CardSection";
import { FormInput, FormTextarea } from "@/components/shared/FormFields";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { activeShop, refresh } = useShop();
  const isAdmin = activeShop?.member_role === "admin";

  const { data: paymentData, isLoading: paymentLoading, refetch: refetchPayment } = useQuery({
    queryKey: ["shop-settings", activeShop?.id],
    queryFn: () => shopSettingsApi.get(),
    enabled: !!activeShop,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    currency: "KES",
    tax_rate: "0",
    receipt_footer: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    mpesa_enabled: false,
    mpesa_environment: "sandbox",
    mpesa_shortcode: "",
    mpesa_passkey: "",
    mpesa_consumer_key: "",
    mpesa_consumer_secret: "",
  });

  // Reveal toggles for sensitive fields
  const [reveal, setReveal] = useState({
    passkey: false,
    consumer_key: false,
    consumer_secret: false,
  });

  useEffect(() => {
    if (activeShop) {
      setForm({
        name: activeShop.name || "",
        phone: activeShop.phone || "",
        email: activeShop.email || "",
        address: activeShop.address || "",
        currency: activeShop.currency || "KES",
        tax_rate: String(activeShop.tax_rate ?? 0),
        receipt_footer: activeShop.receipt_footer || "",
      });
      setLogoPreview(activeShop.logo_url || null);
    }
  }, [activeShop]);

  useEffect(() => {
    if (paymentData?.data) {
      const s = paymentData.data;
      setPaymentForm((prev) => ({
        ...prev,
        mpesa_enabled: !!s.mpesa_enabled,
        mpesa_environment: s.mpesa_environment || "sandbox",
        mpesa_shortcode: s.mpesa_shortcode || "",
      }));
    }
  }, [paymentData]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop) return;
    if (!isAdmin) { toast.error("Only shop admins can update settings"); return; }
    setSaving(true);
    try {
      await shopsApi.update(activeShop.id, {
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        currency: form.currency,
        tax_rate: parseFloat(form.tax_rate) || 0,
        receipt_footer: form.receipt_footer,
      });
      await refresh();
      toast.success("Shop profile saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Strip empty sensitive fields so backend keeps the saved value.
      const payload: Record<string, any> = { ...paymentForm };
      if (!payload.mpesa_passkey?.trim()) delete payload.mpesa_passkey;
      if (!payload.mpesa_consumer_key?.trim()) delete payload.mpesa_consumer_key;
      if (!payload.mpesa_consumer_secret?.trim()) delete payload.mpesa_consumer_secret;
      await shopSettingsApi.update(payload);
      await refetchPayment();
      // Clear local sensitive fields after save (don't keep them in memory).
      setPaymentForm((prev) => ({
        ...prev,
        mpesa_passkey: "",
        mpesa_consumer_key: "",
        mpesa_consumer_secret: "",
      }));
      toast.success("Payment settings saved securely");
    } catch (err: any) {
      toast.error(err.message || "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await mpesaTestApi.test();
      toast.success(res.message || "M-Pesa credentials are valid");
    } catch (err: any) {
      toast.error(err.message || "Credential test failed");
    } finally {
      setTesting(false);
    }
  };

  if (!activeShop || paymentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const callbackUrl: string = paymentData?.data?.mpesa_callback_url || "";
  const callbackManaged: boolean = !!paymentData?.data?.mpesa_callback_managed;
  const hasPasskey: boolean = !!paymentData?.data?.has_mpesa_passkey;
  const hasConsumerKey: boolean = !!paymentData?.data?.has_mpesa_consumer_key;
  const hasConsumerSecret: boolean = !!paymentData?.data?.has_mpesa_consumer_secret;

  // Wrapper input for sensitive fields with mask + reveal toggle
  const SensitiveInput = ({
    label,
    field,
    placeholder,
    saved,
  }: {
    label: string;
    field: "passkey" | "consumer_key" | "consumer_secret";
    placeholder: string;
    saved: boolean;
  }) => {
    const value =
      field === "passkey"
        ? paymentForm.mpesa_passkey
        : field === "consumer_key"
          ? paymentForm.mpesa_consumer_key
          : paymentForm.mpesa_consumer_secret;
    const setValue = (v: string) =>
      setPaymentForm((prev) => ({
        ...prev,
        ...(field === "passkey"
          ? { mpesa_passkey: v }
          : field === "consumer_key"
            ? { mpesa_consumer_key: v }
            : { mpesa_consumer_secret: v }),
      }));
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Lock className="h-3 w-3 text-muted-foreground" />
          {label}
          {saved && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
              <CheckCircle2 className="h-2.5 w-2.5" /> stored
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type={reveal[field] ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={saved ? "•••••••••••• (leave blank to keep)" : placeholder}
            autoComplete="new-password"
            className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => setReveal((r) => ({ ...r, [field]: !r[field] }))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {reveal[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Settings" description={`Managing "${activeShop.name}"`} />

      <Tabs defaultValue="profile" className="mx-auto w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <Building2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Shop</span> Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <Settings2 className="h-3.5 w-3.5" /> Business
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <Smartphone className="h-3.5 w-3.5" /> Payments
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="mt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <CardSection title="Shop Logo" description="Upload your shop's logo (max 5MB)">
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-8 transition-colors hover:border-primary/40 hover:bg-accent/50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent">
                    <Store className="h-8 w-8 text-accent-foreground" />
                  </div>
                )}
                <div className="text-center">
                  <span className="text-sm font-medium text-primary">{logoPreview ? "Change logo" : "Click to upload"}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
            </CardSection>

            <CardSection title="Shop Information" description="Basic details about your shop">
              <div className="space-y-4">
                <FormInput label="Shop Name" value={form.name} onChange={update("name")} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput label="Phone" type="tel" value={form.phone} onChange={update("phone")} />
                  <FormInput label="Email" type="email" value={form.email} onChange={update("email")} />
                </div>
                <FormTextarea label="Address" value={form.address} onChange={update("address")} rows={3} />
              </div>
            </CardSection>

            <div className="flex justify-end">
              <PrimaryButton icon={Save} type="submit" disabled={saving || !isAdmin}>
                {saving ? "Saving..." : "Save Profile"}
              </PrimaryButton>
            </div>
            {!isAdmin && (
              <p className="text-center text-xs text-muted-foreground">Only shop admins can edit shop settings.</p>
            )}
          </form>
        </TabsContent>

        {/* BUSINESS TAB */}
        <TabsContent value="business" className="mt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <CardSection title="Business Settings" description="Currency, tax, and receipt configuration">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput label="Currency" value={form.currency} onChange={update("currency")} />
                  <FormInput label="Default Tax Rate (%)" type="number" min="0" step="0.01" value={form.tax_rate} onChange={update("tax_rate")} />
                </div>
                <FormTextarea label="Receipt Footer" value={form.receipt_footer} onChange={update("receipt_footer")} rows={2} />
              </div>
            </CardSection>

            <div className="flex justify-end">
              <PrimaryButton icon={Save} type="submit" disabled={saving || !isAdmin}>
                {saving ? "Saving..." : "Save Business Settings"}
              </PrimaryButton>
            </div>
          </form>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments" className="mt-6">
          {!isAdmin ? (
            <CardSection>
              <p className="py-6 text-center text-sm text-muted-foreground">
                Only shop admins can manage M-Pesa credentials.
              </p>
            </CardSection>
          ) : (
            <form onSubmit={handlePaymentSave} className="space-y-6">
              {/* Security banner */}
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-card-foreground">Your M-Pesa keys are encrypted at rest</p>
                  <p className="text-xs text-muted-foreground">
                    We never display your saved keys. Leave fields blank to keep the existing value.
                    The callback URL is generated automatically by our servers — you don't need to set it.
                  </p>
                </div>
              </div>

              <CardSection
                title="M-Pesa Configuration"
                description="Per-shop M-Pesa Daraja credentials"
              >
                <div className="space-y-4">
                  <label className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-card-foreground">
                    <input
                      type="checkbox"
                      checked={paymentForm.mpesa_enabled}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_enabled: e.target.checked }))}
                    />
                    <span className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" /> Enable M-Pesa for this shop
                    </span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Environment</label>
                      <select
                        value={paymentForm.mpesa_environment}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_environment: e.target.value }))}
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="sandbox">Sandbox (testing)</option>
                        <option value="production">Production (live)</option>
                      </select>
                    </div>
                    <FormInput
                      label="Shortcode (Paybill / Till)"
                      value={paymentForm.mpesa_shortcode}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_shortcode: e.target.value }))}
                    />
                  </div>

                  {/* Auto-managed callback URL */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <ShieldCheck className="h-3 w-3 text-success" />
                      Callback URL (auto-managed)
                    </label>
                    <div className={cn(
                      "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5 text-xs font-mono text-muted-foreground",
                      callbackManaged && "border-success/40"
                    )}>
                      <span className="truncate flex-1">{callbackUrl || "Not configured on server"}</span>
                      {callbackManaged && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      You don't need to type this — Safaricom callbacks are routed to our secure backend.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SensitiveInput
                      label="Consumer Key"
                      field="consumer_key"
                      placeholder="Daraja consumer key"
                      saved={hasConsumerKey}
                    />
                    <SensitiveInput
                      label="Consumer Secret"
                      field="consumer_secret"
                      placeholder="Daraja consumer secret"
                      saved={hasConsumerSecret}
                    />
                  </div>

                  <SensitiveInput
                    label="Passkey"
                    field="passkey"
                    placeholder="Lipa Na M-Pesa passkey"
                    saved={hasPasskey}
                  />
                </div>
              </CardSection>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing || (!hasConsumerKey && !paymentForm.mpesa_consumer_key)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {testing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Testing...</>
                  ) : (
                    <><ShieldCheck className="h-4 w-4 text-success" /> Test Credentials</>
                  )}
                </button>
                <PrimaryButton icon={Save} type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Payment Settings"}
                </PrimaryButton>
              </div>
            </form>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
