import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Check, Crown, Clock, AlertTriangle, Smartphone, ArrowRight, Loader2, Phone, MessageSquare } from "lucide-react";
import { subscriptionsApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { Modal } from "@/components/shared/Modal";

interface Subscription {
  id: number;
  plan: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  is_active: boolean;
  days_remaining: number;
  max_shops: number;
  max_products: number;
  max_users: number;
}

interface Plan {
  id: string;
  name: string;
  price_kes: number;
  price_usd: number;
  interval: string;
  max_shops: number;
  max_products: number;
  max_users: number;
  features: string[];
  contact_required?: boolean;
}

const BillingPage = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<Plan | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, plansRes] = await Promise.all([
          subscriptionsApi.getMy(),
          subscriptionsApi.getPlans(),
        ]);
        setSubscription(subRes.data);
        setPlans(plansRes.data);
      } catch {
        // No subscription yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpgrade = (plan: Plan) => {
    if (plan.contact_required) {
      window.open("mailto:hello@dukaflo.co.ke?subject=Enterprise Plan Inquiry", "_blank");
      return;
    }
    if (subscription?.plan === plan.id && subscription?.status === "active") {
      toast.info("You're already on this plan");
      return;
    }
    setPaymentModal(plan);
    setMpesaPhone("");
    setCheckoutRequestId("");
  };

  const handleInitiatePayment = async () => {
    if (!paymentModal || !mpesaPhone.trim()) {
      toast.error("Enter your M-Pesa phone number");
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await subscriptionsApi.initiatePayment({
        plan_id: paymentModal.id,
        phone: mpesaPhone,
      });
      if (res.success && res.data) {
        setCheckoutRequestId(res.data.checkoutRequestID || res.data.CheckoutRequestID);
        toast.success("Check your phone for M-Pesa prompt!", { duration: 5000 });
        
        // Start polling for confirmation
        setConfirmingPayment(true);
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const confirmRes = await subscriptionsApi.confirmPayment({
              checkout_request_id: res.data.checkoutRequestID || res.data.CheckoutRequestID,
              plan_id: paymentModal.id,
            });
            if (confirmRes.success) {
              clearInterval(pollInterval);
              setConfirmingPayment(false);
              setPaymentLoading(false);
              setPaymentModal(null);
              setSubscription(confirmRes.data);
              toast.success("🎉 Subscription activated! Thank you for your payment.");
            }
          } catch {
            if (attempts >= 20) {
              clearInterval(pollInterval);
              setConfirmingPayment(false);
              setPaymentLoading(false);
              toast.error("Payment confirmation timed out. If you paid, please refresh the page.");
            }
          }
        }, 3000);
      }
    } catch (err: any) {
      toast.error(err.message || "Payment initiation failed");
      setPaymentLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      trialing: "bg-primary/10 text-primary",
      active: "bg-success/10 text-success",
      past_due: "bg-warning/10 text-warning",
      expired: "bg-destructive/10 text-destructive",
      canceled: "bg-muted text-muted-foreground",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  const isExpired = subscription?.status === "expired";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan and payment methods</p>
      </div>

      {/* Expired Banner */}
      {isExpired && (
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-destructive">Subscription Expired</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your subscription has expired. Please renew to continue using DukaFlo. 
                Your data is safe and will be available once you reactivate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan */}
      {subscription && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-card-foreground capitalize">{subscription.plan} Plan</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusBadge(subscription.status)}`}>
                    {subscription.status === "trialing" && <Clock className="h-3 w-3" />}
                    {subscription.status}
                  </span>
                </div>
              </div>
            </div>

            {subscription.days_remaining > 0 && (
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">{subscription.days_remaining}</p>
                <p className="text-xs text-muted-foreground">days remaining</p>
              </div>
            )}
          </div>

          {subscription.status === "trialing" && subscription.days_remaining <= 7 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>Your free trial ends in <strong>{subscription.days_remaining} days</strong>. Upgrade to keep using DukaFlo.</p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-4 rounded-xl bg-muted/50 p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{subscription.max_shops === -1 ? "∞" : subscription.max_shops}</p>
              <p className="text-xs text-muted-foreground">Shops</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{subscription.max_products === -1 ? "∞" : subscription.max_products}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{subscription.max_users === -1 ? "∞" : subscription.max_users}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const isCurrent = subscription?.plan === plan.id && (subscription?.status === "active" || subscription?.status === "trialing");
            const isPopular = i === 2; // Pro
            return (
              <div key={plan.id} className={`relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${isPopular ? "border-primary ring-1 ring-primary/20" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-card-foreground">{plan.name}</h3>
                <div className="mt-2">
                  {plan.contact_required ? (
                    <span className="text-2xl font-black text-foreground">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-foreground">KES {plan.price_kes.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                    </>
                  )}
                </div>
                {!plan.contact_required && (
                  <p className="mt-1 text-xs text-muted-foreground">(~${plan.price_usd}/month)</p>
                )}
                
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-card-foreground">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrent}
                  className={`mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                    isCurrent
                      ? "border bg-muted text-muted-foreground cursor-default"
                      : isPopular
                        ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                        : plan.contact_required
                          ? "border-2 border-primary bg-primary/5 text-primary hover:bg-primary/10"
                          : "border bg-card text-card-foreground hover:bg-muted"
                  }`}
                >
                  {isCurrent ? "Current Plan" : plan.contact_required ? (
                    <><MessageSquare className="h-4 w-4" /> Contact Us</>
                  ) : (
                    <>{isExpired ? "Renew" : "Upgrade"} <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* M-Pesa Payment Modal */}
      <Modal
        open={!!paymentModal}
        onClose={() => { if (!paymentLoading) setPaymentModal(null); }}
        title={confirmingPayment ? "Confirming Payment" : `Pay for ${paymentModal?.name} Plan`}
        size="sm"
        footer={!confirmingPayment ? (
          <>
            <button
              onClick={() => setPaymentModal(null)}
              disabled={paymentLoading}
              className="h-10 flex-1 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleInitiatePayment}
              disabled={paymentLoading || !mpesaPhone.trim()}
              className="h-10 flex-1 rounded-xl bg-[hsl(142,60%,40%)] text-sm font-bold text-white shadow-sm hover:bg-[hsl(142,60%,35%)] disabled:opacity-50"
            >
              {paymentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Smartphone className="h-4 w-4" /> Pay via M-Pesa
                </span>
              )}
            </button>
          </>
        ) : undefined}
      >
        {confirmingPayment ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(142,60%,40%)]/10">
              <Smartphone className="h-8 w-8 text-[hsl(142,60%,40%)]" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground">Confirming Payment</h3>
            <p className="text-sm text-muted-foreground">
              A payment request of <strong>KES {paymentModal?.price_kes.toLocaleString()}</strong> has been sent to <strong>{mpesaPhone}</strong>
            </p>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[hsl(142,60%,40%)]" />
              <span className="text-sm text-muted-foreground">Enter your M-Pesa PIN to complete...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">{paymentModal?.name} Plan — Monthly</p>
              <p className="text-3xl font-black text-card-foreground mt-1">KES {paymentModal?.price_kes.toLocaleString()}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">M-Pesa Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-lg font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(142,60%,40%)]/30"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              You will receive an M-Pesa STK push on your phone. Enter your PIN to complete payment.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillingPage;
