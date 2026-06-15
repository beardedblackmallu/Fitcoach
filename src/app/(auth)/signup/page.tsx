"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/google-auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setGoogleLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

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

      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full h-11 rounded-lg border border-stone-300 hover:bg-stone-50 active:bg-stone-100 text-sm font-medium text-stone-700 flex items-center justify-center gap-2 mb-4 disabled:opacity-60"
      >
        {googleLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400">or</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
