

## Plan: Hide BottomNav when `?app=1` query parameter is present

**What**: When the URL contains `?app=1`, hide the `BottomNav` component so the native app wrapper can provide its own navigation.

**How**: In `src/components/layout/BottomNav.tsx`, read `window.location.search` for the `app=1` param and return `null` if present.

**Changes**:
- **`src/components/layout/BottomNav.tsx`** — Add a check at the top of the component:
  ```tsx
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("app") === "1") return null;
  ```

This is a single-line addition. The param persists across navigation since native app wrappers typically append it to the base URL.

