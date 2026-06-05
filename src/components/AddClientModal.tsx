"use client";

import { Heart, ShieldAlert, Sparkles, User, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { createClient } from "@/lib/supabase/client";

const genders = ["Male", "Female", "Prefer not to say"] as const;
const goals = ["Weight loss", "Muscle gain", "General fitness", "Sport-specific", "Postnatal recovery", "Other"] as const;
const workouts = ["Gym", "Home", "Hybrid"] as const;
const diets = ["Vegetarian", "Non-vegetarian", "Eggetarian", "Vegan"] as const;
const whey = ["Yes", "No", "Not sure"] as const;

export function AddClientModal() {
  const { addClientOpen, closeAddClient, showToast } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<typeof genders[number]>("Female");
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("");
  const [goal, setGoal] = useState<typeof goals[number]>("Weight loss");
  const [workout, setWorkout] = useState<typeof workouts[number]>("Gym");
  const [diet, setDiet] = useState<typeof diets[number]>("Non-vegetarian");
  const [wheyUse, setWheyUse] = useState<typeof whey[number]>("Not sure");
  const [allergies, setAllergies] = useState("");
  const [injuries, setInjuries] = useState("");
  const [medical, setMedical] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!addClientOpen) return null;

  const reset = () => {
    setName(""); setPhone(""); setEmail(""); setAge("");
    setGender("Female"); setHeightCm(""); setWeight(""); setTarget("");
    setGoal("Weight loss"); setWorkout("Gym"); setDiet("Non-vegetarian"); setWheyUse("Not sure");
    setAllergies(""); setInjuries(""); setMedical(""); setNotes("");
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      showToast("Name and phone are required");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Not signed in — please refresh");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("clients").insert({
      trainer_id: user.id,
      name: name.trim(),
      phone: `+91 ${phone.trim()}`,
      email: email.trim() || null,
      gender,
      height_cm: heightCm ? parseFloat(heightCm) : null,
      weight_start_kg: weight ? parseFloat(weight) : null,
      weight_current_kg: weight ? parseFloat(weight) : null,
      weight_target_kg: target ? parseFloat(target) : null,
      goal: goal,
      workout_preference: workout,
      diet_preference: diet,
      whey_use: wheyUse,
      allergies: allergies.trim() || null,
      injuries: injuries.trim() || null,
      medical_conditions: medical.trim() || null,
      intake_notes: notes.trim() || null,
      status: "active",
    });

    setSaving(false);

    if (error) {
      showToast(`Failed to add client: ${error.message}`);
      return;
    }

    showToast(`${name.trim()} added successfully`, "success");
    reset();
    closeAddClient();
  };

  const close = () => {
    reset();
    closeAddClient();
  };

  const labelCls = "text-[11px] font-medium text-stone-700 block mb-1";
  const inputCls = "w-full h-9 px-2.5 rounded-md border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm";
  const selectCls = `${inputCls} bg-white`;
  const textareaCls = "w-full p-2.5 rounded-md border border-stone-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#E5E3DE] outline-none text-sm resize-none";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-6 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[92vh] scale-in">
        <div className="px-6 pt-5 pb-3 border-b border-stone-100">
          <button
            onClick={close}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-stone-900">Add new client</h2>
          <p className="text-xs text-stone-500 mt-1">
            Capture what you'll actually need to design their plan.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Section 1 — Basic */}
          <Section icon={User} title="Basic info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Full name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Rohan Mehta" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <div className="flex items-center">
                  <span className="px-2.5 h-9 inline-flex items-center text-sm bg-stone-100 border border-r-0 border-stone-300 rounded-l-md text-stone-600">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className={`${inputCls} rounded-l-none`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-stone-400 font-normal">(optional)</span></label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Age</label>
                  <input type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as typeof genders[number])} className={selectCls}>
                    {genders.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Section>

          {/* Section 2 — Body & Goals */}
          <Section icon={Sparkles} title="Body & goals">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Height (cm)</label>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="165" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Current weight (kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="78.0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Target weight (kg)</label>
                <input type="number" step="0.1" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="73.0" className={inputCls} />
              </div>
            </div>
            <div className="mt-3">
              <label className={labelCls}>Primary goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value as typeof goals[number])} className={selectCls}>
                {goals.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </Section>

          {/* Section 3 — Preferences */}
          <Section icon={Heart} title="Preferences">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Workout preference</label>
                <select value={workout} onChange={(e) => setWorkout(e.target.value as typeof workouts[number])} className={selectCls}>
                  {workouts.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Diet preference</label>
                <select value={diet} onChange={(e) => setDiet(e.target.value as typeof diets[number])} className={selectCls}>
                  {diets.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Whey protein use</label>
                <select value={wheyUse} onChange={(e) => setWheyUse(e.target.value as typeof whey[number])} className={selectCls}>
                  {whey.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
          </Section>

          {/* Section 4 — Health */}
          <Section icon={ShieldAlert} title="Health">
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Allergies</label>
                <textarea rows={2} value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Peanuts, dairy, gluten — anything to avoid" className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Injuries</label>
                <textarea
                  rows={3}
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  placeholder="List any past injuries with approximate timeframes (e.g., 'ACL strain on left knee 4 years back')"
                  className={textareaCls}
                />
              </div>
              <div>
                <label className={labelCls}>Medical conditions</label>
                <textarea
                  rows={2}
                  value={medical}
                  onChange={(e) => setMedical(e.target.value)}
                  placeholder="Diabetes, BP, thyroid, PCOS, etc."
                  className={textareaCls}
                />
              </div>
              <div>
                <label className={labelCls}>Additional notes</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else that matters for planning…" className={textareaCls} />
              </div>
            </div>
          </Section>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
          <button
            onClick={close}
            className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium text-sm disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <span className="h-3.5 w-3.5 rounded-full border-2 border-white/50 border-t-white animate-spin" />}
            {saving ? "Adding…" : "Add client"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-7 w-7 rounded-md bg-[#F5F4F2] grid place-items-center text-[#1A1A1A]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}
