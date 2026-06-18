## Switch farmstands source to `farmstand_pages`

### The bug (confirmed)
Same Supabase project (`kygqkcnrxxsauibhlvno`), wrong table.

| Table | Rows | Used by |
|---|---|---|
| `farmstands` | 2 | this mobile app (`useFarmstandsMP`) |
| `farmstand_pages` | **358 active** | buy.madelocal.com / web |

Claim state also moved: web uses `claimed_at IS NOT NULL` + `admin_user_id`, not `claimed_by`.

### Changes

**1. `src/hooks/use-farmstands-mp.ts` — rewrite query**
- `.from("farmstand_pages")` instead of `farmstands`
- Select: `id, slug, name, city, state, latitude, longitude, logo_url, menu_image_url, food_types, schedule, is_stocked, is_active, claimed_at, admin_user_id, created_via`
- Filter `is_active = true`, drop rows with null lat/lng
- New `FarmstandRow` shape with `slug`, `logo_url`, derived `claimed: boolean = claimed_at != null`, derived `location: string = [city, state].filter(Boolean).join(", ")`

**2. `src/components/farmstand/FarmstandCard.tsx`**
- Use `row.logo_url` (fallback to placeholder) instead of `image_url`
- "Unclaimed" badge driven by `!row.claimed` instead of `!row.claimed_by`
- `Link to={'/farmstand/' + (row.slug ?? row.id)}` so deep links match the web's slug URLs

**3. `src/pages/Farmstand.tsx`**
- Look up by `slug` first, fall back to `id` (route stays `/farmstand/:id`)
- Render `logo_url`, `city, state`, `food_types` chips, `schedule` block, "Unclaimed" if `claimed_at` is null
- Distance + Google Maps directions unchanged
- "About" pulls from `description` if present (column exists on `farmstand_pages`)

**4. Distance/radius math in `Index.tsx`**
- No change needed — it already consumes whatever `useFarmstandsMP` returns and just reads `latitude`/`longitude`. New rows have lat/lng so the 25 mi radius will now include the real nearby ones.

### Out of scope (call out, don't do)
- Claim flow from mobile (web handles it at `/farmstands/:slug/claim`). Mobile keeps showing the badge only.
- Editing/creating farmstand pages from mobile.
- Migrating the 2 legacy `farmstands` rows — they're duplicates of pages already in `farmstand_pages` and can be ignored.

### Files touched
- `src/hooks/use-farmstands-mp.ts` (rewrite)
- `src/components/farmstand/FarmstandCard.tsx` (field rename + slug link)
- `src/pages/Farmstand.tsx` (field rename + slug lookup + richer body)

### Verification after build
- Discover → Farmstands tab in 25 mi radius should show the real count near Granbury (likely >2).
- Cards that have `claimed_at` set will no longer show the "Unclaimed" badge.
- Tapping a card opens the detail with logo, schedule, food types.
