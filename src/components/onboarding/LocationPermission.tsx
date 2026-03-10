import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useSellers } from "@/hooks/use-sellers";
import FloatingBubbles from "./FloatingBubbles";

interface Props {
  onLocationGranted: (lat: number, lng: number) => void;
  onNext: () => void;
  nearbyCount: number;
  setNearbyCount: (n: number) => void;
}

export default function LocationPermission({ onLocationGranted, onNext, nearbyCount, setNearbyCount }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const { data: sellers } = useSellers(userLoc);

  useEffect(() => {
    if (status === 'granted') {
      const colors = ['#00C853', '#FFD600', '#FF6D00', '#D500F9', '#00B0FF', '#FF1744', '#76FF03'];
      confetti({
        particleCount: 120,
        spread: 160,
        origin: { x: 0.5, y: 0 },
        colors,
        gravity: 0.3,
        ticks: 400,
        startVelocity: 35,
        scalar: 1.2,
      });
    }
  }, [status]);

  const requestLocation = () => {
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationGranted(latitude, longitude);
        setUserLoc({ lat: latitude, lng: longitude });
        const count = Math.floor(Math.random() * 15) + 5;
        setNearbyCount(count);
        setStatus('granted');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true }
    );
  };

  const topSellers = (sellers ?? []).slice(0, 5);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {status === 'idle' || status === 'loading' ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
          >
            <MapPin className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-3xl font-bold text-foreground"
          >
            Find food near you
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10 max-w-xs text-muted-foreground"
          >
            Share your location so we can show you local food makers in your area
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={requestLocation}
              size="lg"
              disabled={status === 'loading'}
              className="rounded-full px-10 py-6 text-lg font-semibold shadow-lg"
            >
              {status === 'loading' ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-5 w-5" />
              )}
              Share Location
            </Button>
          </motion.div>
        </>
      ) : status === 'granted' ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mb-6 text-6xl"
          >
            🎉
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-3xl font-bold text-foreground"
          >
            {nearbyCount} sellers nearby!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10 text-muted-foreground"
          >
            Within 10 miles of you selling what you're looking for
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onNext}
              size="lg"
              className="rounded-full bg-secondary px-10 py-6 text-lg font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90"
            >
              Let's see them! 🙌
            </Button>
          </motion.div>

          {/* Floating seller bubbles */}
          <FloatingBubbles sellers={topSellers} />
        </>
      ) : (
        <>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-3 text-2xl font-bold text-foreground"
          >
            Location access denied
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-muted-foreground"
          >
            Please enable location in your browser settings and try again.
          </motion.p>
          <Button onClick={requestLocation} variant="outline" className="rounded-full">
            Try Again
          </Button>
        </>
      )}
    </div>
  );
}
