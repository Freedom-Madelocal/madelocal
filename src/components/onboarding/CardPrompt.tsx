import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface Props {
  onSaveCard: () => void;
  onSkip: () => void;
  title?: string;
  description?: string;
}

export default function CardPrompt({ onSaveCard, onSkip, title, description }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
      >
        <CreditCard className="h-12 w-12 text-primary" />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-3 text-3xl font-bold text-foreground"
      >
        {title ?? "Save a card for purchases?"}
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 max-w-xs text-muted-foreground"
      >
        {description ?? "Set it up now to check out faster later, or just look around for now."}
      </motion.p>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button onClick={onSaveCard} size="lg" className="h-14 rounded-2xl text-base font-semibold shadow-lg">
          Save a card
        </Button>
        <Button onClick={onSkip} size="lg" variant="ghost" className="h-14 rounded-2xl text-base font-semibold">
          Just look around
        </Button>
      </div>
    </div>
  );
}
