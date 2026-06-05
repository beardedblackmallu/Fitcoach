"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
  };

  const inputCls =
    "w-full h-11 px-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm bg-white";

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-[#F5F4F2] grid place-items-center mx-auto mb-3">
          <span className="text-2xl">📬</span>
        </div>
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Check your inbox</h2>
        <p className="text-sm text-stone-500">
          We sent a verification link to <span className="font-medium text-stone-700">{email}</span>.
          Open it to activate your account and sign in.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-[#1A1A1A] font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
      <h1 className="text-xl font-semibold text-stone-900 mb-1">Create your account</h1>
      <p className="text-sm text-stone-500 mb-5">Start managing your coaching clients</p>

      <form onSubmit={handleSignup} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-stone-700 block mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sandeep Kumar"
            required
            autoComplete="name"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-700 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-700 block mb-1">Password</label>
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
          Create account
        </button>
      </form>

      <p className="text-center text-xs text-stone-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[#1A1A1A] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
