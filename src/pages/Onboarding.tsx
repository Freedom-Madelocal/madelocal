import { useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import SplashScreen from "@/components/onboarding/SplashScreen";
import PathPicker from "@/components/onboarding/PathPicker";
import CategorySelection from "@/components/onboarding/CategorySelection";
import LocationPermission from "@/components/onboarding/LocationPermission";
import SignupForm from "@/components/onboarding/SignupForm";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const {
    state,
    setStep,
    setMode,
    toggleCategory,
    setLocation,
    setNearbyCount,
    setNearbyBreakdown,
    setShopName,
    setReferralCode,
  } = useOnboarding();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = () => {
    setStep('done');
  };

  const handleCompleteExisting = async () => {
    if (!user || isCompleting) return;
    setIsCompleting(true);

    try {
      const updates: Record<string, unknown> = {
        onboarding_completed: true,
        account_type: state.mode,
      };
      if (state.location) {
        updates.latitude = state.location.lat;
        updates.longitude = state.location.lng;
      }
      if (state.mode === 'seller' && state.shopName) updates.shop_name = state.shopName;
      if (state.referralCode) updates.referral_code = state.referralCode;

      const { error: clearError } = await supabase
        .from("buyer_categories")
        .delete()
        .eq("user_id", user.id);
      if (clearError) throw clearError;

      if (state.selectedCategories.length > 0) {
        const { error: insertError } = await supabase.from("buyer_categories").insert(
          state.selectedCategories.map((categoryId) => ({
            user_id: user.id,
            category_id: categoryId,
          }))
        );
        if (insertError) throw insertError;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updates as never)
        .or(`id.eq.${user.id},external_id.eq.${user.id}`);
      if (profileError && !/column .* does not exist/i.test(profileError.message)) {
        console.warn('profile update warning', profileError.message);
      }

      setStep('done');
      if (state.mode === 'seller') {
        navigate('/sell/new?onboarding=1', { replace: true });
      } else {
        navigate('/onboarding/card-prompt', { replace: true });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Could not save onboarding", description: msg, variant: "destructive" });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleLocationNext = async () => {
    if (user) {
      await handleCompleteExisting();
    } else {
      setStep('signup');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {state.step === 'splash' && (
          <motion.div key="splash" exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <SplashScreen onNext={() => setStep('path')} />
          </motion.div>
        )}
        {state.step === 'path' && (
          <motion.div key="path" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <PathPicker onPick={(m) => { setMode(m); setStep('categories'); }} />
          </motion.div>
        )}
        {state.step === 'categories' && (
          <motion.div key="categories" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <CategorySelection
              selectedCategories={state.selectedCategories}
              onToggle={toggleCategory}
              onNext={() => setStep('location')}
              mode={state.mode}
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
              setNearbyBreakdown={setNearbyBreakdown}
              selectedCategories={state.selectedCategories}
              mode={state.mode}
            />
          </motion.div>
        )}
        {state.step === 'signup' && !user && (
          <motion.div key="signup" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
            <SignupForm
              selectedCategories={state.selectedCategories}
              location={state.location}
              mode={state.mode}
              shopName={state.shopName}
              referralCode={state.referralCode}
              setShopName={setShopName}
              setReferralCode={setReferralCode}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
