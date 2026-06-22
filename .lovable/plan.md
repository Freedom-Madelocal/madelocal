# Onboarding decision tree (Buyer vs Seller)

Add a path-picker right after the splash, then branch the existing flow into a buyer track (current behavior, with a card prompt before the feed) and a new seller track (categories → neighbors → almost-there → first listing → pricing → card → success).

## Flow

```text
Splash → "Get Started"
  └─ PathPicker  ("Are you here to primarily: [Sell] [Buy]")
        ├─ Buy  →  Categories → Location → Signup → CardPrompt(buyer) → /discover
        └─ Sell →  CategoriesSeller → NeighborsLocation → SignupSeller
                    → CreateListing (skippable)
                          ├─ Skip → CardPrompt(seller-noListing) → /discover
                          └─ Saved → PricingExplainer
                                       ├─ "Stay as buyer for now" → CardPrompt(buyer) → /discover
                                       └─ "Set up card and go live" → StripeCardSetup
                                             → SellerSuccess (gold confetti + share profile link)
                                             → /discover
```

## Screens

1. **PathPicker** (`src/components/onboarding/PathPicker.tsx`) — Two large pill buttons "I want to sell" / "I want to buy", subline "You can always do both — this just gives you the best onboarding experience." Sets `mode: 'buyer' | 'seller'` in onboarding state.

2. **CategorySelection** — reused. When `mode === 'seller'`, heading swaps to "What do you sell or make?" and subline to "Pick everything you offer".

3. **LocationPermission (seller variant: NeighborsLocation)** — same component, seller copy: "Find neighbors near you" / on grant: "{n} neighbors nearby" with breakdown "{buyers} buyers · {sellers} sellers". Replaces `FloatingBubbles` payload with real nearby profiles (names visible, no addresses). If `n === 0`: "You're the first one here!" + **Share to friends** (Web Share API with text + `https://download.madelocal.app`) and **Continue**.

4. **SignupForm (seller variant)** — adds:
   - `Shop name (optional)` field directly under Name, written to `profiles.shop_name`.
   - `Do you have a referral code?` toggle under SMS consent that expands to a text input, written to `profiles.referral_code`.
   - Primary button label becomes **Set up first listing** for sellers, **Join MadeLocal** for buyers.
   - Also writes `profiles.account_type = 'seller' | 'buyer'` and a `seller` role into `user_roles` when seller.

5. **CreateListing (existing `/sell/new`)** — sellers are routed here post-signup with `?onboarding=1`. On successful publish, redirect to PricingExplainer instead of `/sell`. A close (X) button skips to CardPrompt.

6. **PricingExplainer** (`src/pages/onboarding/PricingExplainer.tsx`) — explains the active-listings-per-month model with examples ("1 listing live any day in a month = 1 listing; 5 different listings live on different days = 5 listings"), first month free, card required for renewal, same card works for marketplace purchases. Two buttons: **Set up card and go live** / **Stay as a buyer for now**.

7. **StripeCardSetup** (`src/pages/onboarding/CardSetup.tsx`) — Stripe Elements card form using existing `getStripePromise` + a new edge function `create-setup-intent` that returns a SetupIntent client secret tied to the user's Stripe customer. On success, marks the seller live (writes `seller_subscriptions` row, first-month-free start/end dates) and continues.

8. **CardPrompt (buyer / seller-skip variants)** (`src/components/onboarding/CardPrompt.tsx`) — "Want to save a card for purchases, or just look around?" → **Save a card** (same SetupIntent flow, no subscription side-effects) or **Just look around** → `/discover`.

9. **SellerSuccess** (`src/pages/onboarding/SellerSuccess.tsx`) — gold confetti, renders the just-published listing card, **Copy profile link** button (`https://madelocal.app/sellers/{id-or-slug}` via `navigator.clipboard`) and **Go to my feed** → `/discover`.

## State + routing

- `useOnboarding` gets `mode`, `shopName`, `referralCode`, `nearbyBreakdown {buyers, sellers, profiles[]}`, `firstListingId`, plus `setMode/setShopName/setReferralCode`.
- `src/pages/Onboarding.tsx` adds steps: `path`, `create-listing-intro` (sellers go straight to `/sell/new?onboarding=1` via `navigate`), `pricing`, `card`, `card-prompt`, `seller-success`. New routes registered in `src/App.tsx` under `/onboarding/pricing`, `/onboarding/card`, `/onboarding/card-prompt`, `/onboarding/seller-success`.

## Backend (uses existing shared marketplace DB)

Assumes these already exist on the shared backend per your note: `profiles.shop_name`, `profiles.referral_code`, `profiles.account_type`, `listing_tiers`, `seller_subscriptions`, and a `stripe_customer_id` linkage. The plan **uses** them; it does not create migrations. If any field is actually missing we'll surface the error at write time and add it then.

New:
- RPC `nearby_profiles_v1(lat, lng, radius_miles)` → `{ id, full_name, avatar_url, account_type, distance_mi }[]`. Privacy: no address/lat/lng returned. Used by NeighborsLocation.
- Edge function `create-setup-intent` → returns Stripe SetupIntent client secret, creates Stripe customer if missing, stores `stripe_customer_id` on profile.
- Edge function `start-seller-trial` → writes `seller_subscriptions` row with `trial_ends_at = now + 30 days`, attaches default payment method.

## Files

**New**
- `src/components/onboarding/PathPicker.tsx`
- `src/components/onboarding/CardPrompt.tsx`
- `src/pages/onboarding/PricingExplainer.tsx`
- `src/pages/onboarding/CardSetup.tsx`
- `src/pages/onboarding/SellerSuccess.tsx`
- `supabase/functions/create-setup-intent/index.ts`
- `supabase/functions/start-seller-trial/index.ts`
- (RPC) `nearby_profiles_v1` migration

**Edited**
- `src/hooks/useOnboarding.ts` — add `mode`, `shopName`, `referralCode`, `nearbyBreakdown`, `firstListingId` + setters.
- `src/pages/Onboarding.tsx` — insert `path` step, branch copy/labels by mode, route sellers to `/sell/new?onboarding=1` after signup, route buyers to CardPrompt after signup.
- `src/components/onboarding/CategorySelection.tsx` — accept `mode` prop, swap heading/sub.
- `src/components/onboarding/LocationPermission.tsx` — accept `mode` prop; in seller mode call RPC for real nearby profiles + breakdown, show "You're the first one here!" empty state with Share + Continue.
- `src/components/onboarding/FloatingBubbles.tsx` — accept generic profile shape (name + avatar, no listings) for seller variant.
- `src/components/onboarding/SignupForm.tsx` — add Shop name + referral code fields, write `shop_name`/`referral_code`/`account_type`, insert `seller` role when seller, swap primary button label/destination by mode.
- `src/pages/CreateListing.tsx` — when `?onboarding=1`: show close (X) that goes to CardPrompt; after publish, navigate to `/onboarding/pricing` with the new listing id.
- `src/App.tsx` — register four new `/onboarding/*` routes.

## Out of scope
- No changes to existing buyer feed, listings, or seller dashboard outside the onboarding path.
- No new tier pricing numbers — PricingExplainer reads from `listing_tiers` rather than hard-coding.
- No SMS/notification changes beyond the existing consent checkbox.
