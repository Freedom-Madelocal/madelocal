import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SplashGate() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 text-center">
      {/* Animated Logo */}
      <div className="relative mb-8 h-32 w-56">
        <svg
          viewBox="0 0 280 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* The "m" drawn with a fluid stroke */}
          <motion.path
            d="M 30 120 
               C 30 120, 30 50, 30 50
               C 30 35, 45 30, 55 45
               C 65 60, 75 120, 75 120
               C 75 120, 75 50, 75 50
               C 75 35, 90 30, 100 45
               C 110 60, 120 120, 120 120
               C 120 120, 120 50, 120 50
               C 120 35, 135 30, 145 45
               C 155 60, 165 120, 165 120"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              ease: [0.65, 0, 0.35, 1],
            }}
          />

          {/* Location pin — drops in after the m is drawn */}
          <motion.g
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 2.1,
              duration: 0.5,
              type: "spring",
              stiffness: 300,
              damping: 14,
            }}
          >
            {/* Pin body */}
            <path
              d="M 205 125 
                 C 205 105, 195 85, 195 75
                 C 195 58, 208 48, 222 48
                 C 236 48, 249 58, 249 75
                 C 249 85, 239 105, 239 125
                 L 222 148
                 Z"
              fill="hsl(var(--secondary))"
            />
            {/* Pin hole */}
            <circle cx="222" cy="76" r="12" fill="hsl(var(--primary))" />
          </motion.g>
        </svg>

        {/* Subtle bounce shadow under pin */}
        <motion.div
          className="absolute bottom-0 right-6 h-2 w-8 rounded-full bg-black/10 blur-sm"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 2.3, duration: 0.3 }}
        />
      </div>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="mb-2 text-xl text-primary-foreground/90"
      >
        Fresh food from your neighbors
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.7, duration: 0.6 }}
        className="mb-12 max-w-xs text-primary-foreground/70"
      >
        Discover homemade eggs, honey, bread, and more from local food makers near you.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 3, duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <Button
          onClick={() => navigate("/onboarding")}
          size="lg"
          className="rounded-full bg-secondary px-10 py-6 text-lg font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90 transition-all"
        >
          Get Started
        </Button>
        <button
          onClick={() => navigate("/auth")}
          className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        >
          Already have an account?{" "}
          <span className="font-semibold underline">Sign in</span>
        </button>
      </motion.div>
    </div>
  );
}
