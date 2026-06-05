"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Archive,
  Copy,
  Dumbbell,
  Edit3,
  MoreVertical,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { usePlans, type UiPlan } from "@/lib/hooks/usePlans";

export default function PlansListPage() {
  const router = useRouter();
  const { openNewPlanModal, showToast } = useApp();
  const { plans, loading, error, refetch } = usePlans();
  const [filter, setFilter] = useState<"templates" | "custom">("templates");

  const visible = plans.filter((p) => (filter === "templates" ? p.type === "template" : p.type === "custom"));
  const counts = {
    templates: plans.filter((p) => p.type === "template").length,
    custom: plans.filter((p) => p.type === "custom").length,
  };

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-red-700">Failed to load plans</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
          <button onClick={refetch} className="mt-3 text-xs text-red-700 underline">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Plans</h1>
          <p className="text-sm text-stone-500 mt-1">
            {loading ? "Loading…" : "Reusable templates and one-off plans for individual clients."}
          </p>
        </div>
        <button
          onClick={() => openNewPlanModal()}
          className="h-9 px-3 text-sm rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New plan
        </button>
      </div>

      <div className="border-b border-stone-200 mb-5">
        <div className="flex gap-1 -mb-px">
          {(["templates", "custom"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                filter === f
                  ? "border-[#1C1C1C] text-[#1A1A1A]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {f === "templates" ? "Templates" : "Custom plans"}
              <span
                className={`text-[10px] font-semibold px-1.5 min-w-[18px] h-[18px] grid place-items-center rounded-full ${
                  filter === f
                    ? "bg-[#EBEBEA] text-[#1A1A1A]"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-9 w-9 rounded-lg bg-stone-200" />
              <div className="h-4 w-40 bg-stone-200 rounded" />
              <div className="h-3 w-24 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <Dumbbell className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="font-medium text-stone-800">
            {filter === "templates" ? "No templates yet" : "No custom plans yet"}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            {filter === "templates"
              ? "Build a reusable template you can assign to multiple clients."
              : "Custom plans are created from a specific client and only show up here."}
          </p>
          <button
            onClick={() => openNewPlanModal()}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white"
          >
            <Plus className="h-4 w-4" />
            New plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              onEdit={() => router.push(`/plans/${p.id}/edit`)}
              onDuplicate={() => showToast(`"${p.name}" duplicated`, "success")}
              onArchive={() => showToast(`"${p.name}" archived`)}
              onDelete={() => showToast(`"${p.name}" deleted`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  plan: UiPlan;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-sm hover:border-stone-300 transition-all flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Link href={`/plans/${plan.id}/edit`} className="flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-[#F5F4F2] grid place-items-center text-[#1A1A1A] mb-3">
            <Dumbbell className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-stone-900 leading-snug">{plan.name}</h3>
          <p className="text-xs text-stone-500 mt-1">
            {plan.durationWeeks} weeks · {plan.cycles} cycle{plan.cycles !== 1 ? "s" : ""}
          </p>
        </Link>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 w-40 bg-white border border-stone-200 rounded-lg shadow-lg py-1 scale-in origin-top-right">
              <button
                onClick={() => { setMenuOpen(false); onDuplicate(); }}
                className="w-full text-left text-sm px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5 text-stone-500" />
                Duplicate
              </button>
              <button
                onClick={() => { setMenuOpen(false); onArchive(); }}
                className="w-full text-left text-sm px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2"
              >
                <Archive className="h-3.5 w-3.5 text-stone-500" />
                Archive
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="w-full text-left text-sm px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {plan.description && (
        <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-3">{plan.description}</p>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {plan.clientCount} client{plan.clientCount !== 1 ? "s" : ""}
        </span>
        <span>Edited {plan.lastEdited}</span>
      </div>

      <button
        onClick={onEdit}
        className="mt-3 w-full h-9 text-sm rounded-lg border border-stone-300 hover:bg-stone-50 hover:border-[#D4D1CB] text-stone-700 hover:text-[#1A1A1A] font-medium inline-flex items-center justify-center gap-1.5"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Edit
      </button>
    </div>
  );
}
