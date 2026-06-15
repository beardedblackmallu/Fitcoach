"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Users,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useApp, type PickerPlan } from "@/lib/AppContext";
import { defaultNutritionPlan } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useClients, type UiClient } from "@/lib/hooks/useClients";
import { Avatar } from "./Avatar";

function formatNextMonday() {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().slice(0, 10);
}

type Step = "select" | "preview" | "sending" | "success";

export function SendPlanModal() {
  const router = useRouter();
  const { clientPicker, closeClientPicker, showToast } = useApp();
  const { clients } = useClients();
  const [step, setStep] = useState<Step>("select");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(formatNextMonday());
  const [welcomeMsg, setWelcomeMsg] = useState("");

  const plan = clientPicker?.plan;

  useEffect(() => {
    if (clientPicker) {
      setStep("select");
      setSelected([]);
      setSearch("");
      setStartDate(formatNextMonday());
      setWelcomeMsg("");
    }
  }, [clientPicker]);

  const list = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search, clients]
  );

  const selectedClients: UiClient[] = useMemo(
    () => selected.map((id) => clients.find((c) => c.id === id)).filter(Boolean) as UiClient[],
    [selected, clients]
  );

  if (!plan) return null;

  const toggle = (id: string) => {
    if (plan.existingClientIds.includes(id)) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const goPreview = () => {
    const defaultMsg =
      selectedClients.length === 1
        ? `Hi ${selectedClients[0].name.split(" ")[0]}, here's your custom plan. Let's get started! Reply with any questions.`
        : "Hi [Client name], here's your custom plan. Let's get started! Reply with any questions.";
    setWelcomeMsg(defaultMsg);
    setStep("preview");
  };

  const sendNow = async () => {
    setStep("sending");
    const supabase = createClient();
    for (const clientId of selected) {
      await supabase.from("plan_assignments").insert({
        plan_id: plan.id,
        client_id: clientId,
        start_date: startDate,
        status: "active",
      });
    }
    window.dispatchEvent(new CustomEvent("clients-changed"));
    setStep("success");
  };

  const dateStr = new Date(startDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const wide = step === "preview";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-6 fade-in">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={step === "sending" ? undefined : closeClientPicker}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-xl w-full ${
          wide ? "max-w-4xl" : "max-w-lg"
        } flex flex-col max-h-[90vh] scale-in transition-[max-width] duration-200`}
      >
        {step !== "sending" && step !== "success" && (
          <button
            onClick={closeClientPicker}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500 z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {step === "select" && (
          <SelectStep
            plan={plan}
            list={list}
            search={search}
            setSearch={setSearch}
            selected={selected}
            toggle={toggle}
            startDate={startDate}
            setStartDate={setStartDate}
            onPreview={goPreview}
            onCancel={closeClientPicker}
          />
        )}

        {step === "preview" && (
          <PreviewStep
            plan={plan}
            selectedClients={selectedClients}
            startDate={dateStr}
            welcomeMsg={welcomeMsg}
            setWelcomeMsg={setWelcomeMsg}
            onBack={() => setStep("select")}
            onSend={sendNow}
          />
        )}

        {step === "sending" && <SendingStep count={selected.length} />}

        {step === "success" && (
          <SuccessStep
            selectedClients={selectedClients}
            onOpenChat={() => {
              closeClientPicker();
              showToast("Opening Conversations", "success");
              router.push("/conversations");
            }}
            onDone={() => {
              closeClientPicker();
            }}
          />
        )}
      </div>
    </div>
  );
}

function SelectStep({
  plan, list, search, setSearch, selected, toggle, startDate, setStartDate, onPreview, onCancel,
}: {
  plan: PickerPlan;
  list: UiClient[];
  search: string;
  setSearch: (v: string) => void;
  selected: string[];
  toggle: (id: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  onPreview: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="px-6 pt-5 pb-3 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900 pr-6">
          Send <span className="text-[#1A1A1A]">{plan.name}</span> to client(s)
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Pick clients to send this plan to via WhatsApp. They'll receive the workout & nutrition
          PDFs plus a welcome message.
        </p>
      </div>

      <div className="px-6 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-[200px]">
        {list.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-stone-500">No matches</div>
        ) : (
          list.map((c) => {
            const alreadyAssigned = plan.existingClientIds.includes(c.id);
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
                    ? "bg-[#F5F4F2]"
                    : "hover:bg-stone-50"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-md border-2 grid place-items-center shrink-0 ${
                    alreadyAssigned || isSelected
                      ? "bg-[#1C1C1C] border-[#1C1C1C] text-white"
                      : "border-stone-300"
                  }`}
                >
                  {(alreadyAssigned || isSelected) && <Check className="h-3 w-3" strokeWidth={3} />}
                </div>
                <Avatar initials={c.initials} color={c.avatarColor} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-stone-900 truncate">{c.name}</div>
                  <div className="text-xs text-stone-500 truncate">
                    {alreadyAssigned ? "Already on this plan" : `Currently: ${c.planName}`}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/60 space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Plan duration: <span className="font-medium text-stone-800">{plan.durationWeeks} weeks</span>
          </span>
          <label className="inline-flex items-center gap-2">
            Start date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2 py-1 rounded border border-stone-300 focus:border-[#1C1C1C] outline-none bg-white"
            />
          </label>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onPreview}
          disabled={selected.length === 0}
          className="px-4 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          <FileText className="h-4 w-4" />
          {selected.length === 0
            ? "Preview before sending"
            : `Preview & send to ${selected.length}`}
        </button>
      </div>
    </>
  );
}

