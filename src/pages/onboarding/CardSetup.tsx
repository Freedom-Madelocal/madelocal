import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CardSetup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const mode = params.get('mode') ?? 'buyer'; // 'seller' starts trial
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (number.length < 12 || !exp || cvc.length < 3) {
      toast({ title: "Please fill in valid card details", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // TODO: wire to create-setup-intent edge function + Stripe Elements.
      // Stub: pretend success after short delay.
      await new Promise((r) => setTimeout(r, 800));

      if (mode === 'seller') {
        // TODO: invoke start-seller-trial edge function
        navigate('/onboarding/seller-success', { replace: true });
      } else {
        toast({ title: "Card saved 🎉" });
        navigate('/discover', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not save card";
      toast({ title: "Card error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-2 px-3 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-bold">
            {mode === 'seller' ? 'Set up card to go live' : 'Save a card'}
          </h1>
        </div>
      </header>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="mx-auto mt-4 max-w-md space-y-5 px-4"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-4 text-sm text-muted-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          {mode === 'seller'
            ? "Your first month is free. We'll charge this card when your trial ends."
            : "We'll only charge this card when you purchase something."}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cc-number">Card number</Label>
          <Input
            id="cc-number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 1234 1234 1234"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d ]/g, ''))}
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cc-exp">Expiry</Label>
            <Input
              id="cc-exp"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-cvc">CVC</Label>
            <Input
              id="cc-cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
              maxLength={4}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cc-zip">ZIP / Postal</Label>
          <Input
            id="cc-zip"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            maxLength={10}
          />
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="h-14 w-full rounded-2xl text-base font-semibold shadow-lg">
          {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {mode === 'seller' ? 'Start free month' : 'Save card'}
        </Button>

        <button
          type="button"
          onClick={() => navigate(mode === 'seller' ? '/onboarding/seller-success' : '/discover', { replace: true })}
          className="block w-full pt-2 text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Skip for now
        </button>
      </motion.form>
    </div>
  );
}
