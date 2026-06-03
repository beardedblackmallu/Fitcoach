"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface DashboardStats {
  activeClientCount: number;
  plansExpiringThisWeek: number;
  revenueThisMonth: number;
}

const LOADING_STATS: DashboardStats = {
  activeClientCount: 0,
  plansExpiringThisWeek: 0,
  revenueThisMonth: 0,
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(LOADING_STATS);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // 1. Active client count
    const { count: activeCount } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    // 2. Plans expiring this week: fetch active assignments + plan duration,
    //    calculate end date in JS (Supabase JS client can't do date arithmetic in filter)
    const { data: assignments } = await supabase
      .from("plan_assignments")
      .select("start_date, plans(duration_weeks)")
      .eq("status", "active");

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const expiringCount = (assignments ?? []).filter((a) => {
      const plan = a.plans as { duration_weeks: number } | null;
      if (!plan || !a.start_date) return false;
      const endMs = new Date(a.start_date).getTime() + plan.duration_weeks * 7 * 24 * 60 * 60 * 1000;
      return endMs >= now && endMs <= now + oneWeek;
    }).length;

    // 3. Revenue this month (paid payments)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: paidRows } = await supabase
      .from("payments")
      .select("amount_inr")
      .eq("status", "paid")
      .gte("paid_at", startOfMonth.toISOString());

    const revenue = (paidRows ?? []).reduce(
      (s, r) => s + (r.amount_inr as number),
      0
    );

    setStats({
      activeClientCount: activeCount ?? 0,
      plansExpiringThisWeek: expiringCount,
      revenueThisMonth: revenue,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading };
}
