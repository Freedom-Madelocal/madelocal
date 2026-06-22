import { useState } from "react";

export type OnboardingMode = 'buyer' | 'seller';

export interface NearbyProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  account_type: 'buyer' | 'seller' | 'both' | null;
}

export interface OnboardingState {
  step: 'splash' | 'path' | 'categories' | 'location' | 'signup' | 'done';
  mode: OnboardingMode;
  selectedCategories: string[];
  location: { lat: number; lng: number } | null;
  nearbyCount: number;
  nearbyBuyers: number;
  nearbySellers: number;
  nearbyProfiles: NearbyProfile[];
  shopName: string;
  referralCode: string;
  firstListingId: string | null;
}

const initialState: OnboardingState = {
  step: 'path',
  mode: 'buyer',
  selectedCategories: [],
  location: null,
  nearbyCount: 0,
  nearbyBuyers: 0,
  nearbySellers: 0,
  nearbyProfiles: [],
  shopName: '',
  referralCode: '',
  firstListingId: null,
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setStep = (step: OnboardingState['step']) =>
    setState(prev => ({ ...prev, step }));

  const setMode = (mode: OnboardingMode) =>
    setState(prev => ({ ...prev, mode }));

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

  const setNearbyBreakdown = (buyers: number, sellers: number, profiles: NearbyProfile[]) =>
    setState(prev => ({
      ...prev,
      nearbyBuyers: buyers,
      nearbySellers: sellers,
      nearbyProfiles: profiles,
      nearbyCount: buyers + sellers,
    }));

  const setShopName = (shopName: string) =>
    setState(prev => ({ ...prev, shopName }));

  const setReferralCode = (referralCode: string) =>
    setState(prev => ({ ...prev, referralCode }));

  const setFirstListingId = (id: string | null) =>
    setState(prev => ({ ...prev, firstListingId: id }));

  return {
    state,
    setStep,
    setMode,
    toggleCategory,
    setLocation,
    setNearbyCount,
    setNearbyBreakdown,
    setShopName,
    setReferralCode,
    setFirstListingId,
  };
}
