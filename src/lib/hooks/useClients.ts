"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbClient } from "@/lib/types/database";

// UI-ready shape the clients page expects.
// Derived fields (initials, avatarColor) are computed here so the
// component doesn't need to know about DB field names.
export interface UiClient {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  email: string | null;
  status: "Active" | "Paused" | "Expired";
  planName: string;        // "No plan" if none assigned
  compliance: number | null; // null until check-in data exists
  weightCurrent: number | null;
  weightStart: number | null;
  joinedAt: string;        // formatted for display
}

const AVATAR_COLORS = [
  "bg-rose-500", "bg-blue-500", "bg-[#FF6400]", "bg-emerald-500",
  "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-[#1C1C1C]",
];

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function deriveAvatarColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatJoinedAt(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function capitalize(s: string): "Active" | "Paused" | "Expired" {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as "Active" | "Paused" | "Expired";
}

function mapToUiClient(
  row: DbClient,
  activePlanName: string | null
): UiClient {
  return {
    id: row.id,
    name: row.name,
    initials: deriveInitials(row.name),
    avatarColor: row.avatar_color ?? deriveAvatarColor(row.name),
    phone: row.phone,
    email: row.email,
    status: capitalize(row.status),
    planName: activePlanName ?? "No plan",
    compliance: null, // populated in CP3 when check-in data exists
    weightCurrent: row.weight_current_kg,
    weightStart: row.weight_start_kg,
    joinedAt: formatJoinedAt(row.joined_at),
  };
}

interface UseClientsResult {
  clients: UiClient[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<UiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Fetch clients with their active plan assignment + plan name in one query.
    // RLS automatically filters to trainer_id = auth.uid() — no explicit filter needed.
    const { data, error: fetchError } = await supabase
      .from("clients")
      .select(`
        *,
        plan_assignments(
          status,
          plans(name)
        )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const uiClients = (data ?? []).map((row) => {
      // Find the active plan assignment (there should be at most one)
      const activePlan = (row.plan_assignments ?? []).find(
        (pa: { status: string; plans: { name: string } | null }) => pa.status === "active"
      );
      const planName = activePlan?.plans?.name ?? null;
      return mapToUiClient(row as DbClient, planName);
    });

    setClients(uiClients);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    const handler = () => { fetch(); };
    window.addEventListener("clients-changed", handler);
    return () => window.removeEventListener("clients-changed", handler);
  }, [fetch]);

  return { clients, loading, error, refetch: fetch };
}
