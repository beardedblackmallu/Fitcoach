"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import {
  Camera,
  Edit3,
  MessageCircle,
  Mic,
  PauseCircle,
  Phone,
  Activity,
  Apple,
  TrendingUp,
  Dumbbell,
  CheckCircle2,
  ImageIcon,
  Sparkles,
  Calendar,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getClient, Client } from "@/lib/data";
import { useApp } from "@/lib/AppContext";

const tabs = ["Overview", "Workouts", "Nutrition", "Progress", "Chat"] as const;

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { openVoiceModal, openCallModal, showToast, getEffectivePlanName } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  const client = getClient(params.id);
  if (!client) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Top section */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          <Avatar initials={client.initials} color={client.avatarColor} size="xl" online={client.online} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-stone-900">{client.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-200 font-medium">
                Week {client.weekOfPlan} of {getEffectivePlanName(client.id, client.plan)}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {client.goal}
            </p>
            <p className="text-xs text-stone-500 mt-2">
              {client.phone} · Joined {client.joinedWeeksAgo} weeks ago
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => openVoiceModal(client.name)}
            className="inline-flex items-center gap-1.5 text-sm h-9 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
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
          {/* Tabs */}
          <div className="border-b border-stone-200 mb-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                    tab === t
                      ? "border-teal-600 text-teal-700"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === "Overview" && (
            <div className="space-y-5">
              {/* Weight chart */}
              <div className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                      Weight progress
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Last {client.weightHistory.length} weeks</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-stone-900 tabular-nums">{client.weightCurrent} kg</div>
                    <div className="text-xs text-emerald-600 font-medium">
                      −{(client.weightStart - client.weightCurrent).toFixed(1)} kg total
                    </div>
                  </div>
                </div>
                <div className="h-56 -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={client.weightHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={40} />
                      <Tooltip
                        contentStyle={{
                          background: "#1c1917",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#fafaf9",
                        }}
                        labelStyle={{ color: "#a8a29e" }}
                      />
                      <Line type="monotone" dataKey="kg" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4, fill: "#0D9488" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Compliance cards */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Dumbbell className="h-4 w-4 text-teal-600" />
                    Workout compliance
                  </div>
                  <div className="text-3xl font-semibold text-stone-900 mt-2 tabular-nums">{client.workoutCompliance}%</div>
                  <div className="h-1.5 mt-3 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: `${client.workoutCompliance}%` }} />
                  </div>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Apple className="h-4 w-4 text-amber-600" />
                    Nutrition compliance
                  </div>
                  <div className="text-3xl font-semibold text-stone-900 mt-2 tabular-nums">{client.nutritionCompliance}%</div>
                  <div className="h-1.5 mt-3 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${client.nutritionCompliance}%` }} />
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white border border-stone-200 rounded-xl p-5">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-stone-500" />
                  Recent activity
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50", text: "Logged workout — Squat 4×8 completed", time: "12 min ago" },
                    { icon: ImageIcon, color: "text-amber-600 bg-amber-50", text: "Sent food photo — lunch logged", time: "2h ago" },
                    { icon: Activity, color: "text-blue-600 bg-blue-50", text: "Morning check-in: 75.2kg, 7h sleep, energy 8", time: "5h ago" },
                    { icon: Mic, color: "text-teal-600 bg-teal-50", text: "Voice note from Sandeep — 0:34", time: "yesterday" },
                    { icon: Calendar, color: "text-violet-600 bg-violet-50", text: "Plan updated — Week 3 starts today", time: "2 days ago" },
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
          )}

          {tab === "Workouts" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <Dumbbell className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">Workout history view</p>
              <Link href="/plans" className="text-sm text-teal-700 hover:underline mt-2 inline-block">
                Open plan builder →
              </Link>
            </div>
          )}
          {tab === "Nutrition" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <Apple className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">Nutrition logs and macros breakdown</p>
            </div>
          )}
          {tab === "Progress" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <TrendingUp className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">Progress photos, measurements, PRs</p>
            </div>
          )}
          {tab === "Chat" && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <MessageCircle className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500 mb-2">Inline chat preview</p>
              <button
                onClick={() => router.push(`/conversations?c=${client.id}`)}
                className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md"
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
                <dd className="font-medium text-stone-900 tabular-nums">{client.weightCurrent} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Target</dt>
                <dd className="font-medium text-stone-900 tabular-nums">{client.weightTarget} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Joined</dt>
                <dd className="font-medium text-stone-900">{client.joinedWeeksAgo} weeks ago</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Plan ends in</dt>
                <dd className="font-medium text-stone-900">{client.totalWeeks - client.weekOfPlan} weeks</dd>
              </div>
            </dl>
          </div>

          <HealthProfile client={client} />

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-3">Recent escalations</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span className="text-stone-700">
                  Knee soreness — <span className="text-stone-500">resolved 3 days ago</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span className="text-stone-700">
                  Travel disruption — <span className="text-stone-500">resolved 1 week ago</span>
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HealthProfile({ client }: { client: Client }) {
  const hasInjuries = Boolean(client.injuries && client.injuries.trim().length > 0 && client.injuries.toLowerCase() !== "none");
  const hasMedical = Boolean(client.medicalConditions && client.medicalConditions.trim().length > 0 && client.medicalConditions.toLowerCase() !== "none");
  const showWarning = hasInjuries || hasMedical;

  const rows: { label: string; value?: string; warn?: boolean }[] = [
    { label: "Allergies", value: client.allergies },
    { label: "Injuries", value: client.injuries, warn: hasInjuries },
    { label: "Medical conditions", value: client.medicalConditions, warn: hasMedical },
    { label: "Notes", value: client.intakeNotes },
  ];

  const filled = rows.filter((r) => r.value && r.value.trim().length > 0);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-stone-500 uppercase tracking-wider font-medium inline-flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
          Health profile
        </div>
      </div>

      {showWarning && (
        <div className="mb-3 -mx-1 px-2 py-1.5 rounded-md bg-amber-50 border border-amber-200 inline-flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
          <AlertTriangle className="h-3.5 w-3.5" />
          Review before planning
        </div>
      )}

      {filled.length === 0 ? (
        <p className="text-xs text-stone-400 italic">No health info captured at intake.</p>
      ) : (
        <dl className="space-y-2.5">
          {rows.map((r) =>
            r.value && r.value.trim().length > 0 ? (
              <div key={r.label}>
                <dt className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                  {r.label}
                </dt>
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
