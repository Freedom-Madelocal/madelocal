import { useOnboarding } from "@/hooks/useOnboarding";
import SplashScreen from "@/components/onboarding/SplashScreen";
import CategorySelection from "@/components/onboarding/CategorySelection";
import LocationPermission from "@/components/onboarding/LocationPermission";
import SignupForm from "@/components/onboarding/SignupForm";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function Onboarding() {
  const { state, setStep, toggleCategory, setLocation, setNearbyCount } = useOnboarding();
  const navigate = useNavigate();

  const handleComplete = () => {
    setStep('done');
    navigate('/');
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
              onNext={() => setStep('signup')}
              nearbyCount={state.nearbyCount}
              setNearbyCount={setNearbyCount}
            />
          </motion.div>
        )}
        {state.step === 'signup' && (
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
