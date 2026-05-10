"use client";

import { ArrowDownRight, ArrowUpRight, Download, IndianRupee, Send } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { clients, getClient } from "@/lib/data";
import { useApp } from "@/lib/AppContext";

const transactions = [
  { id: 1, clientId: "neha", amount: 2000, status: "Paid", date: "10 May", method: "UPI" },
  { id: 2, clientId: "anita", amount: 4000, status: "Paid", date: "08 May", method: "UPI" },
  { id: 3, clientId: "karan", amount: 5000, status: "Paid", date: "05 May", method: "Card" },
  { id: 4, clientId: "priya", amount: 4000, status: "Paid", date: "03 May", method: "UPI" },
  { id: 5, clientId: "arjun", amount: 4000, status: "Pending", date: "Due in 3d", method: "—" },
  { id: 6, clientId: "rohan", amount: 3000, status: "Pending", date: "Due in 7d", method: "—" },
  { id: 7, clientId: "sneha", amount: 2500, status: "Paid", date: "01 May", method: "UPI" },
  { id: 8, clientId: "pooja", amount: 4000, status: "Paid", date: "28 Apr", method: "Card" },
];

export default function PaymentsPage() {
  const { showToast } = useApp();
  const totalReceived = transactions.filter((t) => t.status === "Paid").reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter((t) => t.status === "Pending").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Payments</h1>
          <p className="text-sm text-stone-500 mt-1">Track payments, send links, manage renewals.</p>
        </div>
        <button
          onClick={() => showToast("CSV export started")}
          className="h-9 px-3 text-sm rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium inline-flex items-center gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <ArrowDownRight className="h-4 w-4 text-emerald-600" />
            Received this month
          </div>
          <div className="text-2xl font-semibold text-stone-900 mt-1.5 tabular-nums">
            ₹{totalReceived.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
            Pending
          </div>
          <div className="text-2xl font-semibold text-stone-900 mt-1.5 tabular-nums">
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <IndianRupee className="h-4 w-4 text-teal-600" />
            Active subscriptions
          </div>
          <div className="text-2xl font-semibold text-stone-900 mt-1.5 tabular-nums">
            {clients.filter((c) => c.status === "Active").length}
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900 text-sm">Recent transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 uppercase tracking-wide bg-stone-50 border-b border-stone-200">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((t) => {
                const c = getClient(t.clientId);
                if (!c) return null;
                return (
                  <tr key={t.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={c.initials} color={c.avatarColor} size="xs" />
                        <span className="font-medium text-stone-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900 tabular-nums">
                      ₹{t.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-stone-600 hidden md:table-cell">{t.method}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          t.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{t.date}</td>
                    <td className="px-4 py-3">
                      {t.status === "Pending" && (
                        <button
                          onClick={() => showToast(`Payment link sent to ${c.name} via WhatsApp`, "success")}
                          className="text-xs font-medium px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Send link
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
