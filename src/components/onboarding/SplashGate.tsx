import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-full.png";

export default function SplashGate() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-8">
        <img src={logo} alt="MadeLocal logo" className="mx-auto h-20" />
      </motion.div>

      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="mb-2 text-xl text-primary-foreground/90">
        Fresh food from your neighbors
      </motion.p>

      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="mb-12 max-w-xs text-primary-foreground/70">
        Discover homemade eggs, honey, bread, and more from local food makers near you.
      </motion.p>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="flex flex-col gap-3">
        <Button onClick={() => navigate("/onboarding")} size="lg" className="rounded-full bg-secondary px-10 py-6 text-lg font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90 transition-all">
          Get Started
        </Button>
        <button onClick={() => navigate("/auth")} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
          Already have an account? <span className="font-semibold underline">Sign in</span>
        </button>
      </motion.div>
    </div>
  );
}
