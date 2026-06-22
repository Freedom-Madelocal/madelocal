## Fix: seller location button spins for ~4s

### Root cause
On the seller path, after `getCurrentPosition` succeeds we `await fetchNeighbors(...)` before changing `status` from `'loading'` to `'granted'`. `fetchNeighbors` calls the `nearby_profiles_v1` RPC, which likely doesn't exist on the shared backend yet, so it waits the full 4-second timeout before resolving. The button shows a spinner that whole time.

The buyer path doesn't hit the network at all (it uses `Math.random()`), which is why it "worked."

### Changes (frontend only, `src/components/onboarding/LocationPermission.tsx`)

1. **Flip to `'granted'` immediately** after geolocation returns. Don't wait on the RPC.
2. **Run `fetchNeighbors` in the background** for seller mode. While it's in flight, show `nearbyCount = null`/skeleton state ("Looking for neighbors…"). When it resolves (or times out), update the heading and bubbles in place.
3. **Drop the RPC timeout from 4s → 2s** so even if the call hangs, the UI settles fast.
4. **If the RPC errors with "function does not exist"**, fall back to a lightweight `profiles` select (name + account_type within a bounding box, no addresses returned) so sellers still see real neighbors instead of an empty state. If that also fails, show the existing "You're the first one here!" empty state.
5. Keep the existing 12s geolocation safety timeout untouched.

### Out of scope
- No backend / RPC creation in this pass — we just stop blocking the UI on it and degrade gracefully.
- No changes to the buyer path.
- No changes to confetti, bubbles, or copy beyond the transient "Looking for neighbors…" label.
