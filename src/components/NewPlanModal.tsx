"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { Plan } from "@/lib/data";
import { getClient } from "@/lib/data";

const durations = [4, 8, 12, 16] as const;
const cycleLengths = [2, 4, 6, 8] as const;

export function NewPlanModal() {
  const router = useRouter();
  const { newPlanOpen, newPlanPrefill, closeNewPlanModal, addPlan, showToast, assignClientsToPlan } = useApp();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number | "custom">(12);
  const [cycleLen, setCycleLen] = useState<number>(4);
  const [description, setDescription] = useState("");

  const customClient = newPlanPrefill?.customForClientId
    ? getClient(newPlanPrefill.customForClientId)
    : undefined;

  useEffect(() => {
    if (newPlanOpen) {
      setName(customClient ? `${customClient.name.split(" ")[0]}'s custom plan` : "");
      setDuration(12);
      setCycleLen(4);
      setDescription("");
    }
  }, [newPlanOpen, customClient]);

  if (!newPlanOpen) return null;

  const create = () => {
    const dur = typeof duration === "number" ? duration : 12;
    const id = `p-${Date.now()}`;
    const plan: Plan = {
      id,
      name: name.trim() || "Untitled plan",
      durationWeeks: dur,
      cycleLengthWeeks: cycleLen,
      cycles: Math.max(1, Math.ceil(dur / cycleLen)),
      clientIds: customClient ? [customClient.id] : [],
      lastEdited: "just now",
      description: description.trim() || undefined,
      type: customClient ? "custom" : "template",
    };
    addPlan(plan);
    if (customClient) {
      assignClientsToPlan(id, [customClient.id]);
      showToast(`Custom plan created for ${customClient.name}`, "success");
    } else {
      showToast("Plan created", "success");
    }
    closeNewPlanModal();
    router.push(`/plans/${id}/edit`);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={closeNewPlanModal} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 scale-in">
        <button
          onClick={closeNewPlanModal}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-stone-900 mb-1">
          {customClient ? `Custom plan for ${customClient.name}` : "Create new plan"}
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          {customClient
            ? "This plan will only be assigned to this client and won't appear in templates."
            : "Reusable templates can be assigned to any client."}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">Plan name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 12-Week Transformation"
              className="w-full h-10 px-3 rounded-lg border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value === "custom" ? "custom" : Number(e.target.value))
                }
                className="w-full h-10 px-3 rounded-lg border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-white"
              >
                {durations.map((d) => (
                  <option key={d} value={d}>{d} weeks</option>
                ))}
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5">Cycle length</label>
              <select
                value={cycleLen}
                onChange={(e) => setCycleLen(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-white"
              >
                {cycleLengths.map((c) => (
                  <option key={c} value={c}>{c} weeks{c === 4 ? " (default)" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">
              Description <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Who is this plan for, what's the focus..."
              className="w-full p-3 rounded-lg border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm resize-none"
            />
          </div>

          <div className="bg-teal-50/60 border border-teal-100 rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
            <p className="text-xs text-teal-800 leading-relaxed">
              You'll start with an empty grid. Drag exercises from the library to build out each
              day, then assign to clients when ready.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={closeNewPlanModal}
            className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={create}
            className="px-4 h-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm"
          >
            Create plan
          </button>
        </div>
      </div>
    </div>
  );
}
