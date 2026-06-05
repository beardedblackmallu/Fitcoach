"use client";

// CapacitorInit — runs once on app mount, handles all native initialisation.
// Gracefully no-ops on web (Capacitor plugins are stubs in a browser context).

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CapacitorInit() {
  const router = useRouter();

  useEffect(() => {
    let backButtonCleanup: (() => void) | undefined;

    const init = async () => {
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch {
        // Not in Capacitor
      }

      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#1C1C1C" });
      } catch {
        // Not in Capacitor or iOS (setBackgroundColor not available on iOS)
      }
    };

    const registerBackButton = async () => {
      try {
        const { App } = await import("@capacitor/app");

        const listener = await App.addListener("backButton", ({ canGoBack }) => {
          // If the WebView has history to go back through → go back.
          // If there's no more history → we're at the entry point → exit.
          // This is simpler and more reliable than pathname matching, which
          // is fragile in a Capacitor static-export WebView context.
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });

        backButtonCleanup = () => listener.remove();
      } catch {
        // Not in Capacitor
      }
    };

    init();
    registerBackButton();

    return () => {
      backButtonCleanup?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renders nothing — pure side effects
  return null;
}
