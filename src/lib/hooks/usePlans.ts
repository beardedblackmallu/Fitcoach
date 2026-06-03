"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbPlan } from "@/lib/types/database";

export interface UiPlan {
  id: string;
  name: string;
  description: string | null;
  durationWeeks: number;
  cycleLengthWeeks: number;
  cycles: number;
  type: "template" | "custom";
  lastEdited: string;
  clientCount: number; // derived from plan_assignments
}

function formatLastEdited(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

interface UsePlansResult {
  plans: UiPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlans(): UsePlansResult {
  const [plans, setPlans] = useState<UiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("plans")
      .select(`
        *,
        plan_assignments(id, status)
      `)
      .is("archived_at", null)
      .order("last_edited_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const uiPlans = (data ?? []).map((row) => {
      const dbPlan = row as DbPlan & { plan_assignments: { id: string; status: string }[] };
      const activeAssignments = (dbPlan.plan_assignments ?? []).filter(
        (pa) => pa.status === "active"
      ).length;

      return {
        id: dbPlan.id,
        name: dbPlan.name,
        description: dbPlan.description,
        durationWeeks: dbPlan.duration_weeks,
        cycleLengthWeeks: dbPlan.cycle_length_weeks,
        cycles: Math.max(1, Math.ceil(dbPlan.duration_weeks / dbPlan.cycle_length_weeks)),
        type: dbPlan.type,
        lastEdited: formatLastEdited(dbPlan.last_edited_at),
        clientCount: activeAssignments,
      };
    });

    setPlans(uiPlans);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { plans, loading, error, refetch: fetch };
}
