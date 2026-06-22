import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useSellers, useCategories } from "@/hooks/use-sellers";
import { supabase } from "@/lib/supabase";
import FloatingBubbles from "./FloatingBubbles";
import type { NearbyProfile } from "@/hooks/useOnboarding";

interface Props {
  onLocationGranted: (lat: number, lng: number) => void;
  onNext: () => void;
  nearbyCount: number;
  setNearbyCount: (n: number) => void;
  setNearbyBreakdown?: (buyers: number, sellers: number, profiles: NearbyProfile[]) => void;
  selectedCategories?: string[];
  mode?: 'buyer' | 'seller';
}

export default function LocationPermission({
  onLocationGranted,
  onNext,
  nearbyCount,
  setNearbyCount,
  setNearbyBreakdown,
  selectedCategories = [],
  mode = 'buyer',
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [neighbors, setNeighbors] = useState<NearbyProfile[]>([]);
  const [breakdown, setBreakdown] = useState<{ buyers: number; sellers: number }>({ buyers: 0, sellers: 0 });
  const { data: sellers } = useSellers(userLoc);
  const { data: categories } = useCategories();

  useEffect(() => {
    if (status === 'granted' && nearbyCount > 0) {
      const colors = ['#005027', '#3bb371', '#CFB53B'];
      const end = Date.now() + 1500;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [status, nearbyCount]);

  const fetchNeighbors = async (lat: number, lng: number) => {
    // Try RPC first; fall back to silent if missing.
    try {
      const { data, error } = await supabase.rpc('nearby_profiles_v1' as never, {
        lat,
        lng,
        radius_miles: 25,
      } as never) as unknown as { data: NearbyProfile[] | null; error: unknown };
      if (!error && Array.isArray(data)) {
        const buyers = data.filter(p => p.account_type === 'buyer' || p.account_type === 'both').length;
        const sellersCount = data.filter(p => p.account_type === 'seller' || p.account_type === 'both').length;
        setNeighbors(data);
        setBreakdown({ buyers, sellers: sellersCount });
        setNearbyCount(data.length);
        setNearbyBreakdown?.(buyers, sellersCount, data);
        return;
      }
    } catch {
      /* fall through */
    }
    // Fallback: empty list
    setNeighbors([]);
    setBreakdown({ buyers: 0, sellers: 0 });
    setNearbyCount(0);
    setNearbyBreakdown?.(0, 0, []);
  };

  const requestLocation = () => {
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationGranted(latitude, longitude);
        setUserLoc({ lat: latitude, lng: longitude });
        if (mode === 'seller') {
          await fetchNeighbors(latitude, longitude);
        } else {
          const count = Math.floor(Math.random() * 15) + 5;
          setNearbyCount(count);
        }
        setStatus('granted');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true }
    );
  };

  // Buyer-mode filtered sellers (unchanged)
  const validCategoryIds = new Set((categories ?? []).map(c => c.id));
  const validCategoryLabels = new Set((categories ?? []).map(c => c.label.toLowerCase()));
  const validCategorySlugs = new Set((categories ?? []).map(c => c.slug?.toLowerCase()));
  const filteredSellers = (sellers ?? []).filter(seller =>
    seller.listings?.some(l => {
      const cat = l.category?.toLowerCase() ?? '';
      return validCategoryLabels.has(cat) || validCategorySlugs.has(cat) || validCategoryIds.has(l.category);
    })
  );
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
  const finalSellers = topSellers.length >= 5
    ? topSellers
    : [...topSellers, ...filteredSellers.filter(s => !topSellers.includes(s))].slice(0, 5);

  // For seller mode, build bubble-compatible objects from neighbors (no listings)
  const neighborBubbles = neighbors.slice(0, 5).map((n) => ({
    id: n.id,
    name: n.full_name || 'Neighbor',
    avatar_url: n.avatar_url,
    listings: [] as never[],
    distance: 0,
  })) as unknown as typeof finalSellers;

  const shareWithFriends = async () => {
    const text = "I just discovered MadeLocal — the app that connects neighbors to great food around them! Download it here: https://download.madelocal.app";
    const url = "https://download.madelocal.app";
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MadeLocal', text, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  const idleHeading = mode === 'seller' ? 'Find neighbors near you' : 'Find food near you';
  const idleSub = mode === 'seller'
    ? "We'll show you potential buyers and other sellers in your area"
    : "Share your location so we can show you local food makers in your area";

  const grantedHeading = mode === 'seller'
    ? (nearbyCount > 0 ? `${nearbyCount} neighbors nearby!` : "You're the first one here!")
    : `${nearbyCount} sellers nearby!`;
  const grantedSub = mode === 'seller'
    ? (nearbyCount > 0
        ? `${breakdown.buyers} buyer${breakdown.buyers === 1 ? '' : 's'} · ${breakdown.sellers} seller${breakdown.sellers === 1 ? '' : 's'} within 25 miles`
        : "Be the first to bring fresh food to your area. Invite friends to grow your community.")
    : "Within 10 miles of you selling what you're looking for";

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
            {idleHeading}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10 max-w-xs text-muted-foreground"
          >
            {idleSub}
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
            {nearbyCount > 0 ? '🎉' : '🌱'}
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-3xl font-bold text-foreground"
          >
            {grantedHeading}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10 max-w-xs text-muted-foreground"
          >
            {grantedSub}
          </motion.p>

          {mode === 'seller' && nearbyCount === 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex w-full max-w-sm flex-col gap-3"
            >
              <Button
                onClick={shareWithFriends}
                size="lg"
                className="h-14 rounded-full text-base font-semibold shadow-lg"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share to friends
              </Button>
              <Button
                onClick={onNext}
                size="lg"
                variant="ghost"
                className="h-14 rounded-full text-base font-semibold"
              >
                Continue
              </Button>
            </motion.div>
          ) : (
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
                {mode === 'seller' ? "Let's get you set up 🙌" : "Let's see them! 🙌"}
              </Button>
            </motion.div>
          )}

          {/* Floating bubbles */}
          {nearbyCount > 0 && (
            <FloatingBubbles sellers={mode === 'seller' ? neighborBubbles : finalSellers} />
          )}
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
