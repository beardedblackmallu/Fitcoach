"use client";

import {
  ArrowLeft,
  Copy,
  Dumbbell,
  Edit3,
  GripVertical,
  Lock,
  Plus,
  Search,
  Send,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DayKey,
  ExerciseEntry,
  exerciseLibrary,
  initialWeekPlan,
} from "@/lib/data";
import { useApp } from "@/lib/AppContext";

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayLabels: Record<DayKey, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};
const categories = ["All", "Push", "Pull", "Legs", "Core", "Cardio"] as const;

const emptyWeek: Record<DayKey, ExerciseEntry[]> = {
  Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [],
};

export default function PlanEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast, plans, openClientPicker } = useApp();

  const plan = useMemo(() => plans.find((p) => p.id === params.id), [plans, params.id]);

  const [planName, setPlanName] = useState(plan?.name ?? "Untitled plan");
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeCycle] = useState(1);
  const [week, setWeek] = useState<Record<DayKey, ExerciseEntry[]>>(
    plan && plan.clientIds.length > 0 ? initialWeekPlan : emptyWeek
  );
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCat, setLibraryCat] = useState<(typeof categories)[number]>("All");
  const [editingNote, setEditingNote] = useState<{ day: DayKey; id: string } | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  if (!plan) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-2xl mx-auto text-center">
        <Dumbbell className="h-10 w-10 text-stone-300 mx-auto mb-2" />
        <h2 className="text-lg font-semibold text-stone-800">Plan not found</h2>
        <p className="text-sm text-stone-500 mt-1">This plan may have been deleted.</p>
        <Link href="/plans" className="mt-4 inline-block text-sm text-teal-700 hover:underline">
          ← Back to all plans
        </Link>
      </div>
    );
  }

  const filteredLibrary = exerciseLibrary.filter((e) => {
    const matchesCat = libraryCat === "All" || e.category === libraryCat;
    const matchesSearch = e.name.toLowerCase().includes(librarySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addExerciseToDay = (day: DayKey, name: string) => {
    const id = `${day}-${Date.now()}`;
    setWeek((p) => ({
      ...p,
      [day]: [...p[day].filter((x) => !x.rest), { id, name, detail: "3×10" }],
    }));
    showToast(`${name} added to ${dayLabels[day]}`, "success");
  };

  const addRestDay = (day: DayKey) => {
    setWeek((p) => ({
      ...p,
      [day]: [{ id: `${day}-rest-${Date.now()}`, name: "Rest day", detail: "Recovery", rest: true }],
    }));
  };

  const removeExercise = (day: DayKey, id: string) => {
    setWeek((p) => ({
      ...p,
      [day]: p[day].filter((x) => x.id !== id),
    }));
  };

  const openNote = (day: DayKey, ex: ExerciseEntry) => {
    setEditingNote({ day, id: ex.id });
    setNoteDraft(ex.notes ?? "");
  };

  const saveNote = () => {
    if (!editingNote) return;
    setWeek((p) => ({
      ...p,
      [editingNote.day]: p[editingNote.day].map((x) =>
        x.id === editingNote.id ? { ...x, notes: noteDraft } : x
      ),
    }));
    setEditingNote(null);
    showToast("Notes saved", "success");
  };

  const cycleCount = plan.cycles;
  const weeksPerCycle = plan.cycleLengthWeeks;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.push("/plans")}
        className="text-xs text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All plans
      </button>

      {/* Header */}
      <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Dumbbell className="h-5 w-5 text-teal-600 shrink-0" />
          <input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            onBlur={() => showToast("Plan name saved", "success")}
            className="text-2xl font-semibold bg-transparent border-b-2 border-transparent hover:border-stone-200 focus:border-teal-500 focus:outline-none px-1 py-1 min-w-0 flex-1 max-w-md"
          />
          <Edit3 className="h-3.5 w-3.5 text-stone-400" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Plan saved as draft", "success")}
            className="h-9 px-3 text-sm rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium"
          >
            Save plan
          </button>
          <button
            onClick={() => openClientPicker(plan)}
            className="h-9 px-3 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium inline-flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            Assign to client
          </button>
        </div>
      </div>

      {/* Cycle navigation */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-teal-600 text-white"
        >
          Cycle 1 (Weeks 1-{weeksPerCycle})
        </button>
        {Array.from({ length: Math.max(0, cycleCount - 1) }).map((_, i) => (
          <button
            key={i}
            title="Plan when Cycle 1 ends — uses logs to inform next cycle"
            disabled
            className="text-sm font-medium px-3 py-1.5 rounded-lg text-stone-400 bg-stone-50 inline-flex items-center gap-1.5 cursor-not-allowed"
          >
            <Lock className="h-3.5 w-3.5" />
            Cycle {i + 2}
          </button>
        ))}
      </div>

      {/* Week tabs */}
      <div className="flex items-center gap-1 border-b border-stone-200 mb-4 overflow-x-auto">
        {Array.from({ length: weeksPerCycle }).map((_, i) => {
          const w = i + 1;
          return (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeWeek === w
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Week {w}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Library */}
        <aside className="bg-white border border-stone-200 rounded-xl p-3 h-fit lg:sticky lg:top-20">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-1">
            Exercise library
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full h-8 pl-8 pr-2 rounded-md bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 outline-none text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setLibraryCat(cat)}
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  libraryCat === cat
                    ? "bg-teal-100 text-teal-700"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {filteredLibrary.map((ex) => (
              <ExerciseLibraryItem
                key={ex.name}
                name={ex.name}
                category={ex.category}
                onAdd={(day) => addExerciseToDay(day, ex.name)}
              />
            ))}
            {filteredLibrary.length === 0 && (
              <div className="text-xs text-stone-400 text-center py-6">No matches</div>
            )}
          </div>
        </aside>

        {/* 7-day grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {days.map((day) => (
            <div key={day} className="bg-white border border-stone-200 rounded-xl flex flex-col">
              <div className="px-3 py-2 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{day}</div>
                  <div className="text-[10px] text-stone-400">{dayLabels[day]}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => addRestDay(day)}
                    className="p-1 rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-700 text-[10px]"
                    title="Mark as rest day"
                  >
                    Rest
                  </button>
                  <button
                    onClick={() => addExerciseToDay(day, "New exercise")}
                    className="p-1 rounded-md hover:bg-stone-100 text-stone-500"
                    aria-label="Add exercise"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2 space-y-1.5 min-h-[140px] flex-1">
                {week[day].length === 0 && (
                  <div className="text-[11px] text-stone-400 text-center py-6">
                    Empty
                    <button
                      onClick={() => addExerciseToDay(day, "New exercise")}
                      className="block mx-auto text-teal-700 hover:underline text-[11px] mt-1"
                    >
                      + Add exercise
                    </button>
                  </div>
                )}
                {week[day].length > 0 && week[day][0]?.rest ? (
                  <div className="rounded-lg bg-stone-50 border border-stone-100 p-3 text-center">
                    <div className="text-sm italic text-stone-600 font-medium">Rest day</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Recovery</div>
                    <button
                      onClick={() => addExerciseToDay(day, "New exercise")}
                      className="text-[11px] text-teal-700 hover:underline mt-2 inline-block"
                    >
                      + Add exercise
                    </button>
                  </div>
                ) : (
                  week[day].map((ex) => (
                    <div
                      key={ex.id}
                      className="group rounded-lg border border-stone-200 bg-white hover:border-teal-300 hover:shadow-sm p-2 transition-all"
                    >
                      <div className="flex items-start gap-1">
                        <GripVertical className="h-3 w-3 text-stone-300 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-stone-800 truncate">{ex.name}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">{ex.detail}</div>
                          {ex.notes && (
                            <div className="text-[10px] text-amber-700 mt-1 italic line-clamp-2">📝 {ex.notes}</div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-0.5">
                          <button
                            onClick={() => openNote(day, ex)}
                            className={`p-0.5 rounded hover:bg-stone-100 ${ex.notes ? "text-amber-600" : "text-stone-400"}`}
                            title="Form cues"
                          >
                            <StickyNote className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeExercise(day, ex.id)}
                            className="p-0.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"
                            title="Remove"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-2 pb-2 flex items-center gap-1">
                <button
                  onClick={() => showToast(`${day} duplicated to ${days[(days.indexOf(day) + 1) % 7]}`)}
                  className="text-[10px] text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 px-1.5 py-1 rounded hover:bg-stone-100"
                >
                  <Copy className="h-3 w-3" />
                  Duplicate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingNote(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 scale-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-amber-500" />
                Form cues
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 rounded-md hover:bg-stone-100 text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={5}
              placeholder="e.g., chest up, brace core, drive through heels..."
              className="w-full p-3 rounded-lg border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setEditingNote(null)}
                className="px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="px-3 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
              >
                Save notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseLibraryItem({
  name,
  category,
  onAdd,
}: {
  name: string;
  category: string;
  onAdd: (day: DayKey) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 flex items-center justify-between gap-2 group"
      >
        <div className="min-w-0">
          <div className="text-xs font-medium text-stone-800 truncate">{name}</div>
          <div className="text-[10px] text-stone-400">{category}</div>
        </div>
        <Plus className="h-3.5 w-3.5 text-stone-400 group-hover:text-teal-600 shrink-0" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-stone-200 rounded-lg shadow-lg p-1.5 w-32 scale-in origin-top-right">
          <div className="text-[10px] uppercase tracking-wide text-stone-400 px-2 pb-1">Add to</div>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => {
                onAdd(day);
                setOpen(false);
              }}
              className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-teal-50 hover:text-teal-700"
            >
              {dayLabels[day]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
