"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Mic,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { escalations, getClient, EscalationCategory } from "@/lib/data";
import { useApp } from "@/lib/AppContext";

const tabs: { label: string; value: EscalationCategory | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Medical", value: "Medical" },
  { label: "Off-topic question", value: "Off-topic question" },
  { label: "Compliance", value: "Compliance" },
  { label: "Other", value: "Other" },
];

export default function InboxPage() {
  const router = useRouter();
  const { resolvedEscalations, resolveEscalation, openVoiceModal, openCallModal, showToast } = useApp();
  const [filter, setFilter] = useState<EscalationCategory | "All">("All");

  const active = escalations.filter((e) => !resolvedEscalations.includes(e.id));
  const counts: Record<string, number> = {
    All: active.length,
    Medical: active.filter((e) => e.category === "Medical").length,
    "Off-topic question": active.filter((e) => e.category === "Off-topic question").length,
    Compliance: active.filter((e) => e.category === "Compliance").length,
    Other: active.filter((e) => e.category === "Other").length,
  };
  const visible = filter === "All" ? active : active.filter((e) => e.category === filter);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="mb-5 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Action needed
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            The bot pulls you in when something needs human judgment.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-stone-200 mb-5">
        <div className="flex gap-1 overflow-x-auto -mb-px">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
                filter === t.value
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {t.label}
              <span
                className={`text-[10px] font-semibold px-1.5 min-w-[18px] h-[18px] grid place-items-center rounded-full ${
                  filter === t.value
                    ? "bg-teal-100 text-teal-700"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {counts[t.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-emerald-50 grid place-items-center mb-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="font-medium text-stone-900">All caught up</p>
          <p className="text-sm text-stone-500 mt-1">
            No escalations matching this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((esc, i) => (
            <EscalationCard
              key={esc.id}
              escalation={esc}
              defaultExpanded={i === 0}
              onResolve={() => {
                resolveEscalation(esc.id);
                showToast("Marked resolved", "success");
              }}
              onOpenChat={() => router.push(`/conversations?c=${esc.clientId}`)}
              onCall={(name, phone) => openCallModal(esc.clientId, name, phone)}
              onVoice={(name) => openVoiceModal(name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EscalationCard({
  escalation,
  defaultExpanded = false,
  onResolve,
  onOpenChat,
  onCall,
  onVoice,
}: {
  escalation: (typeof escalations)[number];
  defaultExpanded?: boolean;
  onResolve: () => void;
  onOpenChat: () => void;
  onCall: (clientName: string, phone: string) => void;
  onVoice: (clientName: string) => void;
}) {
  const c = getClient(escalation.clientId)!;
  const [whyOpen, setWhyOpen] = useState(defaultExpanded);
  const [suggestedOpen, setSuggestedOpen] = useState(defaultExpanded);
  const router = useRouter();
  const { showToast, setComposerPrefill } = useApp();

  const useReply = (text: string) => {
    setComposerPrefill({ clientId: escalation.clientId, text });
    showToast(`Reply ready in ${c.name.split(" ")[0]}'s composer`, "success");
    router.push(`/conversations?c=${escalation.clientId}`);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="h-1 bg-amber-400" />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar initials={c.initials} color={c.avatarColor} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-900">{c.name}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                🟡 Escalated by bot
              </span>
              <span className="text-xs text-stone-500">{escalation.time}</span>
            </div>
            <div className="mt-1 text-xs text-amber-700 font-medium inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {escalation.reasonBadge}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
          <div className="text-[11px] text-amber-700 uppercase tracking-wide font-medium mb-1.5">
            Client message
          </div>
          <div className="text-sm text-stone-800 leading-relaxed">"{escalation.quotedMessage}"</div>
        </div>

        {/* Why escalated */}
        <button
          onClick={() => setWhyOpen((v) => !v)}
          className="mt-3 text-xs font-medium text-stone-600 hover:text-stone-800 inline-flex items-center gap-1"
        >
          {whyOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Why this was escalated
        </button>
        {whyOpen && (
          <div className="mt-2 text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-lg p-3 leading-relaxed">
            {escalation.whyEscalated}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onOpenChat}
            className="text-sm font-medium px-3 min-h-[44px] rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white inline-flex items-center gap-1.5 touch-manipulation"
          >
            <MessageCircle className="h-4 w-4" />
            Open conversation
          </button>
          <button
            onClick={() => onCall(c.name, c.phone)}
            className="text-sm font-medium px-3 min-h-[44px] rounded-lg border border-stone-300 hover:bg-stone-50 active:bg-stone-100 text-stone-700 inline-flex items-center gap-1.5 touch-manipulation"
          >
            <Phone className="h-4 w-4" />
            Tap to call
          </button>
          <button
            onClick={() => onVoice(c.name)}
            className="text-sm font-medium px-3 min-h-[44px] rounded-lg border border-stone-300 hover:bg-stone-50 active:bg-stone-100 text-stone-700 inline-flex items-center gap-1.5 touch-manipulation"
          >
            <Mic className="h-4 w-4" />
            Send voice note
          </button>
          <button
            onClick={onResolve}
            className="text-sm font-medium px-3 py-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 inline-flex items-center gap-1.5 ml-auto"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark resolved
          </button>
        </div>

        {/* Suggested replies */}
        <button
          onClick={() => setSuggestedOpen((v) => !v)}
          className="mt-4 text-xs font-medium text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5"
        >
          {suggestedOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <Sparkles className="h-3.5 w-3.5" />
          Suggested response{escalation.suggestedReplies.length > 1 ? "s" : ""}
        </button>
        {suggestedOpen && (
          <div className="mt-2 space-y-2">
            {escalation.suggestedReplies.map((r, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-teal-50 to-stone-50 border border-teal-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <p className="flex-1 text-sm text-stone-700 leading-relaxed">{r}</p>
                <button
                  onClick={() => useReply(r)}
                  className="self-end sm:self-auto shrink-0 text-sm font-medium px-4 min-h-[40px] rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white touch-manipulation"
                >
                  Use this
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
