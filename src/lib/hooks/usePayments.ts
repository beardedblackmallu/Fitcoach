"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const ms = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

function formatMethod(method: string | null): string {
  if (!method) return "—";
  const labels: Record<string, string> = {
    upi: "UPI", card: "Card", netbanking: "Net banking", wallet: "Wallet",
  };
  return labels[method] ?? method;
}

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface UiPayment {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  clientAvatarColor: string;
  amountInr: number;
  status: PaymentStatus;
  method: string;
  dateLabel: string;   // "10 May" for paid, "Due in 3d" for pending
  dueDate: string | null;
}

export interface UiPaymentSummary {
  receivedThisMonth: number;
  totalPending: number;
  activeClientCount: number;
}

interface UsePaymentsResult {
  payments: UiPayment[];
  summary: UiPaymentSummary;
  loading: boolean;
  error: string | null;
}

export function usePayments(): UsePaymentsResult {
  const [payments, setPayments] = useState<UiPayment[]>([]);
  const [summary, setSummary] = useState<UiPaymentSummary>({
    receivedThisMonth: 0,
    totalPending: 0,
    activeClientCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Fetch payments with client info — RLS scopes to trainer's clients
    const { data: rows, error: paymentsErr } = await supabase
      .from("payments")
      .select(`
        id,
        amount_inr,
        status,
        method,
        due_date,
        paid_at,
        created_at,
        clients(id, name, avatar_color)
      `)
      .in("status", ["paid", "pending", "failed", "refunded"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (paymentsErr) {
      setError(paymentsErr.message);
      setLoading(false);
      return;
    }

    // Fetch active client count separately
    const { count: activeCount } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    type ClientRel = { id: string; name: string; avatar_color: string | null };

    const uiPayments: UiPayment[] = (rows ?? []).map((row) => {
      const clientRel = row.clients as unknown as ClientRel | ClientRel[] | null;
      const client = Array.isArray(clientRel) ? (clientRel[0] ?? null) : clientRel;
      const clientName = client?.name ?? "Unknown";
      const status = row.status as PaymentStatus;

      return {
        id: row.id as string,
        clientId: client?.id ?? "",
        clientName,
        clientInitials: deriveInitials(clientName),
        clientAvatarColor: client?.avatar_color ?? deriveAvatarColor(clientName),
        amountInr: row.amount_inr as number,
        status,
        method: formatMethod(row.method as string | null),
        dateLabel: status === "paid"
          ? formatDate(row.paid_at as string | null)
          : formatDueDate(row.due_date as string | null),
        dueDate: row.due_date as string | null,
      };
    });

    // Summary totals
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const receivedThisMonth = uiPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amountInr, 0);

    const totalPending = uiPayments
      .filter((p) => p.status === "pending")
      .reduce((s, p) => s + p.amountInr, 0);

    setPayments(uiPayments);
    setSummary({
      receivedThisMonth,
      totalPending,
      activeClientCount: activeCount ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { payments, summary, loading, error };
}
