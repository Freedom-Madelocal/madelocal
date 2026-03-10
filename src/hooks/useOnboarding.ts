import { useState } from "react";

export interface OnboardingState {
  step: 'splash' | 'categories' | 'location' | 'signup' | 'done';
  selectedCategories: string[];
  location: { lat: number; lng: number } | null;
  nearbyCount: number;
}

const initialState: OnboardingState = {
  step: 'categories',
  selectedCategories: [],
  location: null,
  nearbyCount: 0,
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setStep = (step: OnboardingState['step']) =>
    setState(prev => ({ ...prev, step }));

  const toggleCategory = (id: string) =>
    setState(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(id)
        ? prev.selectedCategories.filter(c => c !== id)
        : [...prev.selectedCategories, id],
    }));

  const setLocation = (lat: number, lng: number) =>
    setState(prev => ({ ...prev, location: { lat, lng } }));

  const setNearbyCount = (count: number) =>
    setState(prev => ({ ...prev, nearbyCount: count }));

  return { state, setStep, toggleCategory, setLocation, setNearbyCount };
}
