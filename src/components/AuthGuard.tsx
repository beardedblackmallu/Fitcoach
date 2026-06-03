"use client";

// AuthGuard — client-side session check.
//
// On web (Vercel): proxy.ts already does server-side redirect before HTML ships.
//   AuthGuard is a second, redundant layer — defence in depth.
//   It does NOT weaken web auth; proxy.ts runs first regardless.
//
// On mobile (Capacitor static export): proxy.ts is stripped by Next.js.
//   AuthGuard is the ONLY auth gate. It must run before any protected content
//   renders, hence the null loading state until the check completes.
//
// Loading state: renders a full-screen teal spinner — NOT the app shell or
// any protected content — so there is zero flash of dashboard before redirect.

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const onPublicRoute = isPublic(pathname);

      if (!session && !onPublicRoute) {
        // No session + protected route → send to login
        router.replace("/login");
        // Keep ready=false so protected content never renders during redirect
        return;
      }

      if (session && onPublicRoute && pathname !== "/auth/callback") {
        // Already logged in + hit a public auth page → send to dashboard
        router.replace("/");
        return;
      }

      // All good — show the page
      setReady(true);
    });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
