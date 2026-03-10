

## Plan: Fix Categories and Hide Addresses

### Problem 1: Categories
The `useCategories` hook already fetches from the `categories` table in the Tribekiller database. Categories are loading correctly (Baked, Eggs, Produce, etc.). They auto-sync since they're fetched live. No change needed here -- categories already come from the shared backend.

However, the category filter uses `cat.slug` to match against `listing.category`, and the listing categories in the DB use mixed formats (`Baked`, `Honey and Syrup`, `dressing--sauce`, `natural-products`, `produce`, `drinks`, `Roasted`, `art`). Need to verify the `slug` values in the categories table match these listing category strings. If they don't match, filtering will break.

### Problem 2: Addresses Exposed as Seller Names
The code at line 121 of `use-sellers.ts` does:
```
name: profile?.name || sellerListings[0]?.location?.split(",")[0] || "Local Seller"
```
The profiles table uses `full_name` (not `name`), so `profile?.name` is always undefined, causing it to fall back to the listing's `location` field (which is the street address).

Additionally, `seller.address` is displayed on the SellerProfile page hero section, and listing `location` fields are exposed throughout.

### Changes

**1. `src/hooks/use-sellers.ts`** -- Fix profile field mapping:
- Use `full_name` instead of `name` from profiles (matching actual DB schema)
- Use `shop_name` as a display name preference over `full_name`
- Use `shop_avatar_url` as avatar fallback
- Remove `address` / `location` from the seller object entirely (set to null) -- addresses should never be visible until explicitly shared via messaging
- Remove `location` exposure from listing data in the seller card context
- Keep `latitude`/`longitude` for distance calculations only (these don't reveal exact addresses)

**2. `src/pages/SellerProfile.tsx`**:
- Remove the address/location display from the hero section (lines 68-73)
- Remove the "Get Directions" button (lines 185-191) since address is hidden until shared

**3. `src/components/discover/SellerCard.tsx`**:
- Ensure no address/location text is displayed (currently it only shows distance, which is fine)

**4. `src/hooks/use-sellers.ts` -- `useCategories`**:
- Already fetching from DB. Verify it works; no structural changes needed.

### Security Note
Addresses and locations are still returned from the Supabase `listings` query. Ideally, a database view should exclude `location` from public listing reads, but for now we'll strip it client-side and note that server-side protection should be added later.

