"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Edit3,
  MoreHorizontal,
  PauseCircle,
  Plus,
  Search,
  Send,
  Upload,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/lib/AppContext";
import { useClients, type UiClient } from "@/lib/hooks/useClients";

type ClientStatus = "Active" | "Paused" | "Expired";

const statusStyles: Record<ClientStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Paused: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  Expired: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function ClientsPage() {
  const router = useRouter();
  const { showToast, openAddClient } = useApp();
  const { clients, loading, error, refetch } = useClients();
  const [query, setQuery] = useState("");
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-red-700">Failed to load clients</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
          <button onClick={refetch} className="mt-3 text-xs text-red-700 underline">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Clients</h1>
          <p className="text-sm text-stone-500 mt-1">
            {loading ? "Loading…" : `${clients.length} total · ${clients.filter(c => c.status === "Active").length} active`}
          </p>
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
            onClick={openAddClient}
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

        {/* Loading skeleton */}
        {loading && (
          <div className="divide-y divide-stone-100">
            {[1,2,3].map((i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-stone-200 rounded" />
                  <div className="h-3 w-24 bg-stone-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile card list */}
        {!loading && <div className="md:hidden divide-y divide-stone-100">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/clients/${c.id}`)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-stone-100 transition-colors touch-manipulation"
            >
              <Avatar initials={c.initials} color={c.avatarColor} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-between">
                  <span className="font-semibold text-stone-900 truncate">{c.name}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-stone-600 truncate mt-0.5">{c.planName}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  {c.compliance !== null ? (
                    <>
                      <div className="h-1.5 w-20 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full ${c.compliance >= 80 ? "bg-emerald-500" : c.compliance >= 60 ? "bg-amber-500" : "bg-red-400"}`}
                          style={{ width: `${c.compliance}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-stone-500 tabular-nums">{c.compliance}%</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-stone-400">No check-ins yet</span>
                  )}
                  {c.weightCurrent !== null && (
                    <span className="text-[11px] text-stone-500 tabular-nums">· {c.weightCurrent} kg</span>
                  )}
                </div>
              </div>
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <RowMenu client={c} onRefetch={refetch} />
              </div>
            </button>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="px-4 py-12 text-center text-sm text-stone-500">
              {query ? `No clients match "${query}"` : "No clients yet — add your first one"}
            </div>
          )}
        </div>}

        {/* Desktop table */}
        {!loading && <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 uppercase tracking-wide bg-stone-50 border-b border-stone-200">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Joined</th>
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
                  <td className="px-4 py-3 text-stone-700">{c.planName}</td>
                  <td className="px-4 py-3 text-stone-600 hidden md:table-cell">{c.joinedAt}</td>
                  <td className="px-4 py-3">
                    {c.compliance !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-stone-200 overflow-hidden">
                          <div
                            className={`h-full ${c.compliance >= 80 ? "bg-emerald-500" : c.compliance >= 60 ? "bg-amber-500" : "bg-red-400"}`}
                            style={{ width: `${c.compliance}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-stone-600 tabular-nums">{c.compliance}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600 hidden lg:table-cell tabular-nums">
                    {c.weightStart !== null && c.weightCurrent !== null
                      ? <>{c.weightStart} kg → <span className="font-medium text-stone-900">{c.weightCurrent} kg</span></>
                      : <span className="text-stone-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowMenu client={c} onRefetch={refetch} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-stone-500">
                    {query ? `No clients match "${query}"` : "No clients yet — add your first one"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}
      </div>
    </div>
  );
}

function RowMenu({ client, onRefetch }: { client: UiClient; onRefetch: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openAssignPlanPicker, showToast } = useApp();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="p-1.5 rounded-md hover:bg-stone-200 text-stone-500"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-stone-200 rounded-lg shadow-lg py-1 scale-in origin-top-right"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setOpen(false);
              openAssignPlanPicker(client.id);
            }}
            className="w-full text-left text-sm px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2"
          >
            <Send className="h-3.5 w-3.5 text-teal-600" />
            Assign plan
          </button>
          <button
            onClick={() => {
              setOpen(false);
              router.push(`/clients/${client.id}`);
            }}
            className="w-full text-left text-sm px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2"
          >
            <Edit3 className="h-3.5 w-3.5 text-stone-500" />
            View profile
          </button>
          <button
            onClick={() => {
              setOpen(false);
              showToast(`${client.name} paused — bot won't send check-ins`, "success");
            }}
            className="w-full text-left text-sm px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2"
          >
            <PauseCircle className="h-3.5 w-3.5 text-stone-500" />
            Pause client
          </button>
        </div>
      )}
    </div>
  );
}
