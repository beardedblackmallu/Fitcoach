"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbClient } from "@/lib/types/database";

const AVATAR_COLORS = [
  "bg-rose-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500",
  "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-teal-600",
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

function weeksAgo(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
}

export interface WeightPoint {
  label: string; // e.g. "W1", formatted date
  kg: number;
}

export interface UiClientDetail {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  email: string | null;
  goal: string | null;
  status: "Active" | "Paused" | "Expired";
  // Weights
  weightCurrent: number | null;
  weightStart: number | null;
  weightTarget: number | null;
  // Plan
  planName: string;
  // Joined
  joinedWeeksAgo: number;
  joinedAt: string;
  // Health profile
  gender: string | null;
  heightCm: number | null;
  dietPreference: string | null;
  workoutPreference: string | null;
  wheyUse: string | null;
  allergies: string | null;
  injuries: string | null;
  medicalConditions: string | null;
  intakeNotes: string | null;
  // Check-in derived (null until data exists)
  weightHistory: WeightPoint[];
  workoutCompliance: number | null;
  nutritionCompliance: number | null;
}

export interface UseClientDetailResult {
  client: UiClientDetail | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useClientDetail(id: string): UseClientDetailResult {
  const [client, setClient] = useState<UiClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    const supabase = createClient();

    // Fetch client + active plan in one query
    const { data: row, error: clientErr } = await supabase
      .from("clients")
      .select(`
        *,
        plan_assignments(
          status,
          plans(name)
        )
      `)
      .eq("id", id)
      .single();

    if (clientErr) {
      if (clientErr.code === "PGRST116") {
        setNotFound(true);
      } else {
        setError(clientErr.message);
      }
      setLoading(false);
      return;
    }

    const dbClient = row as DbClient & {
      plan_assignments: { status: string; plans: { name: string } | null }[];
    };

    const activePlan = (dbClient.plan_assignments ?? []).find(
      (pa) => pa.status === "active"
    );

    // Fetch weight history from check_ins
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("for_date, weight_kg")
      .eq("client_id", id)
      .not("weight_kg", "is", null)
      .order("for_date", { ascending: true })
      .limit(20);

    const weightHistory: WeightPoint[] = (checkIns ?? []).map((ci, i) => ({
      label: `W${i + 1}`,
      kg: ci.weight_kg as number,
    }));

    const status = (dbClient.status.charAt(0).toUpperCase() +
      dbClient.status.slice(1)) as "Active" | "Paused" | "Expired";

    setClient({
      id: dbClient.id,
      name: dbClient.name,
      initials: deriveInitials(dbClient.name),
      avatarColor: dbClient.avatar_color ?? deriveAvatarColor(dbClient.name),
      phone: dbClient.phone,
      email: dbClient.email,
      goal: dbClient.goal,
      status,
      weightCurrent: dbClient.weight_current_kg,
      weightStart: dbClient.weight_start_kg,
      weightTarget: dbClient.weight_target_kg,
      planName: activePlan?.plans?.name ?? "No plan assigned",
      joinedWeeksAgo: weeksAgo(dbClient.joined_at),
      joinedAt: new Date(dbClient.joined_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      }),
      gender: dbClient.gender,
      heightCm: dbClient.height_cm,
      dietPreference: dbClient.diet_preference,
      workoutPreference: dbClient.workout_preference,
      wheyUse: dbClient.whey_use,
      allergies: dbClient.allergies,
      injuries: dbClient.injuries,
      medicalConditions: dbClient.medical_conditions,
      intakeNotes: dbClient.intake_notes,
      weightHistory,
      workoutCompliance: null,
      nutritionCompliance: null,
    });

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { client, loading, error, notFound };
}
