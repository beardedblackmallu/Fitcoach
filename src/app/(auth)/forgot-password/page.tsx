"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-[#F5F4F2] grid place-items-center mx-auto mb-3">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Reset link sent</h2>
        <p className="text-sm text-stone-500">
          Check <span className="font-medium text-stone-700">{email}</span> for a password reset link.
          It expires in 1 hour.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-[#1A1A1A] font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
      <h1 className="text-xl font-semibold text-stone-900 mb-1">Reset your password</h1>
      <p className="text-sm text-stone-500 mb-5">
        Enter your email and we'll send a reset link.
      </p>

      <form onSubmit={handleReset} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-stone-700 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full h-11 px-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm bg-white"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] active:bg-[#0F0F0F] text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
          )}
          Send reset link
        </button>
      </form>

      <p className="text-center text-xs text-stone-500 mt-4">
        <Link href="/login" className="text-[#1A1A1A] font-medium hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
