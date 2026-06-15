"use client";

// CapacitorInit — runs once on app mount, handles all native initialisation.
// Gracefully no-ops on web (Capacitor plugins are stubs in a browser context).

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function CapacitorInit() {
  const router = useRouter();
  const socialLoginInitialized = useRef(false);

  useEffect(() => {
    let backButtonCleanup: (() => void) | undefined;
    let deepLinkCleanup: (() => void) | undefined;

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

    const initSocialLogin = async () => {
      if (socialLoginInitialized.current) return;
      const webClientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!webClientId) return;
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { SocialLogin } = await import("@capgo/capacitor-social-login");
        const iosClientId = process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID;
        await SocialLogin.initialize({
          google: {
            webClientId,
            ...(Capacitor.getPlatform() === "ios" && iosClientId ? { iOSClientId: iosClientId } : {}),
          },
        });
        socialLoginInitialized.current = true;
      } catch {
        // Not in Capacitor or plugin unavailable
      }
    };

    const registerDeepLinks = async () => {
      try {
        const { App } = await import("@capacitor/app");
        // Handle deep links that open the app (e.g. fitcoach://auth/callback?code=xxx)
        const listener = await App.addListener("appUrlOpen", ({ url }) => {
          try {
            const parsed = new URL(url);
            // Strip the custom scheme host, keep path + query
            const path = parsed.pathname + parsed.search;
            if (path && path !== "/") router.push(path);
          } catch {
            // Ignore malformed URLs
          }
        });
        deepLinkCleanup = () => listener.remove();
      } catch {
        // Not in Capacitor
      }
    };

    init();
    registerBackButton();
    initSocialLogin();
    registerDeepLinks();

    return () => {
      backButtonCleanup?.();
      deepLinkCleanup?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renders nothing — pure side effects
  return null;
}
