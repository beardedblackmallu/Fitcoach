"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/"), 2000);
  };

  const inputCls =
    "w-full h-11 px-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm bg-white";

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-[#F5F4F2] grid place-items-center mx-auto mb-3">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Password updated</h2>
        <p className="text-sm text-stone-500">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
      <h1 className="text-xl font-semibold text-stone-900 mb-1">Set a new password</h1>
      <p className="text-sm text-stone-500 mb-5">Choose something you haven't used before.</p>

      <form onSubmit={handleReset} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-stone-700 block mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-700 block mb-1">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            required
            autoComplete="new-password"
            className={inputCls}
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
          Update password
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
