"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles, X } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { getClient } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

const presetDurations = [4, 8, 12, 16] as const;
const presetCycleLengths = [2, 4, 6, 8] as const;

type DurationChoice = number | "custom";
type CycleChoice = number | "custom";

export function NewPlanModal() {
  const router = useRouter();
  const {
    newPlanOpen,
    newPlanPrefill,
    closeNewPlanModal,
    showToast,
  } = useApp();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [durationChoice, setDurationChoice] = useState<DurationChoice>(12);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [cycleChoice, setCycleChoice] = useState<CycleChoice>(4);
  const [customCycle, setCustomCycle] = useState<string>("");
  const [description, setDescription] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(true);

  const customClient = newPlanPrefill?.customForClientId
    ? getClient(newPlanPrefill.customForClientId)
    : undefined;

  useEffect(() => {
    if (newPlanOpen) {
      setName(customClient ? `${customClient.name.split(" ")[0]}'s custom plan` : "");
      setDurationChoice(12);
      setCustomDuration("");
      setCycleChoice(4);
      setCustomCycle("");
      setDescription("");
      // When opening via "Create custom plan for client", default to NOT saving as template
      setSaveAsTemplate(!customClient);
    }
  }, [newPlanOpen, customClient]);

  // Resolve numeric values + validation
  const resolved = useMemo(() => {
    const durationNum =
      durationChoice === "custom"
        ? customDuration === "" ? null : Number(customDuration)
        : durationChoice;
    const cycleNum =
      cycleChoice === "custom"
        ? customCycle === "" ? null : Number(customCycle)
        : cycleChoice;

    const errors: { duration?: string; cycle?: string } = {};

    if (durationChoice === "custom") {
      if (customDuration === "") {
        errors.duration = "Please enter the number of weeks";
      } else if (!Number.isInteger(durationNum) || (durationNum as number) < 1 || (durationNum as number) > 52) {
        errors.duration = "Duration must be between 1 and 52 weeks";
      }
    }

    if (cycleChoice === "custom") {
      if (customCycle === "") {
        errors.cycle = "Please enter the cycle length in weeks";
      } else if (!Number.isInteger(cycleNum) || (cycleNum as number) < 1) {
        errors.cycle = "Cycle length must be at least 1 week";
      }
    }

    // Cross-validation: cycle ≤ duration
    if (!errors.cycle && durationNum !== null && cycleNum !== null && (cycleNum as number) > (durationNum as number)) {
      errors.cycle = `Cycle length can't exceed total duration (${durationNum} weeks)`;
    }

    return {
      durationNum,
      cycleNum,
      errors,
      isValid: !errors.duration && !errors.cycle && durationNum !== null && cycleNum !== null,
    };
  }, [durationChoice, customDuration, cycleChoice, customCycle]);

  if (!newPlanOpen) return null;

  const create = async () => {
    if (!resolved.isValid || resolved.durationNum === null || resolved.cycleNum === null) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Not signed in — please refresh");
      setSaving(false);
      return;
    }

    const dur = resolved.durationNum;
    const cycleLen = resolved.cycleNum;
    const planType = saveAsTemplate ? "template" : "custom";

    const { data: newPlan, error } = await supabase
      .from("plans")
      .insert({
        trainer_id: user.id,
        name: name.trim() || "Untitled plan",
        description: description.trim() || null,
        duration_weeks: dur,
        cycle_length_weeks: cycleLen,
        type: planType,
      })
      .select("id")
      .single();

    setSaving(false);

    if (error || !newPlan) {
      showToast(`Failed to create plan: ${error?.message ?? "unknown error"}`);
      return;
    }

    showToast(planType === "template" ? "Template created" : "Plan created", "success");
    closeNewPlanModal();
    router.push(`/plans/${newPlan.id}/edit`);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-6 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={closeNewPlanModal} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 scale-in">
        <button
          onClick={closeNewPlanModal}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-stone-900 mb-1 pr-6">
          {customClient ? `Custom plan for ${customClient.name}` : "Create new plan"}
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          {customClient
            ? "Tailor this plan to one client. You can still save it as a template if useful."
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
              className="w-full h-10 px-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Duration */}
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5">Duration</label>
              <select
                value={durationChoice}
                onChange={(e) =>
                  setDurationChoice(e.target.value === "custom" ? "custom" : Number(e.target.value))
                }
                className="w-full h-10 px-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm bg-white"
              >
                {presetDurations.map((d) => (
                  <option key={d} value={d}>{d} weeks</option>
                ))}
                <option value="custom">Custom</option>
              </select>
              {durationChoice === "custom" && (
                <div className="mt-2">
                  <label className="text-[11px] text-stone-600 block mb-1">Custom duration (weeks)</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="e.g., 6"
                    className={`w-full h-9 px-3 rounded-md border text-sm outline-none focus:ring-2 ${
                      resolved.errors.duration
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-stone-300 focus:border-[#1C1C1C] focus:ring-[#E5E3DE]"
                    }`}
                  />
                  {resolved.errors.duration && (
                    <p className="mt-1 text-[11px] text-red-600 inline-flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {resolved.errors.duration}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cycle length */}
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5">Cycle length</label>
              <select
                value={cycleChoice}
                onChange={(e) =>
                  setCycleChoice(e.target.value === "custom" ? "custom" : Number(e.target.value))
                }
                className="w-full h-10 px-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm bg-white"
              >
                {presetCycleLengths.map((c) => (
                  <option key={c} value={c}>
                    {c} weeks{c === 4 ? " (default)" : ""}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
              {cycleChoice === "custom" && (
                <div className="mt-2">
                  <label className="text-[11px] text-stone-600 block mb-1">Custom cycle length (weeks)</label>
                  <input
                    type="number"
                    min={1}
                    value={customCycle}
                    onChange={(e) => setCustomCycle(e.target.value)}
                    placeholder="e.g., 3"
                    className={`w-full h-9 px-3 rounded-md border text-sm outline-none focus:ring-2 ${
                      resolved.errors.cycle
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-stone-300 focus:border-[#1C1C1C] focus:ring-[#E5E3DE]"
                    }`}
                  />
                  {resolved.errors.cycle && (
                    <p className="mt-1 text-[11px] text-red-600 inline-flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {resolved.errors.cycle}
                    </p>
                  )}
                </div>
              )}
              {/* Show cycle-vs-duration error even when cycle is from preset */}
              {cycleChoice !== "custom" && resolved.errors.cycle && (
                <p className="mt-1 text-[11px] text-red-600 inline-flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {resolved.errors.cycle}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          {resolved.durationNum !== null && resolved.cycleNum !== null && !resolved.errors.duration && !resolved.errors.cycle && (
            <div className="text-xs text-stone-500 -mt-1">
              {resolved.durationNum} weeks · {Math.max(1, Math.ceil(resolved.durationNum / resolved.cycleNum))} cycle
              {Math.ceil(resolved.durationNum / resolved.cycleNum) !== 1 ? "s" : ""} of {resolved.cycleNum} weeks
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">
              Description <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Who is this plan for, what's the focus..."
              className="w-full p-3 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm resize-none"
            />
          </div>

          {/* Save as template */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none p-3 rounded-lg border border-stone-200 hover:bg-stone-50">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#1C1C1C] cursor-pointer"
            />
            <div className="text-xs leading-relaxed">
              <div className="font-medium text-stone-800">Save as reusable template</div>
              <div className="text-stone-500 mt-0.5">
                {saveAsTemplate
                  ? "Available under Templates — assign to any client later."
                  : "One-off plan — appears under Custom plans only."}
              </div>
            </div>
          </label>

          <div className="bg-[#F5F4F2]/60 border border-[#E5E3DE] rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-[#1A1A1A] mt-0.5 shrink-0" />
            <p className="text-xs text-[#1A1A1A] leading-relaxed">
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
            disabled={!resolved.isValid || saving}
            className="px-4 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <span className="h-3.5 w-3.5 rounded-full border-2 border-white/50 border-t-white animate-spin" />}
            {saving ? "Creating…" : "Create plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
