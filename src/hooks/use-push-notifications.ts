import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export function usePushNotifications() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const register = async () => {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== "granted") {
        console.warn("Push notification permission not granted");
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener("registration", (token) => {
        console.log("Push registration token:", token.value);
        // TODO: Send token to Tribekiller backend for targeting
      });

      PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration error:", error);
      });

      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("Push received in foreground:", notification);
      });

      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.log("Push notification tapped:", action);
        // TODO: Navigate based on action.notification.data
      });
    };

    register();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);
}
