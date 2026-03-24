

## Integrate Tribekiller `get-seller-analytics` Edge Function

**What**: Replace the hardcoded dummy analytics on the Sell page with real data from the Tribekiller backend's `get-seller-analytics` edge function, falling back to placeholder values when the user isn't logged in or the call fails.

### API Details

- **Call**: `supabase.functions.invoke('get-seller-analytics')` (no body needed; JWT identifies the seller)
- **Response shape**: `profile_views`, `search_appearances`, `contact_clicks`, `followers` -- each with `total_30d`, `prev_30d`, `change_pct` (followers has `total` and `engaged_30d` instead)

### Changes

1. **New hook `src/hooks/use-seller-analytics.ts`**
   - Uses `useQuery` + `useAuth` to call `supabase.functions.invoke('get-seller-analytics')`
   - Returns typed analytics data, `isLoading`, and `error`
   - Only enabled when user is authenticated
   - Refetches on window focus, stale time ~5 minutes

2. **`src/pages/Sell.tsx`**
   - Import the new hook and `useAuth`
   - Remove the static `stats` array constant
   - Build the `stats` array dynamically from hook data, formatting numbers with `toLocaleString()` and change as `+X%` / `-X%`
   - For followers: set `extra.value` to `engaged_30d` from the response
   - While loading, show skeleton placeholders in the analytics cards
   - If user is not authenticated or fetch fails, show dash values (`"--"`) with no change percentage

### Type Definition

```ts
interface SellerAnalytics {
  profile_views: { total_30d: number; prev_30d: number; change_pct: number };
  search_appearances: { total_30d: number; prev_30d: number; change_pct: number };
  contact_clicks: { total_30d: number; prev_30d: number; change_pct: number };
  followers: { total: number; engaged_30d: number };
}
```

### Fallback Behavior
- Not logged in: analytics section shows static dashes or a prompt to log in
- API error / edge function not yet deployed: graceful fallback to `"--"` values with no crash

