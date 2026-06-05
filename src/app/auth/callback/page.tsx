"use client";

// Auth callback — handles email verification, Google OAuth, and password reset.
// Previously a Route Handler (route.ts), converted to a client-side page so it
// works in both the web build and the Capacitor static export (which cannot run
// server-side Route Handlers that read from the Request object).

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    // Guard against double-invocation in React Strict Mode
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");
    const type = searchParams.get("type");

    if (!code) {
      router.replace("/login?error=auth_callback_failed");
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace("/login?error=auth_callback_failed");
        return;
      }
      if (type === "recovery") {
        router.replace("/reset-password");
      } else {
        router.replace("/");
      }
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-[#1C1C1C] border-t-transparent animate-spin" />
        <p className="text-sm text-stone-500">Completing sign in…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-[#1C1C1C] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
