import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useSellers, useCategories } from "@/hooks/use-sellers";
import FloatingBubbles from "./FloatingBubbles";

interface Props {
  onLocationGranted: (lat: number, lng: number) => void;
  onNext: () => void;
  nearbyCount: number;
  setNearbyCount: (n: number) => void;
  selectedCategories?: string[];
}

export default function LocationPermission({ onLocationGranted, onNext, nearbyCount, setNearbyCount, selectedCategories = [] }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const { data: sellers } = useSellers(userLoc);
  const { data: categories } = useCategories();

  useEffect(() => {
    if (status === 'granted') {
      const colors = ['#005027', '#3bb371', '#CFB53B'];
      const end = Date.now() + 1500;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
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

  // Get valid category IDs (active + not hidden from explore)
  const validCategoryIds = new Set((categories ?? []).map(c => c.id));
  const validCategoryLabels = new Set((categories ?? []).map(c => c.label.toLowerCase()));
  const validCategorySlugs = new Set((categories ?? []).map(c => c.slug?.toLowerCase()));

  // Filter sellers to only those with listings in valid categories
  const filteredSellers = (sellers ?? []).filter(seller =>
    seller.listings?.some(l => {
      const cat = l.category?.toLowerCase() ?? '';
      return validCategoryLabels.has(cat) || validCategorySlugs.has(cat) || validCategoryIds.has(l.category);
    })
  );

  // Map selected category IDs to labels/slugs for matching against listing.category
  const selectedLabels = new Set(
    (categories ?? [])
      .filter(c => selectedCategories.includes(c.id))
      .flatMap(c => [c.label.toLowerCase(), c.slug?.toLowerCase()].filter(Boolean))
  );
  const matchingSelected = filteredSellers.filter(seller =>
    seller.listings?.some(l => selectedLabels.has(l.category?.toLowerCase() ?? ''))
  );
  const nonMatching = filteredSellers.filter(seller =>
    !seller.listings?.some(l => selectedLabels.has(l.category?.toLowerCase() ?? ''))
  );
  const topSellers = [...matchingSelected, ...nonMatching]
    .filter(s => (s.distance ?? 0) <= 10 || !userLoc)
    .slice(0, 5);

  // If not enough within 10 miles, fill from farther away
  const finalSellers = topSellers.length >= 5
    ? topSellers
    : [...topSellers, ...filteredSellers.filter(s => !topSellers.includes(s))].slice(0, 5);

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
          <FloatingBubbles sellers={finalSellers} />
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
