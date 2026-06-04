import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";

// On web (Vercel): use cookie-based storage so proxy.ts can read the session
// server-side for route protection.
//
// On native (Capacitor iOS/Android): the capacitor:// URL scheme blocks cookie
// access in WKWebView/WebView, so signInWithPassword succeeds but the session
// is never persisted — getSession() returns null and AuthGuard loops back to
// login. Use localStorage instead, which works in both native WebViews.
export function createClient() {
  if (Capacitor.isNativePlatform()) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: window.localStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // no URL-based sessions in native app
        },
      }
    );
  }

  // Web: SSR-compatible cookie storage (proxy.ts reads these cookies)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
