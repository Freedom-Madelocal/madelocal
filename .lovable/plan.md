

## Mux Live Streaming + Video Integration

This is a large, multi-layered feature. Here is the recommended architecture and implementation plan, broken into phases.

### Architecture Overview

```text
┌─────────────────────────────────────────────────┐
│                   Frontend (React)               │
│  GoLive Page ─── LiveViewer Page ─── SellerProfile│
│  (RTMP/WebRTC)    (HLS playback)     (Saved VOD) │
└──────────────┬──────────────┬───────────────────┘
               │              │
         Edge Functions (Supabase / Tribekiller)
               │              │
  ┌────────────┴──┐   ┌──────┴──────────┐
  │  Mux API      │   │  Supabase DB    │
  │  (streaming)  │   │  (live_streams, │
  │               │   │   comments,     │
  │               │   │   tips, pinned) │
  └───────────────┘   └─────────────────┘
```

### Key Technology Decisions

- **Mux** handles all video infrastructure — live streaming (ingest via WebRTC/RTMP), adaptive bitrate playback (HLS), recording, and asset management. Mux automatically adjusts quality for cellular/wifi.
- **@mux/mux-player-react** for playback (lightweight HLS player with adaptive quality built-in).
- **Supabase Realtime** for live comments (no extra infrastructure needed — uses existing Supabase connection for real-time subscriptions).
- **Edge functions** on the Tribekiller Supabase project to securely call Mux API (API keys never exposed to client).
- **Web Share API** for native share sheets on mobile.

### Required Secrets

Mux requires two secrets stored on the Tribekiller Supabase project:
- `MUX_TOKEN_ID` — from the Mux dashboard
- `MUX_TOKEN_SECRET` — from the Mux dashboard

These are used only in edge functions, never exposed to the client.

### Database Tables (migrations on Tribekiller)

```sql
-- Track live streams
create table public.live_streams (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade not null,
  mux_live_stream_id text not null,
  mux_playback_id text,
  stream_key text,  -- only shown to seller
  status text default 'idle',  -- idle, active, ended
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Live comments
create table public.live_comments (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid references public.live_streams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Tips / "Support"
create table public.live_tips (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid references public.live_streams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount_cents integer not null,
  message text,
  created_at timestamptz default now()
);

-- Pinned video (one per seller)
create table public.pinned_videos (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade not null unique,
  mux_asset_id text not null,
  mux_playback_id text not null,
  duration_seconds numeric,
  thumbnail_url text,
  created_at timestamptz default now()
);
```

### Edge Functions Needed (on Tribekiller)

| Function | Purpose |
|----------|---------|
| `create-live-stream` | Creates a Mux live stream, returns playback ID + stream key to seller |
| `end-live-stream` | Signals Mux to disable the stream, updates status |
| `save-stream-recording` | Fetches the Mux asset from the completed stream, upserts into `pinned_videos` (hard-deletes previous), returns download URL |
| `get-stream-status` | Returns current stream info for a given seller (for viewers) |
| `create-tip` | Records a tip in `live_tips` (payment integration deferred — records intent for now) |

### Frontend Pages & Components

**Phase 1 — Go Live (Seller)**
1. **`/live/broadcast` route** — The seller's broadcast page
   - Calls `create-live-stream` edge function to get stream key
   - Uses browser `getUserMedia` + WebRTC (via Mux's WebRTC ingest URL) to send video
   - Shows own camera preview, live comment feed (Supabase Realtime subscription on `live_comments`), viewer count
   - "End Stream" button → calls `end-live-stream`, shows ending screen with "Save Video" / "Download" / "Discard" options
   - Seller's avatar, name visible at top

2. **`/live/:sellerId` route** — The viewer page
   - Fetches stream status via `get-stream-status`
   - Uses `<MuxPlayer>` with the playback ID for adaptive HLS playback
   - Seller avatar + name + review stars at top (clickable → navigate to `/seller/:id`)
   - Live comment input at bottom, inserts into `live_comments` table
   - "Support" button → elegant tip dialog (amount selector + disclaimer)
   - Share button → `navigator.share()` API with fallback to copy-link

**Phase 2 — Notifications**
3. When a seller goes live, insert a notification row. Followers get notified via Supabase Realtime subscription on a `notifications` table (or a dedicated `live_notifications` channel).

**Phase 3 — Pinned Video on Seller Profile**
4. **`SellerProfile.tsx`** — Add "Pinned Video" section
   - Query `pinned_videos` for the seller
   - Render `<MuxPlayer>` with the saved playback ID
   - Lightweight — just one video slot

### Changes to Existing Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes `/live/broadcast` and `/live/:sellerId` |
| `src/pages/Sell.tsx` | "Go Live" button navigates to `/live/broadcast` instead of opening coming-soon dialog |
| `src/pages/SellerProfile.tsx` | Add pinned video section above listings |
| `package.json` | Add `@mux/mux-player-react` dependency |

### New Files

| File | Purpose |
|------|---------|
| `src/pages/LiveBroadcast.tsx` | Seller broadcast page |
| `src/pages/LiveViewer.tsx` | Buyer viewing page |
| `src/components/live/LiveComments.tsx` | Real-time comment feed + input |
| `src/components/live/SupportDialog.tsx` | Tip/support elegant modal |
| `src/components/live/EndStreamScreen.tsx` | Post-stream save/download/discard |
| `src/components/live/StreamOverlay.tsx` | Seller info bar (avatar, name, stars) |
| `src/hooks/use-live-stream.ts` | Hook for stream lifecycle (create, end, save) |
| `src/hooks/use-live-comments.ts` | Supabase Realtime subscription for comments |

### Adaptive Quality (Requirement 9)

Mux handles this automatically — HLS adaptive bitrate streaming adjusts quality based on network conditions (cellular vs wifi). No custom code needed. The `<MuxPlayer>` component supports this out of the box.

### Support/Tip Dialog Design (Requirement 10)

An elegant bottom sheet or centered modal with:
- Rounded corners, blur backdrop
- Preset amounts ($1, $5, $10, $25) as pill buttons in the brand's primary green
- Custom amount input
- Small disclaimer: "This is not an exchange for goods — just supporting the seller's efforts."
- Confirm button styled like Apple Pay (dark, rounded, clean typography)
- Uses the app's accent color palette

### Share (Requirement 12)

Uses `navigator.share()` for native share sheet on mobile (SMS, copy link, etc.) with a fallback "Copy Link" button for desktop.

### Implementation Order

1. **Database migrations** — Create the 4 tables on Tribekiller
2. **Edge functions** — `create-live-stream`, `end-live-stream`, `save-stream-recording`, `get-stream-status`, `create-tip`
3. **Frontend Phase 1** — Broadcast page + Viewer page + comments + support dialog
4. **Frontend Phase 2** — Pinned video on seller profile
5. **Frontend Phase 3** — Live notifications for followers

### Important Notes

- The edge functions live on the **Tribekiller** Supabase project (same as analytics). This project calls them via `supabase.functions.invoke()`.
- Mux API keys (`MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`) need to be added as secrets on the Tribekiller project.
- Tips are recorded as intent only for now — actual payment processing (Stripe/Venmo) is a future integration.
- The "one pinned video" constraint is enforced by the `unique(seller_id)` on `pinned_videos` + an upsert pattern that deletes the old Mux asset before inserting the new one.

