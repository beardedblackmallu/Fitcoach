"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
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

  // Mock sections — console.warn so they're identifiable during testing
  // These will be replaced in Phase 3 (AiSensy) and Phase 4 (compliance)
  const activeEscalations = escalations.filter((e) => !resolvedEscalations.includes(e.id));
  if (typeof window !== "undefined") {
    if (activeEscalations.length > 0) {
      console.warn("[MOCK] Dashboard escalation feed — reads from data.ts. Real escalations come from AiSensy webhook (Phase 3).");
    }
    console.warn("[MOCK] Dashboard check-ins feed — reads from data.ts. Real check-ins come from AiSensy bot messages (Phase 3).");
    console.warn("[MOCK] Avg compliance metric — hardcoded 78%. Real value requires workout_logs aggregation (Phase 4).");
  }

  const metrics = [
    {
      label: "Active clients",
      value: statsLoading ? "…" : String(stats.activeClientCount),
      icon: Users,
      accent: "text-[#1A1A1A] bg-[#F5F4F2]",
      trend: "From your client list",
      mock: false,
    },
    {
      label: "Plans expiring this week",
      value: statsLoading ? "…" : String(stats.plansExpiringThisWeek),
      icon: Calendar,
      accent: "text-[#8A4427] bg-[#F7EEE8]",
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">

      <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Good afternoon, Sandeep</h1>
          <p className="text-sm text-stone-500 mt-1">Here's what's happening with your coaching today.</p>
        </div>
        <div className="text-xs text-stone-500 px-3 py-1.5 bg-white border border-stone-200 rounded-full">
          Sunday, 10 May
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${m.accent}`}>
                <m.icon className="h-4 w-4" />
              </div>
              {m.mock
                ? <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 uppercase tracking-wide">mock</span>
                : <ArrowUpRight className="h-4 w-4 text-stone-300" />
              }
            </div>
            <div className={`text-2xl font-semibold tracking-tight ${statsLoading && !m.mock ? "text-stone-300" : "text-stone-900"}`}>
              {m.value}
            </div>
            <div className="text-xs text-stone-500 mt-1">{m.label}</div>
            <div className="text-[11px] text-stone-400 mt-2">{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Action needed */}
      {activeEscalations.length > 0 && (
        <div className="mb-8 rounded-2xl border border-[#C05C28] bg-[#FFFBEB] p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F7EEE8] text-[#8A4427]">
              <span>🟡</span> Needs your attention
            </span>
          </div>
          <div className="flex items-center justify-between mb-3 mt-2 flex-wrap gap-2">
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#C05C28]" />
              Action needed
              <span className="text-xs font-medium text-[#8A4427] bg-white/80 ring-1 ring-[#DCC3B2] px-2 py-0.5 rounded-full">
                {activeEscalations.length}
              </span>
            </h2>
            <Link
              href="/inbox"
              className="text-xs text-[#1A1A1A] hover:text-[#1A1A1A] font-medium flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {activeEscalations.map((esc) => {
              const c = getClient(esc.clientId)!;
              return (
                <div
                  key={esc.id}
                  className="bg-white rounded-xl border border-stone-200 border-l-4 border-l-[#C05C28] p-4 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <div className="font-semibold text-stone-900">{c.name}</div>
                        <div className="text-xs text-stone-500">{esc.time}</div>
                      </div>
                      <div className="text-xs text-[#8A4427] font-medium mt-0.5">{esc.reasonBadge}</div>

                      <div className="mt-3 bg-[#F7EEE8] border border-[#DCC3B2] rounded-lg p-3">
                        <div className="text-[11px] text-[#8A4427] font-medium uppercase tracking-wide mb-1">
                          Client said
                        </div>
                        <div className="text-sm text-stone-800 leading-snug">"{esc.quotedMessage}"</div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => router.push(`/conversations?c=${c.id}`)}
                          className="text-sm font-medium px-3 min-h-[40px] rounded-lg bg-[#C05C28] hover:bg-[#A84E22] text-white inline-flex items-center gap-1.5"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Open conversation
                        </button>
                        <button
                          onClick={() => openCallModal(c.id, c.name, c.phone)}
                          className="text-sm font-medium px-3 min-h-[40px] rounded-lg border border-stone-300 hover:bg-white active:bg-stone-100 text-stone-700 inline-flex items-center gap-1.5"
                        >
                          <Phone className="h-4 w-4" />
                          Tap to call
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's check-ins */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-stone-500" />
            Today's check-ins
            <span className="text-xs text-stone-500 font-normal">({todaysCheckins.length})</span>
          </h2>
          <Link
            href="/clients"
            className="text-xs text-[#1A1A1A] hover:text-[#1A1A1A] font-medium flex items-center gap-1"
          >
            View all clients
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
          {todaysCheckins.map((item) => {
            const c = getClient(item.clientId);
            if (!c) return null;
            const Icon = statusIcon[item.status] ?? Clock;
            const isPaymentAction = item.primaryAction === "Send link";
            const isReminderAction = item.primaryAction === "Send reminder";
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
                  <div className="text-[11px] text-stone-400 mt-0.5">{item.time}</div>
                </div>
                <button
                  onClick={() => {
                    if (isPaymentAction) router.push("/payments");
                    else router.push(`/conversations?c=${c.id}`);
                  }}
                  className={`text-xs font-medium px-3 min-h-[36px] rounded-lg inline-flex items-center gap-1.5 shrink-0 ${
                    isReminderAction
                      ? "border border-stone-300 hover:bg-stone-100 active:bg-stone-200 text-stone-700"
                      : "bg-[#1C1C1C] hover:bg-[#2A2A2A] active:bg-[#0F0F0F] text-white"
                  }`}
                >
                  {isReminderAction && <Send className="h-3.5 w-3.5" />}
                  {item.primaryAction}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
