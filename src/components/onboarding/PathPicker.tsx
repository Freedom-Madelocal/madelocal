import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Store } from "lucide-react";
import type { OnboardingMode } from "@/hooks/useOnboarding";

interface Props {
  onPick: (mode: OnboardingMode) => void;
}

export default function PathPicker({ onPick }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-3 text-3xl font-bold text-foreground"
      >
        Are you here to primarily:
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 max-w-xs text-muted-foreground"
      >
        Pick one to get a tailored experience
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <Button
          onClick={() => onPick('seller')}
          size="lg"
          className="h-20 rounded-2xl text-lg font-semibold shadow-lg"
        >
          <Store className="mr-2 h-6 w-6" />
          Sell
        </Button>
        <Button
          onClick={() => onPick('buyer')}
          size="lg"
          variant="secondary"
          className="h-20 rounded-2xl text-lg font-semibold shadow-lg"
        >
          <ShoppingBasket className="mr-2 h-6 w-6" />
          Buy
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 max-w-xs text-sm text-muted-foreground"
      >
        You can always do both — this helps give the best onboarding experience.
      </motion.p>
    </div>
  );
}
