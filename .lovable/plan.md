

## Post-Onboarding Discover Feed with Category Prioritization

**What**: After onboarding, navigate to `/discover` and show sellers sorted by: (1) matching user's chosen categories within 10mi, then (2) remaining sellers within 10mi from other categories.

**Changes**:

1. **`src/pages/Onboarding.tsx`** — Change `navigate('/')` → `navigate('/discover')` in `handleComplete`.

2. **`src/hooks/use-sellers.ts`** — Add a `preferredCategories` parameter to `useSellers`:
   - Accept optional `string[]` of preferred category IDs
   - After fetching and distance-filtering (keep only ≤10mi when location is available), partition results into two groups: sellers with at least one listing matching a preferred category, and the rest
   - Concatenate preferred-first, then others; within each group, sort by distance

3. **`src/pages/Index.tsx`** — Fetch the logged-in user's `buyer_categories` from Supabase and pass them to `useSellers`. Add a new hook call or inline query:
   ```ts
   const { data: buyerCats } = useQuery({
     queryKey: ["buyer-categories", user?.id],
     enabled: !!user,
     queryFn: async () => {
       const { data } = await supabase.from("buyer_categories").select("category_id").eq("user_id", user!.id);
       return data?.map(r => r.category_id) ?? [];
     },
   });
   ```
   Pass `buyerCats` to `useSellers` for prioritized sorting. Also apply 10mi radius filter when location is present.

4. **`src/App.tsx`** — Ensure `/discover` route works for authenticated users (already does via `<Index />`).

