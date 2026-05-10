"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Plus, Search, Upload } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { clients, ClientStatus } from "@/lib/data";
import { useApp } from "@/lib/AppContext";

const statusStyles: Record<ClientStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Paused: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  Expired: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function ClientsPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [query, setQuery] = useState("");
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Clients</h1>
          <p className="text-sm text-stone-500 mt-1">{clients.length} total · {clients.filter(c => c.status === "Active").length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Bulk import — CSV uploader coming next")}
            className="h-9 px-3 text-sm rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium inline-flex items-center gap-1.5"
          >
            <Upload className="h-4 w-4" />
            Bulk import
          </button>
          <button
            onClick={() => showToast("Add client form opening...", "success")}
            className="h-9 px-3 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add client
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-stone-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-stone-50 border border-stone-200 focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 uppercase tracking-wide bg-stone-50 border-b border-stone-200">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Start date</th>
                <th className="px-4 py-3 font-medium">Compliance</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Weight</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/clients/${c.id}`)}
                  className="hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar initials={c.initials} color={c.avatarColor} size="sm" />
                      <div className="min-w-0">
                        <div className="font-medium text-stone-900 truncate">{c.name}</div>
                        <div className="text-xs text-stone-500 truncate">{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{c.plan}</td>
                  <td className="px-4 py-3 text-stone-600 hidden md:table-cell">{c.startDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full ${
                            c.compliance >= 80
                              ? "bg-emerald-500"
                              : c.compliance >= 60
                              ? "bg-amber-500"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${c.compliance}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-stone-600 tabular-nums">{c.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600 hidden lg:table-cell tabular-nums">
                    {c.weightStart} kg → <span className="font-medium text-stone-900">{c.weightCurrent} kg</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Quick actions for ${c.name}`);
                      }}
                      className="p-1.5 rounded-md hover:bg-stone-200 text-stone-500"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-stone-500">
            No clients match "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
