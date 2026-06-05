"use client";

import { Check, Dumbbell, Plus, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { getClient } from "@/lib/data";

function formatNextMonday() {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().slice(0, 10);
}

export function AssignPlanModal() {
  const {
    assignPlanPicker,
    closeAssignPlanPicker,
    plans,
    assignClientsToPlan,
    openNewPlanModal,
    showToast,
  } = useApp();
  const [search, setSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(formatNextMonday());

  useEffect(() => {
    if (assignPlanPicker) {
      setSelectedPlanId(null);
      setSearch("");
      setStartDate(formatNextMonday());
    }
  }, [assignPlanPicker]);

  const client = assignPlanPicker ? getClient(assignPlanPicker.clientId) : undefined;
  const filtered = useMemo(
    () =>
      plans.filter(
        (p) =>
          p.type === "template" &&
          p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [plans, search]
  );

  if (!client) return null;

  const submit = () => {
    if (!selectedPlanId) return;
    const plan = plans.find((p) => p.id === selectedPlanId);
    assignClientsToPlan(selectedPlanId, [client.id]);
    const dateStr = new Date(startDate).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
    showToast(
      `${plan?.name} assigned to ${client.name} — they'll receive it on ${dateStr}`,
      "success"
    );
    closeAssignPlanPicker();
  };

  const createCustom = () => {
    closeAssignPlanPicker();
    openNewPlanModal({ customForClientId: client.id });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={closeAssignPlanPicker} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] scale-in">
        <div className="px-6 pt-5 pb-3 border-b border-stone-100">
          <button
            onClick={closeAssignPlanPicker}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-stone-900 pr-6">
            Assign a plan to <span className="text-[#1A1A1A]">{client.name}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pick a template, or create a one-off custom plan just for this client.
          </p>
        </div>

        <div className="px-6 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <button
            onClick={createCustom}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F7EEE8] mb-1 border border-transparent hover:border-[#DCC3B2]"
          >
            <div className="h-9 w-9 rounded-lg bg-[#F7EEE8] grid place-items-center text-[#8A4427] shrink-0">
              <Plus className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-stone-900 inline-flex items-center gap-1.5">
                Create custom plan for {client.name.split(" ")[0]}
                <Sparkles className="h-3 w-3 text-[#C05C28]" />
              </div>
              <div className="text-xs text-stone-500">One-off plan, won't be saved as template</div>
            </div>
          </button>

          <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold px-3 py-2">
            Templates
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-stone-500">No matching templates</div>
          ) : (
            filtered.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    isSelected ? "bg-[#F5F4F2]" : "hover:bg-stone-50"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full border-2 grid place-items-center shrink-0 ${
                      isSelected
                        ? "bg-[#1C1C1C] border-[#1C1C1C] text-white"
                        : "border-stone-300"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-[#F5F4F2] grid place-items-center text-[#1A1A1A] shrink-0">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-900 truncate">{p.name}</div>
                    <div className="text-xs text-stone-500">
                      {p.durationWeeks} weeks · {p.clientIds.length} client{p.clientIds.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/60 flex justify-end gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-stone-600">
            Starts:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2 py-1 rounded border border-stone-300 focus:border-[#1C1C1C] outline-none bg-white"
            />
          </label>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
          <button
            onClick={closeAssignPlanPicker}
            className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!selectedPlanId}
            className="px-4 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Assign plan
          </button>
        </div>
      </div>
    </div>
  );
}
