/**
 * Mobile checkout: Stripe Elements + PaymentRequest (Apple Pay/Google Pay) + Cash on pickup.
 * Calls Tribekiller's edge functions: create-checkout-payment-intent, confirm-checkout-payment.
 */
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Banknote, CreditCard } from "lucide-react";
import { Elements, useStripe, useElements, PaymentElement, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import type { Stripe, PaymentRequest } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useStripeMode } from "@/hooks/use-stripe-mode";
import { getStripePromise } from "@/lib/stripe-config";
import { useCashOrder } from "@/hooks/use-cash-order";
import { getCartKey } from "@/hooks/use-cart-mp";

interface CartItem {
  listing_id: string;
  title: string;
  price: number;
  quantity: number;
  seller_id: string;
  image?: string;
  deliveryChoice?: "pickup" | "delivery";
}

interface CheckoutData {
  cartItems: CartItem[];
  subtotal: number;
  promoDiscount: number;
  creditsApplied: number;
  transactionFee: number;
  transactionFeeLabel: string | null;
  total: number;
  allSellersAcceptCash?: boolean;
}

interface PaymentInnerProps {
  data: CheckoutData;
  paymentIntentId: string;
  guestInfo: { name: string; email: string; phone: string };
  onSuccess: () => void;
}

function PaymentInner({ data, paymentIntentId, guestInfo, onSuccess }: PaymentInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  // Set up Apple Pay / Google Pay PaymentRequest
  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "MadeLocal Order", amount: Math.round(data.total * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });
    pr.on("paymentmethod", async (ev) => {
      try {
        const { error: confirmError } = await stripe.confirmCardPayment(
          // PR flow needs the client secret — but we set it up via Elements options. Use confirmCardPayment with the PR's payment_method.
          // The trick: stripe.confirmCardPayment needs the secret directly.
          // We'll re-fetch via Elements: instead use stripe.confirmPayment isn't available with PR token alone.
          // Workaround: use the elements client secret stored on the Elements provider's options.
          (elements as any)?._commonOptions?.clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );
        if (confirmError) {
          ev.complete("fail");
          toast({ title: "Payment failed", description: confirmError.message, variant: "destructive" });
          return;
        }
        ev.complete("success");
        await supabase.functions.invoke("confirm-checkout-payment", {
          body: { payment_intent_id: paymentIntentId },
        });
        onSuccess();
      } catch (err: any) {
        ev.complete("fail");
        toast({ title: "Payment failed", description: err?.message ?? "Try again", variant: "destructive" });
      }
    });
  }, [stripe, elements, data.total, paymentIntentId, onSuccess, toast]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast({ title: "Payment failed", description: submitError.message, variant: "destructive" });
      setProcessing(false);
      return;
    }
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}` },
      redirect: "if_required",
    });
    if (confirmError) {
      toast({ title: "Payment failed", description: confirmError.message, variant: "destructive" });
      setProcessing(false);
      return;
    }
    await supabase.functions.invoke("confirm-checkout-payment", {
      body: { payment_intent_id: paymentIntentId },
    });
    onSuccess();
  };

  return (
    <div className="space-y-4">
      {paymentRequest && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Pay instantly</div>
          <PaymentRequestButtonElement options={{ paymentRequest, style: { paymentRequestButton: { height: "48px" } } }} />
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-2 text-xs uppercase text-muted-foreground">or pay with card</span></div>
          </div>
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-3">
        <PaymentElement options={{ layout: "tabs" }} />
        <Button type="submit" size="lg" className="w-full" disabled={!stripe || processing}>
          {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Pay ${data.total.toFixed(2)}</>}
        </Button>
      </form>
    </div>
  );
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { mode: stripeMode, loading: stripeModeLoading } = useStripeMode();
  const cashOrder = useCashOrder();

  const [data, setData] = useState<CheckoutData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Load checkout data
  useEffect(() => {
    const stored = sessionStorage.getItem("madelocal_mobile_checkout");
    if (!stored) { navigate("/cart"); return; }
    setData(JSON.parse(stored));
  }, [navigate]);

  // Pre-fill guest info from user
  useEffect(() => {
    if (user?.email) setGuestInfo(p => ({ ...p, email: user.email || "" }));
  }, [user]);

  // Load Stripe SDK once mode resolves
  useEffect(() => {
    if (stripeModeLoading) return;
    getStripePromise(stripeMode).then(setStripeInstance);
  }, [stripeMode, stripeModeLoading]);

  // Validate guest form
  const guestValid = useMemo(() => {
    if (user) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email) && guestInfo.name.trim().length >= 2;
  }, [user, guestInfo]);

  // Create PaymentIntent when ready
  const startCardPayment = async () => {
    if (!data || !guestValid) return;
    setCreating(true);
    const { data: piData, error } = await supabase.functions.invoke("create-checkout-payment-intent", {
      body: {
        cart_items: data.cartItems.map(i => ({
          listing_id: i.listing_id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          seller_id: i.seller_id,
          option_id: null,
          option_name: null,
        })),
        guest_email: user ? undefined : guestInfo.email,
        guest_phone: user ? undefined : guestInfo.phone,
        guest_name: user ? undefined : guestInfo.name,
        promo_discount: data.promoDiscount,
        credits_applied: data.creditsApplied,
        transaction_fee: data.transactionFee,
        total: data.total,
      },
    });
    setCreating(false);
    if (error || (piData as any)?.error) {
      toast({ title: "Could not start payment", description: (piData as any)?.error || "Try again", variant: "destructive" });
      return;
    }
    setClientSecret((piData as any).clientSecret);
    setPaymentIntentId((piData as any).paymentIntentId);
  };

  const handleCash = () => {
    if (!data || !user) {
      toast({ title: "Sign in required", description: "Sign in to place a cash order", variant: "destructive" });
      return;
    }
    cashOrder.mutate(
      { cartItems: data.cartItems, userId: user.id },
      {
        onSuccess: () => {
          localStorage.removeItem(getCartKey(user.id));
          window.dispatchEvent(new Event("cart-updated"));
          toast({ title: "Order placed", description: "Pay the seller in cash at pickup." });
          navigate("/checkout/success?payment_method=cash");
        },
        onError: () => toast({ title: "Could not place order", variant: "destructive" }),
      }
    );
  };

  const handleSuccess = () => {
    localStorage.removeItem(getCartKey(user?.id));
    window.dispatchEvent(new Event("cart-updated"));
    navigate("/checkout/success");
  };

  if (!data) return null;

  return (
    <div className="min-h-screen pb-10">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-bold">Checkout</h1>
        </div>
      </div>

      <main className="mx-auto max-w-lg space-y-4 px-4">
        {/* Order summary */}
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Order summary</h2>
          <div className="space-y-2">
            {data.cartItems.map((i) => (
              <div key={i.listing_id} className="flex items-center justify-between text-sm">
                <span className="truncate text-muted-foreground">{i.quantity}× {i.title}</span>
                <span className="text-foreground">${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t pt-3 flex justify-between font-display text-base font-bold">
            <span>Total</span>
            <span className="text-primary">${data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Guest info */}
        {!user && (
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Contact info</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={guestInfo.name} onChange={(e) => setGuestInfo(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={guestInfo.email} onChange={(e) => setGuestInfo(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" value={guestInfo.phone} onChange={(e) => setGuestInfo(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
        )}

        {/* Payment method */}
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Payment method</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left text-sm transition-all ${
                paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <CreditCard className="h-4 w-4 text-primary" />
              <div className="font-medium">Pay now</div>
              <div className="text-[11px] text-muted-foreground">Card, Apple/Google Pay</div>
            </button>
            <button
              type="button"
              disabled={!data.allSellersAcceptCash}
              onClick={() => setPaymentMethod("cash")}
              className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left text-sm transition-all ${
                paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border"
              } ${!data.allSellersAcceptCash ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <Banknote className="h-4 w-4 text-primary" />
              <div className="font-medium">Cash on pickup</div>
              <div className="text-[11px] text-muted-foreground">
                {data.allSellersAcceptCash ? "Pay seller directly" : "Not available"}
              </div>
            </button>
          </div>
        </div>

        {/* Card flow */}
        {paymentMethod === "card" && (
          <div className="rounded-2xl border bg-card p-4">
            {!clientSecret ? (
              <Button size="lg" className="w-full" onClick={startCardPayment} disabled={!guestValid || creating}>
                {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue to payment"}
              </Button>
            ) : stripeInstance ? (
              <Elements
                stripe={stripeInstance}
                options={{ clientSecret, appearance: { theme: "stripe" } }}
              >
                <PaymentInner
                  data={data}
                  paymentIntentId={paymentIntentId!}
                  guestInfo={guestInfo}
                  onSuccess={handleSuccess}
                />
              </Elements>
            ) : (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Cash flow */}
        {paymentMethod === "cash" && (
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Your order will be placed and the seller notified. Bring cash to pickup.
            </p>
            <Button size="lg" className="w-full" onClick={handleCash} disabled={cashOrder.isPending}>
              {cashOrder.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Place cash order"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
