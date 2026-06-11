"use client";

import Link from "next/link";

// Pre-login welcome screen (Phase 2 CP0b).
// Full-bleed charcoal with a staged CSS entrance: logo → wordmark →
// tagline → CTAs. Animation respects prefers-reduced-motion (see
// globals.css — the .welcome-* classes collapse to final state).
// Routing: proxy.ts + AuthGuard send unauthenticated users here.

export default function WelcomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+2rem)]"
      style={{ background: "#1C1C1C" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        {/* Stage 1 — logo */}
        <div
          className="welcome-logo h-[84px] w-[84px] rounded-2xl bg-[#FF6400] grid place-items-center text-white font-bold text-[38px] leading-none glow-orange-rings"
        >
          F
        </div>

        {/* Stage 2 — wordmark */}
        <h1 className="welcome-title text-[26px] font-extrabold text-white mt-9 tracking-tight">
          FitCoach
        </h1>

        {/* Stage 3 — tagline */}
        <p className="welcome-tagline text-[12px] text-[#666] mt-2 leading-relaxed">
          WhatsApp-native coaching for independent trainers
        </p>
      </div>

      {/* Stage 4 — CTAs */}
      <div className="welcome-ctas w-full max-w-sm flex flex-col items-stretch gap-3">
        <Link
          href="/signup"
          className="glow-orange h-12 rounded-xl bg-[#FF6400] hover:bg-[#E55A00] text-white font-bold grid place-items-center transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="h-12 rounded-xl text-white font-medium grid place-items-center border border-white/15 transition-colors"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          Sign in
        </Link>
        <p className="text-[11px] text-[#444] mt-3">
          Trusted by 500+ coaches across India
        </p>
      </div>
    </main>
  );
}
