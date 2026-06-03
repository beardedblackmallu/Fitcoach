"use client";

import { ArrowDownRight, ArrowUpRight, Download, IndianRupee, Send } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/lib/AppContext";
import { usePayments } from "@/lib/hooks/usePayments";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
  refunded: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid", pending: "Pending", failed: "Failed", refunded: "Refunded",
};

export default function PaymentsPage() {
  const { showToast } = useApp();
  const { payments, summary, loading, error } = usePayments();

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-red-700">Failed to load payments</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Payments</h1>
          <p className="text-sm text-stone-500 mt-1">
            {loading ? "Loading…" : "Track payments, send links, manage renewals."}
          </p>
        </div>
        <button
          onClick={() => showToast("CSV export — coming in Phase 6")}
          className="h-9 px-3 text-sm rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium inline-flex items-center gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <ArrowDownRight className="h-4 w-4 text-emerald-600" />
            Received this month
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-stone-200 rounded animate-pulse mt-1.5" />
          ) : (
            <div className="text-2xl font-semibold text-stone-900 mt-1.5 tabular-nums">
              ₹{summary.receivedThisMonth.toLocaleString("en-IN")}
            </div>
          )}
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
            Pending
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-stone-200 rounded animate-pulse mt-1.5" />
          ) : (
            <div className="text-2xl font-semibold text-stone-900 mt-1.5 tabular-nums">
              ₹{summary.totalPending.toLocaleString("en-IN")}
            </div>
          )}
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <IndianRupee className="h-4 w-4 text-teal-600" />
            Active clients
          </div>
          {loading ? (
            <div className="h-7 w-12 bg-stone-200 rounded animate-pulse mt-1.5" />
          ) : (
            <div className="text-2xl font-semibold text-stone-900 mt-1.5 tabular-nums">
              {summary.activeClientCount}
            </div>
          )}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900 text-sm">Recent transactions</h3>
        </div>

        {loading ? (
          <div className="divide-y divide-stone-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
                <div className="h-7 w-7 rounded-full bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-stone-200 rounded" />
                </div>
                <div className="h-3.5 w-16 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-stone-500">
            No transactions yet. Payments will appear here once added.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 uppercase tracking-wide bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={p.clientInitials} color={p.clientAvatarColor} size="xs" />
                        <span className="font-medium text-stone-900">{p.clientName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900 tabular-nums">
                      ₹{p.amountInr.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-stone-600 hidden md:table-cell">{p.method}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] ?? ""}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{p.dateLabel}</td>
                    <td className="px-4 py-3">
                      {p.status === "pending" && (
                        <button
                          onClick={() => showToast(`Payment link — Razorpay integration coming in Phase 6`)}
                          className="text-xs font-medium px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Send link
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
