"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// DB category → UI label
const CATEGORY_LABELS: Record<string, string> = {
  medical: "Medical",
  off_topic: "Off-topic question",
  compliance: "Compliance",
  other: "Other",
};

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-rose-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500",
  "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-teal-600",
];

function deriveAvatarColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export interface UiEscalation {
  id: string;
  clientId: string;       // client UUID — used for conversation routing
  clientName: string;
  clientPhone: string;
  clientInitials: string;
  clientAvatarColor: string;
  category: string;       // UI label e.g. "Medical", "Off-topic question"
  reasonBadge: string;
  quotedMessage: string;  // text of the triggering message (from messages table)
  whyEscalated: string;
  time: string;
  suggestedReplies: string[];
}

interface UseEscalationsResult {
  escalations: UiEscalation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  resolveInDb: (id: string) => Promise<void>;
}

export function useEscalations(): UseEscalationsResult {
  const [escalations, setEscalations] = useState<UiEscalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("escalations")
      .select(`
        id,
        category,
        reason_badge,
        why_escalated,
        status,
        created_at,
        trigger_message:messages!triggered_by_message_id(text),
        escalation_suggested_replies(text, order_index),
        conversations(
          client_id,
          clients(name, phone, avatar_color)
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const uiEscalations: UiEscalation[] = (data ?? []).map((row) => {
      const client = (row.conversations as { client_id: string; clients: { name: string; phone: string; avatar_color: string | null } } | null);
      const clientName = client?.clients?.name ?? "Unknown client";
      const clientPhone = client?.clients?.phone ?? "";
      const clientAvatarColor = client?.clients?.avatar_color ?? deriveAvatarColor(clientName);

      const triggerMsg = row.trigger_message as { text: string | null } | null;
      const quotedMessage = triggerMsg?.text ?? "(message unavailable)";

      const replies = ((row.escalation_suggested_replies ?? []) as { text: string; order_index: number }[])
        .sort((a, b) => a.order_index - b.order_index)
        .map((r) => r.text);

      return {
        id: row.id as string,
        clientId: client?.client_id ?? "",
        clientName,
        clientPhone,
        clientInitials: deriveInitials(clientName),
        clientAvatarColor,
        category: CATEGORY_LABELS[row.category as string] ?? row.category as string,
        reasonBadge: row.reason_badge as string,
        quotedMessage,
        whyEscalated: row.why_escalated as string,
        time: timeAgo(row.created_at as string),
        suggestedReplies: replies,
      };
    });

    setEscalations(uiEscalations);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const resolveInDb = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("escalations")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id);
    // Remove from local list immediately for instant UI feedback
    setEscalations((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { escalations, loading, error, refetch: fetch, resolveInDb };
}
