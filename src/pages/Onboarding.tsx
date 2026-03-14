import { useOnboarding } from "@/hooks/useOnboarding";
import SplashScreen from "@/components/onboarding/SplashScreen";
import CategorySelection from "@/components/onboarding/CategorySelection";
import LocationPermission from "@/components/onboarding/LocationPermission";
import SignupForm from "@/components/onboarding/SignupForm";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const { state, setStep, toggleCategory, setLocation, setNearbyCount } = useOnboarding();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleComplete = () => {
    setStep('done');
    navigate('/discover');
  };

  const handleCompleteExisting = async () => {
    if (!user) return;
    try {
      // Save buyer categories
      if (state.selectedCategories.length > 0) {
        const rows = state.selectedCategories.map(cat => ({
          user_id: user.id,
          category_id: cat,
        }));
        await supabase.from("buyer_categories").upsert(rows, { onConflict: "user_id,category_id" });
      }

      // Update profile with location and mark onboarding complete
      const updates: Record<string, any> = { onboarding_completed: true };
      if (state.location) {
        updates.latitude = state.location.lat;
        updates.longitude = state.location.lng;
      }
      await supabase.from("profiles").update(updates).eq("user_id", user.id);

      setStep('done');
      navigate('/discover');
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  // For authenticated users, after location step skip signup
  const handleLocationNext = () => {
    if (user) {
      handleCompleteExisting();
    } else {
      setStep('signup');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {state.step === 'splash' && (
          <motion.div key="splash" exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <SplashScreen onNext={() => setStep('categories')} />
          </motion.div>
        )}
        {state.step === 'categories' && (
          <motion.div key="categories" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <CategorySelection
              selectedCategories={state.selectedCategories}
              onToggle={toggleCategory}
              onNext={() => setStep('location')}
            />
          </motion.div>
        )}
        {state.step === 'location' && (
          <motion.div key="location" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <LocationPermission
              onLocationGranted={setLocation}
              onNext={handleLocationNext}
              nearbyCount={state.nearbyCount}
              setNearbyCount={setNearbyCount}
              selectedCategories={state.selectedCategories}
            />
          </motion.div>
        )}
        {state.step === 'signup' && !user && (
          <motion.div key="signup" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <SignupForm
              selectedCategories={state.selectedCategories}
              location={state.location}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
