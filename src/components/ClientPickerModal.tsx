"use client";

import { Check, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { clients } from "@/lib/data";
import { Avatar } from "./Avatar";

function formatNextMonday() {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().slice(0, 10);
}

export function ClientPickerModal() {
  const { clientPicker, closeClientPicker, assignClientsToPlan, showToast } = useApp();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(formatNextMonday());

  useEffect(() => {
    if (clientPicker) {
      setSelected([]);
      setSearch("");
      setStartDate(formatNextMonday());
    }
  }, [clientPicker]);

  const plan = clientPicker?.plan;

  const list = useMemo(
    () =>
      clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  if (!plan) return null;

  const toggle = (id: string) => {
    if (plan.clientIds.includes(id)) return; // already assigned, can't deselect
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    if (selected.length === 0) return;
    assignClientsToPlan(plan.id, selected);
    const dateStr = new Date(startDate).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
    showToast(
      `Plan assigned to ${selected.length} client${selected.length > 1 ? "s" : ""} — they'll receive it on ${dateStr}`,
      "success"
    );
    closeClientPicker();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={closeClientPicker} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] scale-in">
        <div className="px-6 pt-5 pb-3 border-b border-stone-100">
          <button
            onClick={closeClientPicker}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-stone-900 pr-6">
            Assign <span className="text-teal-700">{plan.name}</span> to client(s)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pick one or more clients. They'll get the plan via WhatsApp on the start date.
          </p>
        </div>

        <div className="px-6 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {list.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-stone-500">No matches</div>
          ) : (
            list.map((c) => {
              const alreadyAssigned = plan.clientIds.includes(c.id);
              const isSelected = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  disabled={alreadyAssigned}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    alreadyAssigned
                      ? "opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "bg-teal-50"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-md border-2 grid place-items-center shrink-0 ${
                      alreadyAssigned || isSelected
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "border-stone-300"
                    }`}
                  >
                    {(alreadyAssigned || isSelected) && <Check className="h-3 w-3" strokeWidth={3} />}
                  </div>
                  <Avatar initials={c.initials} color={c.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-stone-900 truncate">{c.name}</div>
                    <div className="text-xs text-stone-500 truncate">
                      {alreadyAssigned ? "Already on this plan" : `Currently: ${c.plan}`}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/60">
          <div className="flex items-center justify-between gap-3 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Plan duration: <span className="font-medium text-stone-800">{plan.durationWeeks} weeks</span>
            </span>
            <label className="inline-flex items-center gap-2">
              Starts:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs px-2 py-1 rounded border border-stone-300 focus:border-teal-500 outline-none bg-white"
              />
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
          <button
            onClick={closeClientPicker}
            className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={selected.length === 0}
            className="px-4 h-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selected.length === 0
              ? "Assign"
              : `Assign to ${selected.length} client${selected.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
