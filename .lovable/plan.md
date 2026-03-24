

## Fix: Stop forcing onboarding on authenticated users

**Problem**: The `useEffect` in `Index.tsx` redirects logged-in users to `/onboarding` whenever their profile has `onboarding_completed` as false/null AND they have no buyer categories. This was meant for first-time onboarding but fires every time — even for users who simply never picked categories or whose profile flag wasn't set.

**Solution**: Remove the automatic onboarding redirect from `Index.tsx` entirely. Onboarding should only happen when:
- An unauthenticated user clicks "Get Started" on the splash gate
- A logged-in user explicitly taps "Update My Interests" in Profile

**Changes**:

1. **`src/pages/Index.tsx`** — Remove the `onboardingComplete` query (lines 35-47), remove the redirect `useEffect` (lines 50-59), and remove the unused `useEffect` import if no longer needed. The `buyerCats` query stays since it's used for feed prioritization.

2. **`src/pages/Onboarding.tsx`** — No changes needed; it already handles both authenticated and unauthenticated users correctly.

3. **`src/App.tsx`** — No changes needed; `/` already shows `SplashGate` for unauthenticated users and `Index` for authenticated ones.

**Result**:
- Unauthenticated user → sees splash gate with "Sign In" / "Get Started"
- "Get Started" → `/onboarding` (categories → location → signup)
- Authenticated user → sees discover feed immediately, no forced redirect
- "Update My Interests" in Profile → resets flag and navigates to `/onboarding` (as already built)

