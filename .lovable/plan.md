

## Align App with Tribekiller Marketplace + Add Mobile Checkout

Refactor the app's discovery to be **listings-first** (matching Tribekiller's web `/explore`), pull farmstands and farmers markets from the same backend, and add a real checkout flow with Apple Pay, Google Pay, card, and cash on pickup.

### What stays untouched
Seller dashboard, Go Live, Analytics, Onboarding/Auth, Profile, Following.

### What changes

#### 1. Data layer — match Tribekiller's schema

Replace the "group listings into seller cards" logic with the actual marketplace shape Tribekiller uses.

**New hooks (mirror Tribekiller exactly):**
- `use-marketplace-listings.ts` — selects from `listings` joined with `listing_types(name, inventory_type)` and `public_profiles(shop_name, shop_avatar_url, delivery_price, delivery_min_qty, marketplace_enabled, contact_url, contact_phone, is_unclaimed)`. Returns rows in the same `MarketplaceListingRow` shape as the web app.
- `use-farmstands.ts` — reads `public.farmstands` (active only) with distance calc.
- `use-farmers-markets.ts` — reads `public.farmers_markets` + `farmers_market_photos`.
- `use-categories.ts` — reads `categories` table (already partially exists).
- `use-cart.ts` — sessionStorage-backed cart (one item from one seller, or grouped multi-seller, matching web).

**Deprecated:** the seller-grouping logic in `use-sellers.ts` (kept only for `useSellerById` on profile pages).

#### 2. Discover feed (`Index.tsx`) — listings-first

```text
┌─────────────────────────────┐
│ Logo      [📍 5 mi chip]    │
│ [Search bar]                │
│ [All][🥚][🍞][🥛]…  (chips) │
│ ─────────────────────────── │
│ [Listings|Farmstands|Markets] ← segment toggle
│ ─────────────────────────── │
│ ┌───┐ Title              $X │
│ │img│ Seller · 0.8 mi       │
│ └───┘ "Pickup nearby"       │
│ ┌───┐ …                     │
└─────────────────────────────┘
```

- New `ListingCard` component (mirrors web): image, title, price, seller name+avatar, distance, low-stock badge, "Delivery available" pill, unclaimed badge.
- Tap → `/listing/:id` (new page).
- Segment toggle (chips) switches the feed between Listings, Farmstands, Markets — all driven by location radius and category filter.
- Live markets banner (already exists in Tribekiller as `LiveMarketButton`) added at top when any are live nearby.

#### 3. New pages

| Route | Purpose |
|-------|---------|
| `/listing/:id` | Listing detail — images carousel, price, description, seller mini-card with rating, distance, "Add to cart" / "Message seller" buttons. Hides "Add to cart" if `marketplace_enabled = false` or `price = 0`. |
| `/farmstand/:id` | Farmstand detail with map pin, photos, claim/follow. |
| `/market/:id` | Farmers market detail — schedule, photos, address, directions. |
| `/cart` | Mobile-optimized cart, grouped by seller, pickup vs delivery toggle. |
| `/checkout` | Native checkout (see §4). |
| `/checkout/success` | Order confirmation. |

#### 4. Checkout — Apple Pay, Google Pay, Card, Cash

Reuses Tribekiller's existing edge functions: `create-checkout-payment-intent` and `confirm-checkout-payment` (no new backend work).

- `@stripe/stripe-js` + `@stripe/react-stripe-js` already in the web app's pattern — install in this project.
- **PaymentRequest API** (Stripe's) auto-detects Apple Pay on iOS Safari/Capacitor WebView and Google Pay on Android. Falls back to card form when neither is available.
- **Cash on pickup** — uses Tribekiller's `useCashOrder` flow when the seller has cash payments enabled.
- All payment UI reuses Tribekiller's component patterns: `PaymentMethodSelector`, `OrderSummary`, `DeliveryAddressSection`, `GuestInfoForm`, `CashPaymentSection`, `CheckoutForm`.
- Capacitor-aware: on native iOS, Apple Pay presents the system sheet via Stripe's PaymentRequest. On native Android, Google Pay presents the Google Pay sheet.

#### 5. Stripe configuration

- Read publishable key + mode (sandbox/live) from Tribekiller via existing edge function `get-stripe-config` pattern (or hardcode the publishable key — safe to expose).
- Hook `use-stripe-mode` and `lib/stripe-config.ts` cloned from Tribekiller.

### Files

**New files**
- `src/hooks/use-marketplace-listings.ts`
- `src/hooks/use-farmstands.ts`
- `src/hooks/use-farmers-markets.ts`
- `src/hooks/use-cart.ts`
- `src/hooks/use-stripe-mode.ts`
- `src/hooks/use-cash-order.ts`
- `src/lib/stripe-config.ts`
- `src/components/listings/ListingCard.tsx`
- `src/components/listings/ListingImageCarousel.tsx`
- `src/components/farmstand/FarmstandCard.tsx`
- `src/components/markets/MarketCard.tsx`
- `src/components/checkout/PaymentMethodSelector.tsx`
- `src/components/checkout/OrderSummary.tsx`
- `src/components/checkout/DeliveryAddressSection.tsx`
- `src/components/checkout/GuestInfoForm.tsx`
- `src/components/checkout/CashPaymentSection.tsx`
- `src/components/checkout/CheckoutForm.tsx`
- `src/pages/ListingDetail.tsx`
- `src/pages/Farmstand.tsx`
- `src/pages/FarmersMarket.tsx`
- `src/pages/Cart.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/CheckoutSuccess.tsx`

**Edited files**
- `src/pages/Index.tsx` — listings-first feed with segment toggle
- `src/components/discover/SellerCard.tsx` — repurpose as smaller variant on seller profile, or deprecate
- `src/App.tsx` — new routes
- `package.json` — add `@stripe/stripe-js`, `@stripe/react-stripe-js`

### Capacitor compatibility (per saved memory)
- Stripe PaymentRequest works inside Capacitor WebView for both Apple Pay (iOS) and Google Pay (Android) — no extra plugin needed.
- All new pages use safe-area insets (`pt-safe`, `pb-safe` Tailwind utilities or `env(safe-area-inset-*)`).
- No web-only APIs without fallbacks.

### Out of scope (call out for later)
- Refunds, payouts, Connect onboarding (already on Tribekiller side — surfaced via Sell page only).
- Admin tools (stay web-only).
- Editing listings (sellers continue to edit on the web app for now; can be added later).

### Implementation order
1. Schema-aligned hooks (listings, farmstands, markets, categories).
2. New `ListingCard` + listings-first `Index.tsx` with segment toggle.
3. `ListingDetail` + cart + checkout pages, wired to Tribekiller edge functions.
4. Farmstand + Market detail pages.
5. Apple Pay / Google Pay via Stripe PaymentRequest + cash-on-pickup branch.
6. Polish: low-stock pills, unclaimed badges, distance formatting.

