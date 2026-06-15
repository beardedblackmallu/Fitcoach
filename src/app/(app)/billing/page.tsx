"use client";

// Billing screen (Phase 2 CP2). Shows the current plan + renewal, and lets the
// trainer pay / switch tiers via the Razorpay Orders checkout. Dashboard sends
// expired trainers here.

import { useEffect, useState } from "react";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TIERS, tierByKey, startCheckout } from "@/lib/billing";
import { useApp } from "@/lib/AppContext";

interface Billing {
  tier: string | null;
  status: string;
  periodEnd: string | null;
  name: string;
  email: string | null;
}

export default function BillingPage() {
  const { showToast } = useApp();
  const [data, setData] = useState<Billing | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: t } = await supabase
      .from("trainers")
      .select("subscription_tier, subscription_status, current_period_end, name")
      .eq("id", user.id)
      .single();
    setData({
      tier: t?.subscription_tier ?? null,
      status: t?.subscription_status ?? "none",
      periodEnd: t?.current_period_end ?? null,
      name: t?.name ?? "",
      email: user.email ?? null,
    });
  };

  useEffect(() => { load(); }, []);

  const pay = async (tier: string) => {
    setPaying(tier);
    setError(null);
    try {
      await startCheckout(tier, { name: data?.name, email: data?.email ?? undefined });
      showToast("Payment received — updating your plan…", "success");
      // Webhook activates server-side; re-load after a moment to reflect it.
      setTimeout(load, 2500);
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e);
      if (!/cancel|dismiss/i.test(msg)) setError(`Payment didn't complete: ${msg}`);
    } finally {
      setPaying(null);
    }
  };

  if (!data) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#1C1C1C]" />
      </div>
    );
  }

  const current = tierByKey(data.tier);
  const isActive = data.status === "active";
  const isExpired = data.status === "expired";
  const renewal = data.periodEnd
    ? new Date(data.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-stone-900">Billing</h1>
      <p className="text-sm text-stone-500 mt-1">Manage your FitCoach subscription.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {isExpired && (
        <div className="mt-4 rounded-xl bg-[#FFF2E8] border border-[#FFD2B0] p-4 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-[#B34700] shrink-0 mt-0.5" />
          <div className="text-sm text-[#B34700]">
            Your subscription has expired. Pick a plan below to continue using FitCoach.
          </div>
        </div>
      )}

      {/* Current plan */}
      <div className="mt-5 rounded-2xl border border-[#E5E3DE] bg-white p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[#888]">Current plan</div>
        {current && isActive ? (
          <div className="mt-2 flex items-end justify-between flex-wrap gap-2">
            <div>
              <div className="text-xl font-bold text-stone-900">{current.name}</div>
              <div className="text-sm text-stone-500">
                ₹{current.price.toLocaleString("en-IN")}/mo · up to {current.clients} clients
              </div>
              {renewal && <div className="text-xs text-stone-400 mt-1">Renews on {renewal}</div>}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]">
              <Check className="h-3.5 w-3.5" /> Active
            </span>
          </div>
        ) : (
          <div className="mt-2 text-sm text-stone-500">
            No active plan{data.status === "pending" ? " — payment pending." : "."} Choose one below.
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-[#888]">
        {isActive ? "Switch plan" : "Choose a plan"}
      </div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIERS.map((t) => {
          const isCurrent = isActive && data.tier === t.key;
          return (
            <div
              key={t.key}
              className={`relative rounded-xl border p-4 ${
                isCurrent ? "border-[#FF6400] ring-2 ring-[rgba(255,100,0,0.25)] bg-[#FFF8F3]" : "border-stone-300"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#FF6400] text-white glow-orange-sm">
                  Popular
                </span>
              )}
              <div className="font-semibold text-stone-900">{t.name}</div>
              <div className="mt-1 text-2xl font-bold text-stone-900">
                ₹{t.price.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-stone-400">/mo</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">Up to {t.clients} clients</div>
              <button
                onClick={() => pay(t.key)}
                disabled={paying !== null || isCurrent}
                className={`glow-orange mt-3 w-full h-10 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none ${
                  isCurrent ? "bg-stone-100 text-stone-400" : "bg-[#FF6400] hover:bg-[#E55A00] text-white"
                }`}
              >
                {paying === t.key && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCurrent ? "Current plan" : isActive ? "Switch" : "Choose"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
