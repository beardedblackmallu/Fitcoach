"use client";

import {
  ArrowLeft,
  Apple,
  Copy,
  Dumbbell,
  Edit3,
  GripVertical,
  Lock,
  Pencil,
  Plus,
  Search,
  Send,
  StickyNote,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DayKey,
  ExerciseEntry,
  exerciseLibrary,
  emptyNutritionPlan,
  NutritionPlan,
} from "@/lib/data";
import { useApp } from "@/lib/AppContext";
import { createClient } from "@/lib/supabase/client";
import { NutritionTab } from "@/components/NutritionTab";
import { VideoLinkModal } from "@/components/VideoLinkModal";

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayLabels: Record<DayKey, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};
const categories = ["All", "Push", "Pull", "Legs", "Core", "Cardio"] as const;

const emptyWeek: Record<DayKey, ExerciseEntry[]> = {
  Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [],
};

type TopTab = "workouts" | "nutrition";

export default function PlanEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    showToast,
    openClientPicker,
    openExerciseVideo,
    libraryVideos,
    setLibraryVideo,
    removeLibraryVideo,
  } = useApp();

  // Plan metadata from DB
  const [planName, setPlanName] = useState("Untitled plan");
  const [planCycles, setPlanCycles] = useState(1);
  const [planWeeksPerCycle, setPlanWeeksPerCycle] = useState(4);
  const [planLoading, setPlanLoading] = useState(true);
  const [planNotFound, setPlanNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  const [topTab, setTopTab] = useState<TopTab>("workouts");
  const [activeWeek, setActiveWeek] = useState(1);
  const [week, setWeek] = useState<Record<DayKey, ExerciseEntry[]>>(emptyWeek);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan>(
    JSON.parse(JSON.stringify(emptyNutritionPlan))
  );
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCat, setLibraryCat] = useState<(typeof categories)[number]>("All");
  const [libraryDrawerOpen, setLibraryDrawerOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{ day: DayKey; id: string } | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [videoLinkFor, setVideoLinkFor] = useState<string | null>(null);

  // Load plan + exercises from Supabase — useEffect re-runs when plan ID changes
  useEffect(() => {
    let cancelled = false;
    setPlanLoading(true);
    setPlanNotFound(false);
    setWeek(emptyWeek);

    const supabase = createClient();

    supabase
      .from("plans")
      .select("id, name, duration_weeks, cycle_length_weeks")
      .eq("id", params.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) { setPlanNotFound(true); setPlanLoading(false); return; }

        setPlanName(data.name);
        const cycleLen = data.cycle_length_weeks as number;
        const dur = data.duration_weeks as number;
        setPlanWeeksPerCycle(cycleLen);
        setPlanCycles(Math.max(1, Math.ceil(dur / cycleLen)));

        supabase
          .from("plan_exercises")
          .select("day_key, exercise_name, sets_reps, notes, order_index, is_rest_day")
          .eq("plan_id", params.id)
          .eq("cycle_number", 1)
          .eq("week_number", 1)
          .order("order_index")
          .then(({ data: exRows }) => {
            if (cancelled) return;
            if (exRows && exRows.length > 0) {
              const loaded: Record<DayKey, ExerciseEntry[]> = { ...emptyWeek };
              exRows.forEach((row, i) => {
                const day = (row.day_key.charAt(0).toUpperCase() + row.day_key.slice(1)) as DayKey;
                if (!loaded[day]) loaded[day] = [];
                loaded[day].push({
                  id: `${day}-${i}`,
                  name: row.exercise_name,
                  detail: row.sets_reps ?? "3×10",
                  notes: row.notes ?? undefined,
                  rest: row.is_rest_day,
                });
              });
              setWeek(loaded);
            }
            setPlanLoading(false);
          });
      });

    return () => { cancelled = true; };
  }, [params.id]);

  const savePlan = async () => {
    setSaving(true);
    const supabase = createClient();

    // Update plan name + last_edited_at
    await supabase
      .from("plans")
      .update({ name: planName, last_edited_at: new Date().toISOString() })
      .eq("id", params.id);

    // Replace all exercises for cycle 1 / week 1
    await supabase
      .from("plan_exercises")
      .delete()
      .eq("plan_id", params.id)
      .eq("cycle_number", 1)
      .eq("week_number", 1);

    const rows = days.flatMap((day, dayIdx) =>
      week[day].map((ex, i) => ({
        plan_id: params.id,
        cycle_number: 1,
        week_number: 1,
        day_key: day.toLowerCase(),
        exercise_name: ex.name,
        sets_reps: ex.detail,
        notes: ex.notes ?? null,
        order_index: dayIdx * 100 + i,
        is_rest_day: ex.rest ?? false,
      }))
    );

    if (rows.length > 0) {
      await supabase.from("plan_exercises").insert(rows);
    }

    setSaving(false);
    showToast("Plan saved", "success");
  };

  if (planLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-2xl mx-auto text-center animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded mx-auto mb-3" />
        <div className="h-4 w-32 bg-stone-100 rounded mx-auto" />
      </div>
    );
  }

  if (planNotFound) {
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

  const updateExercise = (day: DayKey, id: string, patch: Partial<ExerciseEntry>) => {
    setWeek((p) => ({
      ...p,
      [day]: p[day].map((x) => (x.id === id ? { ...x, ...patch } : x)),
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

  const cycleCount = planCycles;
  const weeksPerCycle = planWeeksPerCycle;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 max-w-[1400px] mx-auto">
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
        {/* Header action buttons — visible on tablet+; on mobile they appear as a sticky bottom bar below */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={savePlan}
            disabled={saving}
            className="h-9 px-3 text-sm rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />}
            {saving ? "Saving…" : "Save plan"}
          </button>
          <button
            onClick={() => showToast("Assign clients — coming soon")}
            className="h-9 px-3 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium inline-flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            Send plan to client
          </button>
        </div>
      </div>

      {/* Top tabs: Workouts / Nutrition */}
      <div className="flex items-center gap-1 border-b border-stone-200 mb-5">
        <button
          onClick={() => setTopTab("workouts")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors inline-flex items-center gap-1.5 ${
            topTab === "workouts"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Dumbbell className="h-4 w-4" /> Workouts
        </button>
        <button
          onClick={() => setTopTab("nutrition")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors inline-flex items-center gap-1.5 ${
            topTab === "nutrition"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Apple className="h-4 w-4" /> Nutrition
        </button>
      </div>

      {topTab === "nutrition" ? (
        <NutritionTab plan={nutritionPlan} setPlan={(updater) => setNutritionPlan(updater)} />
      ) : (
        <>
          {/* Cycle navigation */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button className="text-sm font-medium px-3 py-1.5 rounded-lg bg-teal-600 text-white">
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
            {/* Library — inline on desktop only */}
            <aside className="hidden lg:block bg-white border border-stone-200 rounded-xl p-3 h-fit lg:sticky lg:top-20">
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
                    videoUrl={libraryVideos[ex.name] ?? ""}
                    onEdit={() => setVideoLinkFor(ex.name)}
                    onWatch={() => {
                      const u = libraryVideos[ex.name];
                      if (u) openExerciseVideo(ex.name, u);
                    }}
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
                      week[day].map((ex) => {
                        const libUrl = libraryVideos[ex.name] ?? "";
                        return (
                          <ExerciseCardInGrid
                            key={ex.id}
                            ex={ex}
                            libraryVideoUrl={libUrl}
                            onWatch={() => {
                              if (libUrl) openExerciseVideo(ex.name, libUrl);
                            }}
                            onOpenNote={() => openNote(day, ex)}
                            onRemove={() => removeExercise(day, ex.id)}
                          />
                        );
                      })
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
        </>
      )}

      {/* Video link modal */}
      <VideoLinkModal
        open={videoLinkFor !== null}
        exerciseName={videoLinkFor ?? ""}
        initialUrl={videoLinkFor ? (libraryVideos[videoLinkFor] ?? "") : ""}
        onSave={(url) => {
          if (videoLinkFor) {
            setLibraryVideo(videoLinkFor, url);
            showToast("Video link updated", "success");
          }
          setVideoLinkFor(null);
        }}
        onRemove={() => {
          if (videoLinkFor) {
            removeLibraryVideo(videoLinkFor);
            showToast("Video link removed", "success");
          }
          setVideoLinkFor(null);
        }}
        onClose={() => setVideoLinkFor(null)}
      />

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

      {/* Mobile-only FAB to open the exercise library drawer (only on Workouts tab) */}
      {topTab === "workouts" && (
        <button
          onClick={() => setLibraryDrawerOpen(true)}
          className="lg:hidden fixed right-4 bottom-[124px] z-20 h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-lg grid place-items-center"
          aria-label="Open exercise library"
        >
          <Dumbbell className="h-6 w-6" />
        </button>
      )}

      {/* Mobile-only library drawer (slide-up sheet) */}
      {libraryDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 fade-in">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setLibraryDrawerOpen(false)}
          />
          <div
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-2xl border-t border-stone-200 max-h-[80vh] flex flex-col pb-[env(safe-area-inset-bottom)] scale-in origin-bottom"
            style={{ animation: "slide-up 0.22s ease-out forwards" }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
              <div className="text-sm font-semibold text-stone-900 inline-flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-teal-600" />
                Exercise library
              </div>
              <button
                onClick={() => setLibraryDrawerOpen(false)}
                className="p-2 -mr-2 rounded-md hover:bg-stone-100 text-stone-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 pt-1 pb-2 shrink-0">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 outline-none text-sm"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLibraryCat(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium shrink-0 ${
                      libraryCat === cat
                        ? "bg-teal-100 text-teal-700"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-3">
              {filteredLibrary.map((ex) => (
                <ExerciseLibraryItem
                  key={ex.name}
                  name={ex.name}
                  category={ex.category}
                  videoUrl={libraryVideos[ex.name] ?? ""}
                  onEdit={() => setVideoLinkFor(ex.name)}
                  onWatch={() => {
                    const u = libraryVideos[ex.name];
                    if (u) openExerciseVideo(ex.name, u);
                  }}
                  onAdd={(day) => {
                    addExerciseToDay(day, ex.name);
                    setLibraryDrawerOpen(false);
                  }}
                />
              ))}
              {filteredLibrary.length === 0 && (
                <div className="text-sm text-stone-400 text-center py-8">No matches</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-only sticky bottom action bar: Save + Send */}
      <div className="md:hidden fixed bottom-[56px] inset-x-0 z-20 bg-white border-t border-stone-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-3 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center gap-2">
        <button
          onClick={savePlan}
          disabled={saving}
          className="flex-1 h-11 rounded-lg border border-stone-300 active:bg-stone-100 text-stone-700 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving && <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />}
          {saving ? "Saving…" : "Save plan"}
        </button>
        <button
          onClick={() => showToast("Assign clients — coming soon")}
          className="flex-[1.6] h-11 rounded-lg bg-teal-600 active:bg-teal-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5"
        >
          <Send className="h-4 w-4" />
          Send plan
        </button>
      </div>
    </div>
  );
}

function ExerciseCardInGrid({
  ex, libraryVideoUrl, onWatch, onOpenNote, onRemove,
}: {
  ex: ExerciseEntry;
  libraryVideoUrl: string;
  onWatch: () => void;
  onOpenNote: () => void;
  onRemove: () => void;
}) {
  const hasUrl = libraryVideoUrl.trim().length > 0;

  return (
    <div className="group rounded-lg border border-stone-200 bg-white hover:border-teal-300 hover:shadow-sm p-2 transition-all">
      <div className="flex items-start gap-1">
        <GripVertical className="h-3 w-3 text-stone-300 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-stone-800 truncate">{ex.name}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">{ex.detail}</div>
          {ex.notes && (
            <div className="text-[10px] text-amber-700 mt-1 italic line-clamp-2">📝 {ex.notes}</div>
          )}

          {hasUrl && (
            <button
              onClick={onWatch}
              className="mt-1.5 text-[10px] font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-red-50"
              title="Watch form video (set on the library)"
            >
              <Video className="h-3 w-3" />
              Watch form
            </button>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-0.5">
          <button
            onClick={onOpenNote}
            className={`p-0.5 rounded hover:bg-stone-100 ${ex.notes ? "text-amber-600" : "text-stone-400"}`}
            title="Form cues"
          >
            <StickyNote className="h-3 w-3" />
          </button>
          <button
            onClick={onRemove}
            className="p-0.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"
            title="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ExerciseLibraryItem({
  name,
  category,
  videoUrl,
  onEdit,
  onWatch,
  onAdd,
}: {
  name: string;
  category: string;
  videoUrl: string;
  onEdit: () => void;
  onWatch: () => void;
  onAdd: (day: DayKey) => void;
}) {
  const [dayOpen, setDayOpen] = useState(false);
  const hasUrl = videoUrl.trim().length > 0;

  return (
    <div className="rounded-md border border-transparent hover:border-stone-200 hover:bg-stone-50 px-2 py-1.5 relative group/row">
      <div className="flex items-start gap-1">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-stone-800 truncate">{name}</div>
          <div className="text-[10px] text-stone-400">{category}</div>
        </div>
        <button
          onClick={() => setDayOpen((o) => !o)}
          className="p-1 rounded text-stone-400 hover:text-teal-600 hover:bg-teal-50 shrink-0"
          title="Add to day"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-1 flex items-center gap-1">
        {hasUrl ? (
          <>
            <button
              onClick={onWatch}
              className="text-[10px] font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-red-50"
              title="Watch form video"
            >
              <Video className="h-3 w-3" />
              Watch form
            </button>
            <button
              onClick={onEdit}
              className="p-0.5 rounded text-stone-300 hover:text-stone-700 hover:bg-stone-100 opacity-60 group-hover/row:opacity-100 transition-opacity"
              title="Edit video link"
              aria-label="Edit video link"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className="text-[10px] font-medium text-stone-500 hover:text-teal-700 inline-flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-teal-50 border border-dashed border-stone-300"
            title="Add a YouTube link for this exercise"
          >
            <Plus className="h-3 w-3" />
            Add video link
          </button>
        )}
      </div>

      {dayOpen && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-stone-200 rounded-lg shadow-lg p-1.5 w-32 scale-in origin-top-right">
          <div className="text-[10px] uppercase tracking-wide text-stone-400 px-2 pb-1">Add to</div>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => {
                onAdd(day);
                setDayOpen(false);
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
