

## Pull Onboarding Flow from Local Bite Connect

The [Local Bite Connect](/projects/a55154f7-e46b-4cf6-946e-9b8901d6f00d) project has a 4-step onboarding flow: Splash -> Category Selection -> Location Permission -> Signup. We will port it into this project with the following adaptations:

### Files to Create/Copy

1. **`src/hooks/useOnboarding.ts`** -- State machine hook (copy as-is, add OnboardingState type inline)

2. **`src/pages/Onboarding.tsx`** -- Orchestrator page (copy as-is, adjust navigation to go to `/` on complete)

3. **`src/components/onboarding/SplashScreen.tsx`** -- Adapt branding from "FreshFind" to "MadeLocal", use existing `logo-full.png` asset, link "Already have an account?" to `/auth`

4. **`src/components/onboarding/CategorySelection.tsx`** -- Update Supabase import from `@/integrations/supabase/client` to `@/lib/supabase`. Categories already come from the shared DB.

5. **`src/components/onboarding/LocationPermission.tsx`** -- Remove `canvas-confetti` dependency (replace with a simple emoji celebration to avoid adding a new package), keep geolocation logic

6. **`src/components/onboarding/SignupForm.tsx`** -- Update Supabase import, rebrand "FreshFind" to "MadeLocal", use existing `useAuth` hook's `signUp` method instead of raw `supabase.auth.signUp`, keep buyer_categories and user_roles inserts

### Routing Changes

7. **`src/App.tsx`** -- Add `/onboarding` route pointing to `Onboarding` page. Change `/` default to redirect unauthenticated users to `/onboarding` (authenticated users go to `Index`).

### Adaptations Summary
- All Supabase imports changed to `@/lib/supabase`
- Branding changed from "FreshFind" to "MadeLocal"
- Logo uses `@/assets/logo-full.png`
- No new dependencies needed (confetti removed, framer-motion already installed)
- Sign-in link points to existing `/auth` page
- On completion, navigate to `/` (discover feed)

