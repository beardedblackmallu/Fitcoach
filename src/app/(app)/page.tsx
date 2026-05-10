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
import { clients, escalations, todaysCheckins, getClient } from "@/lib/data";
import { useApp } from "@/lib/AppContext";

const metrics = [
  { label: "Active clients", value: "24", icon: Users, accent: "text-teal-700 bg-teal-50", trend: "+2 this week" },
  { label: "Plans expiring this week", value: "3", icon: Calendar, accent: "text-amber-700 bg-amber-50", trend: "Renew now" },
  { label: "Revenue this month", value: "₹48,000", icon: IndianRupee, accent: "text-emerald-700 bg-emerald-50", trend: "+12% vs last" },
  { label: "Avg compliance", value: "78%", icon: TrendingUp, accent: "text-blue-700 bg-blue-50", trend: "Steady" },
];

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
  const activeEscalations = escalations.filter((e) => !resolvedEscalations.includes(e.id));

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${m.accent}`}>
                <m.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-stone-300" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 tracking-tight">{m.value}</div>
            <div className="text-xs text-stone-500 mt-1">{m.label}</div>
            <div className="text-[11px] text-stone-400 mt-2">{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Action needed */}
      {activeEscalations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Action needed
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {activeEscalations.length}
              </span>
            </h2>
            <Link
              href="/inbox"
              className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
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
                  className="bg-white rounded-xl border-2 border-amber-200 p-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
                  <div className="flex items-start gap-3">
                    <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <div className="font-semibold text-stone-900">{c.name}</div>
                        <div className="text-xs text-stone-500">{esc.time}</div>
                      </div>
                      <div className="text-xs text-amber-700 font-medium mt-0.5">{esc.reasonBadge}</div>

                      <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <div className="text-[11px] text-amber-700 font-medium uppercase tracking-wide mb-1">
                          Client said
                        </div>
                        <div className="text-sm text-stone-800 leading-snug">"{esc.quotedMessage}"</div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => router.push(`/conversations?c=${c.id}`)}
                          className="text-xs font-medium px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1.5"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Open conversation
                        </button>
                        <button
                          onClick={() => openCallModal(c.id, c.name, c.phone)}
                          className="text-xs font-medium px-3 py-1.5 rounded-md border border-stone-300 hover:bg-stone-50 text-stone-700 inline-flex items-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5" />
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
            className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
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
                  className={`text-xs font-medium px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 ${
                    isReminderAction
                      ? "border border-stone-300 hover:bg-stone-100 text-stone-700"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {isReminderAction && <Send className="h-3 w-3" />}
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