function PreviewStep({
  plan,
  selectedClients,
  startDate,
  welcomeMsg,
  setWelcomeMsg,
  onBack,
  onSend,
}: {
  plan: PickerPlan;
  selectedClients: UiClient[];
  startDate: string;
  welcomeMsg: string;
  setWelcomeMsg: (v: string) => void;
  onBack: () => void;
  onSend: () => void;
}) {
  const sampleMeal = defaultNutritionPlan.meals[2]; // Meal 1 — Breakfast
  return (
    <>
      <div className="px-6 pt-5 pb-3 border-b border-stone-100">
        <button
          onClick={onBack}
          className="text-xs text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to client selection
        </button>
        <h2 className="text-lg font-semibold text-stone-900">Preview before sending</h2>
        <p className="text-xs text-stone-500 mt-1">
          This is what your clients will receive via WhatsApp.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid md:grid-cols-[280px_1fr] gap-4 p-5">
          {/* Summary panel */}
          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Plan</div>
              <div className="text-sm font-medium text-stone-900">{plan.name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                Sending to ({selectedClients.length})
              </div>
              <ul className="space-y-1">
                {selectedClients.map((c) => (
                  <li key={c.id} className="text-sm text-stone-800 inline-flex items-center gap-2">
                    <Avatar initials={c.initials} color={c.avatarColor} size="xs" />
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Duration</div>
                <div className="text-stone-800 font-medium">{plan.durationWeeks} weeks</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Starts</div>
                <div className="text-stone-800 font-medium">{startDate}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
                What client receives
              </div>
              <ul className="space-y-1 text-[12px] text-stone-700">
                <li className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#1A1A1A]" /> Workout plan PDF (week 1 + full)</li>
                <li className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#1A1A1A]" /> Nutrition plan PDF</li>
                <li className="inline-flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-[#1A1A1A]" /> Exercise video links</li>
                <li className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-[#1A1A1A]" /> Welcome message</li>
                <li className="inline-flex items-center gap-1.5"><Wand2 className="h-3.5 w-3.5 text-[#1A1A1A]" /> Onboarding instructions</li>
              </ul>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1.5">
                Welcome message to client
              </label>
              <textarea
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-xs resize-none"
              />
            </div>
          </div>

          {/* PDF mockup */}
          <div className="bg-stone-100 rounded-xl p-3 overflow-hidden">
            <div className="bg-white rounded-lg shadow-lg max-w-[560px] mx-auto p-6 text-[12px]">
              <div className="border-b border-stone-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-[#1C1C1C] grid place-items-center text-white font-bold text-sm">F</div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">FitCoach</div>
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mt-3">{plan.name}</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  For {selectedClients.map((c) => c.name).join(", ") || "Client"} · {plan.durationWeeks} weeks · Starts {startDate}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">Coach: Sandeep Kumar</p>
              </div>

              <div className="mb-5">
                <div className="text-[10px] uppercase tracking-wider text-[#1A1A1A] font-bold mb-2">Daily targets</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Calories", value: `${defaultNutritionPlan.calories}`, unit: "kcal" },
                    { label: "Protein", value: `${defaultNutritionPlan.protein}`, unit: "g" },
                    { label: "Carbs", value: `${defaultNutritionPlan.carbs}`, unit: "g" },
                    { label: "Fats", value: `${defaultNutritionPlan.fats}`, unit: "g" },
                  ].map((m) => (
                    <div key={m.label} className="bg-stone-50 border border-stone-200 rounded-md p-2 text-center">
                      <div className="text-base font-semibold text-stone-900 tabular-nums">{m.value}</div>
                      <div className="text-[9px] text-stone-500">{m.unit}</div>
                      <div className="text-[10px] text-stone-600 font-medium mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <div className="text-[10px] uppercase tracking-wider text-[#1A1A1A] font-bold mb-2">Sample meal — Breakfast</div>
                <div className="border border-stone-200 rounded-md overflow-hidden">
                  <div className="bg-stone-50 px-3 py-1.5 text-[11px] font-medium text-stone-700 border-b border-stone-200">Primary option</div>
                  <ul className="divide-y divide-stone-100">
                    {sampleMeal.variants[0].foods.slice(0, 4).map((f) => (
                      <li key={f.id} className="px-3 py-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-stone-800">{f.name} <span className="text-stone-500">· {f.quantity}</span></span>
                        <span className="text-stone-500 tabular-nums">{f.calories} kcal</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#1A1A1A] font-bold mb-2">Week 1 · Monday</div>
                <div className="space-y-1.5">
                  {[
                    { name: "Squat", detail: "4×8 @ 80kg" },
                    { name: "Bench Press", detail: "4×8 @ 60kg" },
                    { name: "Pull-ups", detail: "3×10" },
                  ].map((ex) => (
                    <div key={ex.name} className="flex items-center justify-between px-3 py-1.5 bg-stone-50 rounded-md border border-stone-200">
                      <div>
                        <div className="text-[11px] font-medium text-stone-800">{ex.name}</div>
                        <div className="text-[10px] text-stone-500">{ex.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-200 text-center text-[9px] text-stone-400">
                Generated by FitCoach · WhatsApp delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-stone-100 flex justify-between gap-2">
        <button
          onClick={onBack}
          className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onSend}
          className="px-4 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium text-sm inline-flex items-center gap-1.5"
        >
          <Send className="h-4 w-4" />
          Send via WhatsApp
        </button>
      </div>
    </>
  );
}

function SendingStep({ count }: { count: number }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="h-14 w-14 mx-auto rounded-full bg-[#F5F4F2] grid place-items-center mb-4">
        <Loader2 className="h-7 w-7 text-[#1A1A1A] animate-spin" />
      </div>
      <p className="font-semibold text-stone-900">Sending to {count} client{count !== 1 ? "s" : ""}…</p>
      <p className="text-sm text-stone-500 mt-1.5">Uploading PDFs and dispatching via WhatsApp.</p>
      <div className="mt-6 max-w-xs mx-auto h-1 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#1C1C1C] rounded-full animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

function SuccessStep({
  selectedClients,
  onOpenChat,
  onDone,
}: {
  selectedClients: UiClient[];
  onOpenChat: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="px-6 pt-8 pb-5 text-center border-b border-stone-100">
        <div className="h-14 w-14 mx-auto rounded-full bg-emerald-50 grid place-items-center mb-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900">
          Plan sent successfully to {selectedClients.length} client{selectedClients.length !== 1 ? "s" : ""}
        </h3>
      </div>

      <div className="px-6 py-4 space-y-3 max-h-[280px] overflow-y-auto">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Delivered</div>
          <ul className="space-y-1.5">
            {selectedClients.map((c) => (
              <li key={c.id} className="flex items-center gap-2.5 text-sm text-stone-700">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-stone-900">{c.name}</span>
                <span className="text-stone-500 text-xs">— Delivered to WhatsApp · Just now</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#F5F4F2]/60 border border-[#E5E3DE] rounded-lg p-3">
          <div className="text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
            What happens next
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            Your clients will receive 3 messages:
          </p>
          <ol className="text-xs text-stone-700 leading-relaxed list-decimal pl-4 mt-1 space-y-0.5">
            <li>Welcome message</li>
            <li>Workout plan PDF</li>
            <li>Nutrition plan PDF</li>
          </ol>
          <p className="text-xs text-stone-700 leading-relaxed mt-2">
            They can then ask questions, log workouts, and share meal photos — all through WhatsApp.
            You'll see their activity in your Conversations inbox.
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
        <button
          onClick={onDone}
          className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
        >
          Done
        </button>
        <button
          onClick={onOpenChat}
          className="px-4 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium text-sm inline-flex items-center gap-1.5"
        >
          <MessageCircle className="h-4 w-4" />
          Open Conversations
        </button>
      </div>
    </div>
  );
}

// Re-export under the old name to avoid changing imports
export { SendPlanModal as ClientPickerModal };
