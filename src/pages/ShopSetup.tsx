import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Store, Phone, Mail, MapPin, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { shopsApi } from "@/lib/api";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  { id: 1, title: "Welcome", desc: "Let's set up your shop" },
  { id: 2, title: "Shop Details", desc: "Basic information" },
  { id: 3, title: "Contact Info", desc: "How customers reach you" },
  { id: 4, title: "Complete", desc: "You're all set!" },
];

const ShopSetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shopCtx = useShop();
  const { refresh } = shopCtx;
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const createMode = searchParams.get("mode") === "create";
  const [form, setForm] = useState({
    shop_name: "",
    phone: "",
    email: "",
    address: "",
    currency: "KES",
    tax_rate: "16",
    receipt_footer: "Thank you for shopping with us!",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canNext = () => {
    if (step === 2) return form.shop_name.trim().length >= 2;
    if (step === 3) return form.phone.trim().length >= 9 && form.email.includes("@");
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { activeShop } = shopCtx;
      // If user already has a shop (from registration), update it
      // Otherwise create a new one
      const shopData = {
        name: form.shop_name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        currency: form.currency,
        tax_rate: parseFloat(form.tax_rate) || 0,
        receipt_footer: form.receipt_footer,
        is_setup_complete: true,
      };
      
       if (activeShop && !createMode) {
        await shopsApi.update(activeShop.id, shopData);
      } else {
        await shopsApi.create(shopData);
      }
      await refresh();
      toast.success("Shop setup complete! Welcome to DukaFy 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  step > s.id
                    ? "bg-primary text-primary-foreground"
                    : step === s.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "border bg-muted text-muted-foreground"
                }`}
              >
                {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 rounded-full transition-colors duration-300 ${step > s.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-card-foreground">
                Welcome to DukaFy{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 🎉
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Let's get your shop set up in just a few quick steps.
                This will help customize your POS, receipts, and reports.
              </p>
            </div>
          )}

          {/* Step 2: Shop Details */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-card-foreground">Shop Details</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tell us about your business</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                    Shop Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={form.shop_name}
                      onChange={(e) => update("shop_name", e.target.value)}
                      placeholder="e.g. Mama Njeri's Shop"
                      className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => update("currency", e.target.value)}
                      className="h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="KES">KES (Kenyan Shilling)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="TZS">TZS (Tanzanian Shilling)</option>
                      <option value="UGX">UGX (Ugandan Shilling)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={form.tax_rate}
                      onChange={(e) => update("tax_rate", e.target.value)}
                      placeholder="16"
                      className="h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">Receipt Footer</label>
                  <textarea
                    value={form.receipt_footer}
                    onChange={(e) => update("receipt_footer", e.target.value)}
                    placeholder="Message printed at the bottom of receipts"
                    rows={2}
                    className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-card-foreground">Contact Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Used on receipts and reports</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="e.g. shop@example.com"
                      className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="e.g. Tom Mboya St, Nairobi"
                      rows={2}
                      className="w-full rounded-xl border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-card-foreground">You're All Set! 🚀</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                <strong>{form.shop_name}</strong> is ready to go. You can start adding products,
                making sales, and managing your business right away.
              </p>
              <div className="mt-6 rounded-xl bg-muted/50 p-4 text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Summary</p>
                <div className="space-y-1.5 text-sm text-card-foreground">
                  <p>🏪 <strong>{form.shop_name}</strong></p>
                  <p>📞 {form.phone}</p>
                  <p>📧 {form.email}</p>
                  {form.address && <p>📍 {form.address}</p>}
                  <p>💰 {form.currency} • Tax: {form.tax_rate}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 && step < 4 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {step < 4 && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Skip for now
                </button>
              )}

              {step < 3 && (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={() => { setStep(4); }}
                  disabled={!canNext()}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {step === 4 && (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {saving ? "Setting up..." : "Launch My Shop"} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSetupPage;
