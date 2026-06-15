"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  IndianRupee,
  TrendingUp,
  Users,
  Phone,
  MessageCircle,
  Bell,
  ImageIcon,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { escalations, todaysCheckins, getClient } from "@/lib/data";
import { useApp } from "@/lib/AppContext";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";
import { createClient } from "@/lib/supabase/client";

const statusIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  "Logged workout": CheckCircle2,
  "Pending morning check-in": Clock,
  "Sent food photo": ImageIcon,
  "New question": MessageCircle,
  "Completed week": CheckCircle2,
  "Payment due in 3 days": IndianRupee,
};

export default function DashboardPage() {
  const router = useRouter();
  const { openCallModal, resolvedEscalations } = useApp();
  const { stats, loading: statsLoading } = useDashboardStats();
  const [trainerName, setTrainerName] = useState("Coach");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: t } = await supabase
        .from("trainers")
        .select("name, subscription_status")
        .eq("id", user.id)
        .single();
      // Expired subscription → send to billing.
      if (t?.subscription_status === "expired") {
        router.replace("/billing");
        return;
      }
      const name: string =
        t?.name ||
        (user.user_metadata?.name as string) ||
        user.email?.split("@")[0] ||
        "Coach";
      setTrainerName(name);
    });
  }, [router]);

  const firstName = trainerName.split(" ")[0];
  const trainerInitials = trainerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Mock sections — console.warn so they're identifiable during testing.
  // Replaced in Phase 3 (AiSensy) and Phase 4 (compliance).
  const activeEscalations = escalations.filter((e) => !resolvedEscalations.includes(e.id));
  if (typeof window !== "undefined") {
    if (activeEscalations.length > 0) {
      console.warn("[MOCK] Dashboard escalation feed — reads from data.ts. Real escalations come from AiSensy webhook (Phase 3).");
    }
    console.warn("[MOCK] Dashboard check-ins feed — reads from data.ts. Real check-ins come from AiSensy bot messages (Phase 3).");
    console.warn("[MOCK] Avg compliance metric — hardcoded 78%. Real value requires workout_logs aggregation (Phase 4).");
  }

  const clientsVal = statsLoading ? "…" : String(stats.activeClientCount);
  const revenueVal = statsLoading
    ? "…"
    : stats.revenueThisMonth >= 1000
      ? `₹${Math.round(stats.revenueThisMonth / 1000)}k`
      : `₹${stats.revenueThisMonth}`;
  const complianceVal = "78%";

  // Desktop metric cards (unchanged layout)
  const metrics = [
    {
      label: "Active clients",
      value: clientsVal,
      icon: Users,
      accent: "text-[#1A1A1A] bg-[#F5F4F2]",
      trend: "From your client list",
      mock: false,
    },
    {
      label: "Plans expiring this week",
      value: statsLoading ? "…" : String(stats.plansExpiringThisWeek),
      icon: Calendar,
      accent: "text-[#B34700] bg-[#FFF2E8]",
      trend: stats.plansExpiringThisWeek > 0 ? "Renew now" : "All good",
      mock: false,
    },
    {
      label: "Revenue this month",
      value: statsLoading ? "…" : `₹${stats.revenueThisMonth.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      accent: "text-emerald-700 bg-emerald-50",
      trend: "Paid payments only",
      mock: false,
    },
    {
      label: "Avg compliance",
      value: "78%",
      icon: TrendingUp,
      accent: "text-blue-700 bg-blue-50",
      trend: "Mock — Phase 4",
      mock: true,
    },
  ];

  const statTiles = [
    { label: "Clients", value: clientsVal },
    { label: "Revenue", value: revenueVal },
    { label: "Compliance", value: complianceVal },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Mobile dark header ─────────────────────────────── */}
      <div
        className="gpu-layer md:hidden text-white px-4 pt-5 pb-5 rounded-b-3xl"
        style={{ background: "linear-gradient(160deg, #1C1C1C 55%, #2A1800 100%)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#555]">
              Good afternoon
            </div>
            <div className="text-[20px] font-bold text-white mt-0.5 leading-tight">
              {firstName}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/inbox")}
              className="relative h-10 w-10 rounded-full grid place-items-center"
              style={{ background: "rgba(255,255,255,0.07)" }}
              aria-label="Inbox"
            >
              <Bell className="h-5 w-5 text-white/90" />
              {activeEscalations.length > 0 && (
                <span
                  className="glow-orange-sm absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 grid place-items-center rounded-full bg-[#FF6400] text-white text-[10px] font-bold"
                  style={{ border: "2px solid #1C1C1C" }}
                >
                  {activeEscalations.length}
                </span>
              )}
            </button>
            <span className="glow-orange-sm rounded-full inline-flex">
              <Avatar initials={trainerInitials} color="bg-[#FF6400]" size="sm" />
            </span>
          </div>
        </div>

        {/* 3 stat tiles */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {statTiles.map((t) => (
            <div
              key={t.label}
              className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className={`text-lg font-bold tabular-nums ${
                  statsLoading ? "text-white/40" : "text-white"
                }`}
              >
                {t.value}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-white/50 mt-0.5">
                {t.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body (padded) ──────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 md:pt-6 pb-6">
        {/* Desktop greeting */}
        <div className="hidden md:flex items-end justify-between mb-6 flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              Good afternoon, {firstName}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Here's what's happening with your coaching today.
            </p>
          </div>
          <div className="text-xs text-stone-500 px-3 py-1.5 bg-white border border-stone-200 rounded-full">
            Sunday, 10 May
          </div>
        </div>

        {/* Desktop metrics grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${m.accent}`}>
                  <m.icon className="h-4 w-4" />
                </div>
                {m.mock ? (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 uppercase tracking-wide">
                    mock
                  </span>
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-stone-300" />
                )}
              </div>
              <div
                className={`text-2xl font-semibold tracking-tight ${
                  statsLoading && !m.mock ? "text-stone-300" : "text-stone-900"
                }`}
              >
                {m.value}
              </div>
              <div className="text-xs text-stone-500 mt-1">{m.label}</div>
              <div className="text-[11px] text-stone-400 mt-2">{m.trend}</div>
            </div>
          ))}
        </div>

        {/* ── Action needed (dark escalation) ──────────────── */}
        {activeEscalations.length > 0 && (
          <section
            className="gpu-layer mt-1 md:mt-0 mb-7 rounded-2xl p-4 sm:p-5 border-l-[3px] border-[#FF6400]"
            style={{ background: "#1C1C1C" }}
          >
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="glow-orange-dot h-2 w-2 rounded-full bg-[#FF6400]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF6400]">
                  Action needed
                </span>
                <span className="glow-orange-sm text-[11px] font-bold text-white bg-[#FF6400] rounded-full min-w-[18px] h-[18px] px-1.5 grid place-items-center">
                  {activeEscalations.length}
                </span>
              </div>
              <Link
                href="/inbox"
                className="text-xs text-white/60 hover:text-white font-medium inline-flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-2.5">
              {activeEscalations.map((esc) => {
                const c = getClient(esc.clientId)!;
                return (
                  <div
                    key={esc.id}
                    className="rounded-xl p-3.5"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-10 w-10 rounded-full grid place-items-center text-[#FF6400] font-semibold text-sm shrink-0"
                        style={{ background: "rgba(255,100,0,0.2)" }}
                      >
                        {c.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-white truncate">{c.name}</span>
                          <span className="text-[11px] text-white/40 shrink-0">{esc.time}</span>
                        </div>
                        <div className="text-xs text-[#FF6400] font-medium mt-0.5">
                          {esc.reasonBadge}
                        </div>
                        <p className="text-sm text-[#666] mt-1.5 leading-snug line-clamp-2">
                          "{esc.quotedMessage}"
                        </p>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => router.push(`/conversations?c=${c.id}`)}
                            className="glow-orange-sm text-sm font-semibold px-3.5 min-h-[38px] rounded-lg bg-[#FF6400] hover:bg-[#E55A00] text-white inline-flex items-center gap-1.5"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Reply
                          </button>
                          <button
                            onClick={() => openCallModal(c.id, c.name, c.phone)}
                            className="text-sm font-medium px-3 min-h-[38px] rounded-lg text-white/80 hover:text-white inline-flex items-center gap-1.5"
                            style={{ background: "rgba(255,255,255,0.07)" }}
                          >
                            <Phone className="h-4 w-4" />
                            Call
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Today's check-ins ────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#888] flex items-center gap-1.5">
              Today's check-ins
              <span className="text-[#aaa] font-normal normal-case tracking-normal">
                ({todaysCheckins.length})
              </span>
            </h2>
            <Link
              href="/clients"
              className="text-xs text-[#1A1A1A] hover:text-[#1A1A1A] font-medium flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border-[0.5px] border-[#E5E3DE] divide-y divide-stone-100 overflow-hidden">
            {todaysCheckins.map((item) => {
              const c = getClient(item.clientId);
              if (!c) return null;
              const Icon = statusIcon[item.status] ?? Clock;
              const isPaymentAction = item.primaryAction === "Send link";
              const isReminderAction = item.primaryAction === "Send reminder";
              const isOverdue = isReminderAction || isPaymentAction;
              return (
                <div
                  key={c.id + item.status}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                >
                  <Avatar initials={c.initials} color={c.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-stone-900">{c.name}</span>
                      <span className="text-xs text-stone-500 inline-flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {item.status}
                      </span>
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isOverdue ? "text-[#FF6400] font-medium" : "text-stone-400"
                      }`}
                    >
                      {item.time}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (isPaymentAction) router.push("/payments");
                      else router.push(`/conversations?c=${c.id}`);
                    }}
                    className={`text-xs font-medium px-3 min-h-[36px] rounded-lg inline-flex items-center gap-1.5 shrink-0 ${
                      isReminderAction
                        ? "glow-orange-sm bg-[#FF6400] hover:bg-[#E55A00] text-white"
                        : "bg-[#1C1C1C] hover:bg-[#2A2A2A] active:bg-[#0F0F0F] text-white"
                    }`}
                  >
                    {isReminderAction && <Send className="h-3.5 w-3.5" />}
                    {item.primaryAction === "Send reminder" ? "Remind" : item.primaryAction}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
