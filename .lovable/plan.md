

## Onboarding for Existing Users (Skip Signup)

**Idea**: When an already-authenticated user hasn't completed onboarding (no `buyer_categories` saved), redirect them to the onboarding flow but skip the signup step — they only go through Categories → Location → done.

### Changes

1. **`src/pages/Index.tsx`** — After fetching `buyerCats`, if the user is logged in and has zero buyer categories, redirect to `/onboarding`.

2. **`src/hooks/useOnboarding.ts`** — Add initial step as `'categories'` (already the default — good).

3. **`src/pages/Onboarding.tsx`** — Check if user is already authenticated via `useAuth()`. If authenticated:
   - After the location step, skip signup — go straight to saving `buyer_categories` to the DB and navigating to `/discover`.
   - Add a `handleCompleteExisting` path that inserts `buyer_categories` for the current user and marks `onboarding_completed: true` on their profile, then navigates to `/discover`.

4. **`src/hooks/useOnboarding.ts`** — No type changes needed; the `'signup'` step simply won't be reached for authenticated users.

### Flow

```text
Existing user logs in → /discover
  → buyerCats query returns [] → redirect to /onboarding
  → Categories → Location → save categories to DB → /discover
  (signup step skipped entirely)
```

### Key detail
- The location step's `onNext` will check auth state: if logged in, save categories + navigate; if not, go to signup step as before.
- Add `onboarding_completed` profile update so the redirect doesn't loop.

