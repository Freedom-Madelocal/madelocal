

# MadeLocal — Local Food Discovery App

## Overview
A premium, mobile-first app for discovering and connecting with local food sellers. Clean & minimal design with subtle motion effects, bottom tab navigation, and a "Tinder for farmers market" feel.

---

## Phase 1: Foundation & Design System

### Custom Theme
- Clean white backgrounds, soft grays, subtle green accents for freshness
- Modern sans-serif typography (Inter or similar)
- Rounded cards with soft shadows, smooth micro-animations
- Mobile-first responsive layout (375px primary breakpoint)

### App Shell
- Bottom tab navigation: **Discover**, **Following**, **Sell**, **Profile**
- Smooth page transitions with low-motion scroll effects
- Global search bar component

---

## Phase 2: Connect to Existing Supabase Backend
- Wire up to your existing Lovable project's Supabase instance for seller profiles, listings, users, etc.
- Set up React Query hooks for data fetching
- Real-time subscriptions for live updates (availability, live streams)

---

## Phase 3: Core Screens

### Screen 1 — Discover (Home)
- Search bar at top ("Eggs, bread, honey...")
- Horizontal scrolling category filters (Eggs, Bread, Produce, Meat, Honey, Dairy, Farm Stands)
- Vertical card feed showing sellers with photo, product, distance, availability, follow button
- Tap card → navigates to Seller Profile
- Pull-to-refresh and infinite scroll

### Screen 2 — Seller Profile
- Hero photo with seller name, verified badge, distance
- Action buttons: Follow, Message, Live Now indicator
- About section with bio
- Products list with pricing and availability
- Contact options: Message, Venmo link, Directions
- Optional: Live stream embed, podcast episode

### Screen 3 — Following Feed
- Chronological updates from followed sellers
- Cards showing restocks, live streams, inventory updates
- Tap to navigate to seller profile or join live

### Screen 4 — Seller Dashboard (Sell Tab)
- Availability toggle (on/off)
- Go Live button (triggers Mux stream)
- Message buyers interface
- Analytics cards: Profile Views, Search Appearances, Contact Clicks, Followers
- Sales tracker (future marketplace prep)

### Screen 5 — Events
- Event cards with photo, title, date, location
- QR code generation for event entry
- Registration flow (download app → register → get invite)

### Screen 6 — Community Listings
- Aggregated farm stands and community sellers
- "Claim Listing" button to convert to seller account

### Screen 7 — Profile
- User info and avatar
- Saved Sellers list
- "Support Local" premium membership card
- Settings (notifications, location, account)

---

## Phase 4: Onboarding Flow
- 2-3 beautiful intro screens with illustrations
- Location permission request
- Interest/preference selection (product categories) — max 3 taps
- Done → land on Discover screen

---

## Phase 5: Contact & Connection Flow
- Contact button opens action sheet: Message, Copy Info, Venmo link, Directions
- Smooth handoff with confirmation toast after action
- Deep link support for Venmo

---

## Phase 6: Live Streaming (Mux)
- Mux integration for seller live streams
- Go Live button in Seller Dashboard
- Live viewer count and chat window
- Push notification to followers when seller goes live
- Live indicator badge on seller cards

---

## Phase 7: Stripe Subscriptions (Freemium/Premium)
- Enable Stripe integration
- Free tier: basic discovery, follow sellers, contact
- Premium seller tier: analytics dashboard, live streaming tools, event stipends, enhanced visibility
- Subscription management in Profile settings
- Premium badge on seller profiles

---

## Phase 8: Admin Console
- Separate admin layout with sidebar navigation
- User management (view, suspend, verify sellers)
- Listing moderation
- Event management
- Analytics overview (total users, active sellers, engagement)
- Subscription management
- Content moderation tools

