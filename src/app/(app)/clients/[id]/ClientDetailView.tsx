"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Camera, Edit3, MessageCircle, Mic, PauseCircle, Phone,
  Activity, Apple, TrendingUp, Dumbbell, CheckCircle2,
  ImageIcon, Sparkles, Calendar, AlertTriangle, HeartPulse,
} from "lucide-react";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/lib/AppContext";
import { useClientDetail, type UiClientDetail } from "@/lib/hooks/useClientDetail";

const tabs = ["Overview", "Workouts", "Nutrition", "Progress", "Chat"] as const;

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { openVoiceModal, openCallModal, showToast } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  const { client, loading, error, notFound } = useClientDetail(params.id);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto animate-pulse space-y-4">
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-stone-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 bg-stone-200 rounded" />
              <div className="h-3.5 w-56 bg-stone-100 rounded" />
            </div>
          </div>
        </div>
        <div className="h-48 bg-white border border-stone-200 rounded-xl" />
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="text-stone-500 font-medium">Client not found</p>
          <button onClick={() => router.push("/clients")} className="mt-3 text-sm text-[#1A1A1A] hover:underline">
            ← Back to clients
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-red-700">Failed to load client</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Top section */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          <Avatar initials={client.initials} color={client.avatarColor} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-stone-900">{client.name}</h1>
              {client.planName !== "No plan assigned" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F4F2] text-[#1A1A1A] ring-1 ring-[#E5E3DE] font-medium">
                  {client.planName}
                </span>
              )}
            </div>
            {client.goal && (
              <p className="text-sm text-stone-600 mt-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FF6400]" />
                {client.goal}
              </p>
            )}
            <p className="text-xs text-stone-500 mt-2">
              {client.phone} · Joined {client.joinedWeeksAgo} weeks ago
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => openVoiceModal(client.name)}
            className="inline-flex items-center gap-1.5 text-sm h-9 px-3 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium"
          >
            <Mic className="h-4 w-4" /> Send voice note
          </button>
          <button
            onClick={() => showToast("Photo/video upload modal would open here")}
            className="inline-flex items-center gap-1.5 text-sm h-9 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium"
          >
            <Camera className="h-4 w-4" /> Send photo/video
          </button>
          <button
            onClick={() => router.push(`/conversations?c=${client.id}`)}
            className="inline-flex items-center gap-1.5 text-sm h-9 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium"
          >
            <MessageCircle className="h-4 w-4" /> Open conversation
          </button>
          <button
            onClick={() => router.push("/plans")}
            className="inline-flex items-center gap-1.5 text-sm h-9 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium"
          >
            <Edit3 className="h-4 w-4" /> Adjust plan
          </button>
          <button
            onClick={() => showToast(`${client.name} paused — bot will stop sending check-ins`, "success")}
            className="inline-flex items-center gap-1.5 text-sm h-9 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium"
          >
            <PauseCircle className="h-4 w-4" /> Pause client
          </button>
          <button
            onClick={() => openCallModal(client.id, client.name, client.phone)}
            className="inline-flex items-center gap-1.5 text-sm h-9 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium"
          >
            <Phone className="h-4 w-4" /> Tap to call
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Main content */}
        <div>
          <div className="border-b border-stone-200 mb-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                    tab === t
                      ? "border-[#1C1C1C] text-[#1A1A1A]"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === "Overview" && <OverviewTab client={client} />}
          {tab === "Workouts" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <Dumbbell className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">Workout history view — coming in Phase 2</p>
              <Link href="/plans" className="text-sm text-[#1A1A1A] hover:underline mt-2 inline-block">
                Open plan builder →
              </Link>
            </div>
          )}
          {tab === "Nutrition" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <Apple className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">Nutrition logs — coming in Phase 2</p>
            </div>
          )}
          {tab === "Progress" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <TrendingUp className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">Progress photos, measurements, PRs — coming in Phase 2</p>
            </div>
          )}
          {tab === "Chat" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <MessageCircle className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500 mb-2">Inline chat preview</p>
              <button
                onClick={() => router.push(`/conversations?c=${client.id}`)}
                className="text-sm bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white px-3 py-1.5 rounded-md"
              >
                Open in Conversations
              </button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <aside className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-3">Quick stats</div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Current weight</dt>
                <dd className="font-medium text-stone-900 tabular-nums">
                  {client.weightCurrent !== null ? `${client.weightCurrent} kg` : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Target</dt>
                <dd className="font-medium text-stone-900 tabular-nums">
                  {client.weightTarget !== null ? `${client.weightTarget} kg` : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Joined</dt>
                <dd className="font-medium text-stone-900">{client.joinedWeeksAgo} weeks ago</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Status</dt>
                <dd className="font-medium text-stone-900">{client.status}</dd>
              </div>
            </dl>
          </div>

          <HealthProfile client={client} />

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-2">Recent escalations</div>
            <p className="text-xs text-stone-400 italic">Escalation history coming in Phase 2</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OverviewTab({ client }: { client: UiClientDetail }) {
  const hasWeightData = client.weightHistory.length > 0;
  const weightLost = client.weightStart !== null && client.weightCurrent !== null
    ? (client.weightStart - client.weightCurrent).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      {/* Weight chart */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#1A1A1A]" />
              Weight progress
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {hasWeightData ? `${client.weightHistory.length} check-ins` : "No check-ins yet"}
            </p>
          </div>
          {client.weightCurrent !== null && (
            <div className="text-right">
              <div className="text-xl font-semibold text-stone-900 tabular-nums">{client.weightCurrent} kg</div>
              {weightLost && Number(weightLost) > 0 && (
                <div className="text-xs text-emerald-600 font-medium">−{weightLost} kg total</div>
              )}
            </div>
          )}
        </div>
        {hasWeightData ? (
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={client.weightHistory.map(p => ({ week: p.label, kg: p.kg }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={40} />
                <Tooltip
                  contentStyle={{ background: "#1c1917", border: "none", borderRadius: 8, fontSize: 12, color: "#fafaf9" }}
                  labelStyle={{ color: "#a8a29e" }}
                />
                <Line type="monotone" dataKey="kg" stroke="#1C1C1C" strokeWidth={2.5} dot={{ r: 4, fill: "#1C1C1C" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-stone-400 text-sm">
            Weight data appears here once client starts logging check-ins
          </div>
        )}
      </div>

      {/* Compliance cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Dumbbell className="h-4 w-4 text-[#1A1A1A]" />
            Workout compliance
          </div>
          {client.workoutCompliance !== null ? (
            <>
              <div className="text-3xl font-semibold text-stone-900 mt-2 tabular-nums">{client.workoutCompliance}%</div>
              <div className="h-1.5 mt-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1C1C1C]" style={{ width: `${client.workoutCompliance}%` }} />
              </div>
            </>
          ) : (
            <div className="text-2xl font-semibold text-stone-300 mt-2">—</div>
          )}
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Apple className="h-4 w-4 text-[#FF6400]" />
            Nutrition compliance
          </div>
          {client.nutritionCompliance !== null ? (
            <>
              <div className="text-3xl font-semibold text-stone-900 mt-2 tabular-nums">{client.nutritionCompliance}%</div>
              <div className="h-1.5 mt-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6400]" style={{ width: `${client.nutritionCompliance}%` }} />
              </div>
            </>
          ) : (
            <div className="text-2xl font-semibold text-stone-300 mt-2">—</div>
          )}
        </div>
      </div>

      {/* Recent activity — demo data, Phase 2 will wire real logs */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-stone-500" />
          Recent activity
          <span className="text-[10px] text-stone-400 font-normal bg-stone-100 px-1.5 py-0.5 rounded-full">demo</span>
        </h3>
        <ul className="space-y-3">
          {[
            { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50", text: "Logged workout — Squat 4×8 completed", time: "12 min ago" },
            { icon: ImageIcon, color: "text-[#FF6400] bg-[#FFF2E8]", text: "Sent food photo — lunch logged", time: "2h ago" },
            { icon: Activity, color: "text-blue-600 bg-blue-50", text: "Morning check-in logged", time: "5h ago" },
            { icon: Mic, color: "text-[#1A1A1A] bg-[#F5F4F2]", text: "Voice note sent — 0:34", time: "yesterday" },
            { icon: Calendar, color: "text-violet-600 bg-violet-50", text: "Plan updated", time: "2 days ago" },
          ].map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${a.color}`}>
                <a.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-stone-800">{a.text}</div>
                <div className="text-xs text-stone-500 mt-0.5">{a.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HealthProfile({ client }: { client: UiClientDetail }) {
  const hasInjuries = Boolean(client.injuries?.trim() && client.injuries.toLowerCase() !== "none");
  const hasMedical = Boolean(client.medicalConditions?.trim() && client.medicalConditions.toLowerCase() !== "none");
  const showWarning = hasInjuries || hasMedical;

  const rows = [
    { label: "Allergies", value: client.allergies },
    { label: "Injuries", value: client.injuries, warn: hasInjuries },
    { label: "Medical conditions", value: client.medicalConditions, warn: hasMedical },
    { label: "Diet preference", value: client.dietPreference },
    { label: "Workout preference", value: client.workoutPreference },
    { label: "Notes", value: client.intakeNotes },
  ];

  const filled = rows.filter((r) => r.value?.trim());

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-stone-500 uppercase tracking-wider font-medium inline-flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
          Health profile
        </div>
      </div>

      {showWarning && (
        <div className="mb-3 px-2 py-1.5 rounded-md bg-[#FFF2E8] border border-[#FFD2B0] inline-flex items-center gap-1.5 text-[11px] text-[#B34700] font-medium">
          <AlertTriangle className="h-3.5 w-3.5" />
          Review before planning
        </div>
      )}

      {filled.length === 0 ? (
        <p className="text-xs text-stone-400 italic">No health info captured at intake.</p>
      ) : (
        <dl className="space-y-2.5">
          {rows.map((r) =>
            r.value?.trim() ? (
              <div key={r.label}>
                <dt className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">{r.label}</dt>
                <dd className={`text-[13px] leading-snug ${r.warn ? "text-stone-900" : "text-stone-700"}`}>
                  {r.value}
                </dd>
              </div>
            ) : null
          )}
        </dl>
      )}
    </div>
  );
}
