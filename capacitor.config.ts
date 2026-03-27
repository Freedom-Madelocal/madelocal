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
