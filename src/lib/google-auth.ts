"use client";

// Native-aware Google sign-in.
// On native (Capacitor): uses @capgo/capacitor-social-login — shows the OS
// account picker, gets an ID token, exchanges with Supabase signInWithIdToken.
// On web: falls back to Supabase signInWithOAuth (browser redirect).

import { createClient } from "@/lib/supabase/client";

async function generateNonce(): Promise<{ raw: string; hashed: string }> {
  // 16 bytes → 32 hex chars (GIDSignIn on iOS requires ≤ 40 chars)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const raw = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  const data = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashed = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hashed };
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = createClient();

  // Dynamic import so the Capacitor plugin is tree-shaken from the web bundle
  const { Capacitor } = await import("@capacitor/core");

  if (Capacitor.isNativePlatform()) {
    try {
      const { SocialLogin } = await import("@capgo/capacitor-social-login");

      const webClientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!webClientId) {
        return { error: "Google client ID not configured — set NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env.local" };
      }

      await SocialLogin.initialize({
        google: {
          webClientId,
          ...(Capacitor.getPlatform() === "ios" && process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID
            ? { iOSClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID }
            : {}),
        },
      });

      // Generate nonce: pass hashed to Google (embedded in token), pass raw to Supabase
      const { raw: rawNonce, hashed: hashedNonce } = await generateNonce();

      const res = await SocialLogin.login({
        provider: "google",
        options: { nonce: rawNonce },
      });

      const idToken = (res.result as { idToken?: string })?.idToken;
      if (!idToken) return { error: "Google sign-in returned no ID token" };

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
        nonce: rawNonce,
      });

      return { error: error?.message ?? null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // User cancelled — not an error worth showing
      if (msg.includes("cancelled") || msg.includes("canceled") || msg.includes("dismiss")) {
        return { error: null };
      }
      return { error: msg };
    }
  }

  // Web fallback — Supabase handles the browser redirect
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  return { error: error?.message ?? null };
}
