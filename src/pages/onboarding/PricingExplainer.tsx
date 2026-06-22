import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

export default function PricingExplainer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-md">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            First month free
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground">How seller pricing works</h1>
          <p className="mb-8 text-muted-foreground">
            We charge by <strong>active listings per month</strong>. You only pay for what goes live.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-3 rounded-2xl border bg-card p-5"
        >
          <Row text="1 listing live any day in a month = 1 listing" />
          <Row text="5 different listings live on different days = 5 listings" />
          <Row text="First month is on us — no charge until renewal" />
          <Row text="Same card works for marketplace purchases" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          <Button
            onClick={() => navigate('/onboarding/card?mode=seller')}
            size="lg"
            className="h-14 rounded-2xl text-base font-semibold shadow-lg"
          >
            Set up card and go live
          </Button>
          <Button
            onClick={() => navigate('/onboarding/card-prompt?after=skip-seller')}
            size="lg"
            variant="ghost"
            className="h-14 rounded-2xl text-base font-semibold"
          >
            Stay as a buyer for now
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="h-3 w-3" />
      </div>
      <p className="text-sm text-foreground">{text}</p>
    </div>
  );
}
