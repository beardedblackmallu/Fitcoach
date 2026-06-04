"use client";

// CapacitorInit — runs once on app mount, handles all native initialisation.
// Gracefully no-ops on web (Capacitor plugins are stubs in a browser context).

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Root paths where back button should exit the app instead of going back
const ROOT_PATHS = ["/", "/clients", "/conversations", "/inbox", "/payments", "/plans"];

function isRootPath(pathname: string) {
  return ROOT_PATHS.some((p) => pathname === p);
}

export function CapacitorInit() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Dynamic imports keep these out of the web bundle entirely
    // when Capacitor is not present — no SSR issues, no bundle bloat.
    let backButtonCleanup: (() => void) | undefined;

    const init = async () => {
      try {
        // ── Splash screen ──────────────────────────────────────────────
        const { SplashScreen } = await import("@capacitor/splash-screen");
        // Hide the native splash now that React has rendered.
        // The 300ms fade gives a smooth handoff to the app.
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch {
        // Not running in Capacitor — silently skip
      }

      try {
        // ── Status bar ────────────────────────────────────────────────
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Light }); // white icons
        await StatusBar.setBackgroundColor({ color: "#0D9488" }); // teal
      } catch {
        // Not running in Capacitor or iOS where setBackgroundColor is unavailable
      }
    };

    init();

    // Back button listener is re-registered whenever pathname changes
    // so it always knows the current route.
    const registerBackButton = async () => {
      try {
        const { App } = await import("@capacitor/app");

        const listener = await App.addListener("backButton", ({ canGoBack }) => {
          if (isRootPath(pathname)) {
            // At a root tab — exit the app
            App.exitApp();
          } else if (canGoBack) {
            window.history.back();
          } else {
            // No history to go back to — treat as root
            router.replace("/");
          }
        });

        backButtonCleanup = () => listener.remove();
      } catch {
        // Not running in Capacitor
      }
    };

    registerBackButton();

    return () => {
      backButtonCleanup?.();
    };
  }, [pathname, router]);

  // Renders nothing — pure side effects
  return null;
}
