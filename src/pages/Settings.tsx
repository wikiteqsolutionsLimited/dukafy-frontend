import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, Save, Store, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { shopSettingsApi } from "@/lib/api";
import { useShop } from "@/hooks/useShop";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardSection } from "@/components/shared/CardSection";
import { FormInput, FormTextarea } from "@/components/shared/FormFields";
import { PrimaryButton } from "@/components/shared/ActionButtons";

const SettingsPage = () => {
  const { refresh } = useShop();
  const { activeShop } = useShop();
  const { data, isLoading } = useQuery({
    queryKey: ["shop-settings"],
    queryFn: () => shopSettingsApi.get(),
  });

  const [form, setForm] = useState({
    shop_name: "",
    phone: "",
    email: "",
    address: "",
    currency: "KES",
    tax_rate: "0",
    receipt_footer: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    mpesa_enabled: false,
    mpesa_environment: "sandbox",
    mpesa_shortcode: "",
    mpesa_callback_url: "",
    mpesa_passkey: "",
    mpesa_consumer_key: "",
    mpesa_consumer_secret: "",
  });

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      if (s.shop_name !== undefined) {
        setForm({
          shop_name: s.shop_name || "",
          phone: s.phone || "",
          email: s.email || "",
          address: s.address || "",
          currency: s.currency || "KES",
          tax_rate: String(s.tax_rate || 0),
          receipt_footer: s.receipt_footer || "",
        });
      }

      setPaymentForm((prev) => ({
        ...prev,
        mpesa_enabled: !!s.mpesa_enabled,
        mpesa_environment: s.mpesa_environment || "sandbox",
        mpesa_shortcode: s.mpesa_shortcode || "",
        mpesa_callback_url: s.mpesa_callback_url || "",
      }));
    }
  }, [data]);

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
    setSaving(true);
    try {
      await shopSettingsApi.update({
        ...form,
        tax_rate: parseFloat(form.tax_rate) || 0,
      });
      await refresh();
      toast.success("Settings saved successfully");
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
      await shopSettingsApi.update(paymentForm);
      toast.success("Payment settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Settings" description="Manage your shop profile" />

      <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-6">
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
            <FormInput label="Shop Name" value={form.shop_name} onChange={update("shop_name")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Phone" type="tel" value={form.phone} onChange={update("phone")} />
              <FormInput label="Email" type="email" value={form.email} onChange={update("email")} />
            </div>
            <FormTextarea label="Address" value={form.address} onChange={update("address")} rows={3} />
          </div>
        </CardSection>

        <CardSection title="Business Settings" description="Currency, tax, and receipt configuration">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Currency" value={form.currency} onChange={update("currency")} />
              <FormInput label="Tax Rate (%)" type="number" value={form.tax_rate} onChange={update("tax_rate")} />
            </div>
            <FormTextarea label="Receipt Footer" value={form.receipt_footer} onChange={update("receipt_footer")} rows={2} />
          </div>
        </CardSection>

        <div className="flex justify-end">
          <PrimaryButton icon={Save} type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        </div>
      </form>

      {activeShop?.member_role === "admin" && (
        <form onSubmit={handlePaymentSave} className="mx-auto max-w-2xl space-y-6">
          <CardSection title="M-Pesa Payment Configuration" description="Only the current shop admin can manage this shop's M-Pesa credentials.">
            <div className="space-y-4">
              <label className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-card-foreground">
                <input
                  type="checkbox"
                  checked={paymentForm.mpesa_enabled}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_enabled: e.target.checked }))}
                />
                <span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> Enable M-Pesa for this shop</span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Environment" value={paymentForm.mpesa_environment} onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_environment: e.target.value }))} />
                <FormInput label="Shortcode" value={paymentForm.mpesa_shortcode} onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_shortcode: e.target.value }))} />
              </div>
              <FormInput label="Callback URL" value={paymentForm.mpesa_callback_url} onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_callback_url: e.target.value }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Consumer Key" value={paymentForm.mpesa_consumer_key} onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_consumer_key: e.target.value }))} />
                <FormInput label="Consumer Secret" value={paymentForm.mpesa_consumer_secret} onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_consumer_secret: e.target.value }))} />
              </div>
              <FormInput label="Passkey" value={paymentForm.mpesa_passkey} onChange={(e) => setPaymentForm((prev) => ({ ...prev, mpesa_passkey: e.target.value }))} />
            </div>
          </CardSection>

          <div className="flex justify-end">
            <PrimaryButton icon={Save} type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Payment Settings"}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
