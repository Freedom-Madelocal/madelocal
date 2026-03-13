

## Fix: Pass `full_name` in user metadata on signup

**Problem**: The database trigger reads `raw_user_meta_data->>'full_name'`, but both signup flows pass `data: { name: ... }` — so the profile name is always null.

**Changes**:

1. **`src/components/onboarding/SignupForm.tsx`** (line 44) — Change `{ name: name.trim() }` → `{ full_name: name.trim() }`

2. **`src/hooks/use-auth.tsx`** (line 45) — Change `{ name }` → `{ full_name: name }`

3. **`src/pages/Auth.tsx`** — After successful login, check if the user's profile has a null `full_name` and backfill it using both `supabase.auth.updateUser` and a direct profile update. This fixes existing users who signed up before the fix.

