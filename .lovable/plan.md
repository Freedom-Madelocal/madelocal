

## Capacitor Setup + Push Notifications + Build Fixes

### Memory to Save
All future features and fixes must be Capacitor-compatible: use `Capacitor.isNativePlatform()` checks where needed, avoid web-only APIs without fallbacks, and ensure safe-area insets are respected.

### 1. Fix Build Errors — `src/hooks/use-sellers.ts`
- Line 76: `as Listing[]` → `as unknown as Listing[]`
- Line 179: `as Listing[]` → `as unknown as Listing[]`
- Line 236: `as Category[]` → `as unknown as Category[]` and change `.is_active` filter to `c.is_active !== false`

### 2. Add Capacitor Dependencies — `package.json`
Add to dependencies:
- `@capacitor/core`
- `@capacitor/ios`
- `@capacitor/android`
- `@capacitor/push-notifications`

Add to devDependencies:
- `@capacitor/cli`

### 3. Create `capacitor.config.ts`
```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.48139d2397184e2097e59a971b85e75e',
  appName: 'madelocalmobile',
  webDir: 'dist',
  server: {
    url: 'https://48139d23-9718-4e20-97e5-9a971b85e75e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
```

### 4. Create `src/hooks/use-push-notifications.ts`
- Import `Capacitor` from `@capacitor/core` and `PushNotifications` from `@capacitor/push-notifications`
- Only run on native platform (`Capacitor.isNativePlatform()`)
- Request permission → register → listen for `registration` (log token), `pushNotificationReceived` (foreground), `pushNotificationActionPerformed` (tap)
- Export `usePushNotifications()` hook

### 5. Update `src/App.tsx`
- Import and call `usePushNotifications()` inside `AppRoutes`

### 6. Update `index.html`
- Add `<meta name="apple-mobile-web-app-capable" content="yes">` in `<head>`

### Post-Implementation: Local Setup Steps
1. Export to GitHub, clone locally
2. `npm install`
3. `npx cap add ios` / `npx cap add android`
4. `npx cap update ios`
5. `npm run build && npx cap sync`
6. `npx cap open ios` → enable Push Notifications capability in Xcode
7. Run on physical device

For details, see the [Lovable blog post on Capacitor setup](https://lovable.dev/blog/mobile-app-with-lovable-and-capacitor).

