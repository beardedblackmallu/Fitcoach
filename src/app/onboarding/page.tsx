"use client";

// Trainer onboarding wizard (Phase 2 CP1).
// Resumable 6-step flow gated in front of the (app) routes. Writes to the
// trainers table; the cursor lives in trainers.onboarding_step so a trainer
// who drops off resumes on the same step. On completion we set
// onboarding_step = 'complete' AND stamp user_metadata.onboarding_complete
// so proxy.ts/AuthGuard can unlock the app cheaply from the JWT.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  Upload,
  AlertTriangle,
  PartyPopper,
} from "lucide-react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { createClient } from "@/lib/supabase/client";
import { TIERS, tierByKey, startCheckout } from "@/lib/billing";

// Step keys in order — index maps to "Step N of 6".
const STEPS = ["profile", "whatsapp", "business", "tier", "payment", "confirm"] as const;
type StepKey = (typeof STEPS)[number];

const SPECIALTIES = [
  "Weight loss", "Muscle gain", "Strength", "Powerlifting", "Bodybuilding",
  "General fitness", "Sports performance", "Pre/post-natal", "Rehab", "Nutrition",
];

interface Form {
  name: string;
  avatar_url: string | null;
  bio: string;
  specialties: string[];
  whatsapp_choice: "new" | "migrate" | null;
  whatsapp_existing_number: string;
  business_name: string;
  gst_number: string;
  business_address: string;
  subscription_tier: string | null;
}

const EMPTY: Form = {
  name: "", avatar_url: null, bio: "", specialties: [],
  whatsapp_choice: null, whatsapp_existing_number: "",
  business_name: "", gst_number: "", business_address: "",
  subscription_tier: "growth",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState<StepKey>("profile");
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const stepIndex = STEPS.indexOf(step);

  // ── Load trainer row → prefill + resume on the saved step ──────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/welcome"); return; }
      setUid(user.id);

      const { data } = await supabase
        .from("trainers")
        .select("name, avatar_url, bio, specialties, whatsapp_choice, whatsapp_existing_number, business_name, gst_number, business_address, subscription_tier, onboarding_step")
        .eq("id", user.id)
        .single();

      if (data) {
        setForm({
          name: data.name || (user.user_metadata?.name as string) || "",
          avatar_url: data.avatar_url ?? null,
          bio: data.bio ?? "",
          specialties: data.specialties ?? [],
          whatsapp_choice: data.whatsapp_choice ?? null,
          whatsapp_existing_number: data.whatsapp_existing_number ?? "",
          business_name: data.business_name ?? "",
          gst_number: data.gst_number ?? "",
          business_address: data.business_address ?? "",
          subscription_tier: data.subscription_tier ?? "growth",
        });
        const saved = data.onboarding_step as StepKey | "complete";
        if (saved === "complete") { router.replace("/"); return; }
        if (STEPS.includes(saved as StepKey)) setStep(saved as StepKey);
      }
      setLoading(false);
    })();
  }, [supabase, router]);

  const patch = useCallback(
    async (fields: Record<string, unknown>) => {
      if (!uid) return;
      const { error } = await supabase.from("trainers").update(fields).eq("id", uid);
      if (error) throw error;
    },
    [supabase, uid]
  );

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleSpecialty = (s: string) =>
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));

  // ── Photo upload via the native picker → avatars/<uid>/avatar.<ext> ─
  // Uses @capacitor/camera (CLAUDE.md: Capacitor plugins for camera, not
  // browser APIs). Works on web too via the plugin's web fallback.
  const onPickPhoto = async () => {
    if (!uid) return;
    setError(null);
    let photo;
    try {
      photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 80,
      });
    } catch (e) {
      // User dismissing the picker throws — treat as a no-op, not an error.
      const msg = String((e as { message?: string })?.message ?? e);
      if (!/cancel/i.test(msg)) {
        setError(`Could not open the photo picker: ${msg}`);
        console.error(e);
      }
      return;
    }

    setUploading(true);
    try {
      if (!photo.webPath) throw new Error("No image returned from picker");
      const blob = await (await fetch(photo.webPath)).blob();
      const ext = (photo.format || "jpg").toLowerCase();
      const path = `${uid}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, {
          upsert: true,
          cacheControl: "0",
          contentType: blob.type || `image/${ext}`,
        });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      set("avatar_url", url);
      await patch({ avatar_url: url });
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e);
      setError(`Photo upload failed: ${msg}`);
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  // ── Advance: persist this step's fields + move cursor forward ───────
  const advance = async (fields: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      const next = STEPS[stepIndex + 1];
      await patch({ ...fields, onboarding_step: next });
      setStep(next);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError("Could not save. Check your connection and try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      await patch({ onboarding_step: "complete" });
      await supabase.auth.updateUser({ data: { onboarding_complete: true } });
      router.replace("/clients");
    } catch (e) {
      setError("Could not finish onboarding. Try again.");
      console.error(e);
      setSaving(false);
    }
  };

  // Step 5 — open Razorpay checkout, then advance to confirm. The webhook
  // activates the subscription server-side; we only need payment to complete.
  const payAndContinue = async () => {
    if (!form.subscription_tier) return;
    setSaving(true);
    setError(null);
    try {
      await startCheckout(form.subscription_tier, { name: form.name });
      const next = STEPS[stepIndex + 1]; // → confirm
      await patch({ subscription_status: "pending", onboarding_step: next });
      setStep(next);
      window.scrollTo({ top: 0 });
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e);
      if (!/cancel|dismiss/i.test(msg)) setError(`Payment didn't complete: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F5F4F2]">
        <Loader2 className="h-7 w-7 animate-spin text-[#1C1C1C]" />
      </div>
    );
  }

  const firstName = form.name.split(" ")[0] || "Coach";

  return (
    <div className="min-h-screen bg-[#F5F4F2] pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        {/* Progress header */}
        <div className="pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#888]">
              Step {stepIndex + 1} of 6
            </span>
            <span className="text-[11px] text-stone-400">FitCoach setup</span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-[#FF6400] glow-orange-sm transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E5E3DE] p-5 sm:p-6">
          {/* Back button (every step except 1) */}
          {stepIndex > 0 && (
            <button
              onClick={back}
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          {/* ── Step 1: Profile ─────────────────────────────── */}
          {step === "profile" && (
            <div>
              <h1 className="text-xl font-bold text-stone-900">Your coaching profile</h1>
              <p className="text-sm text-stone-500 mt-1">This is what clients and your dashboard show.</p>

              <div className="mt-5 flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-[#FF6400] grid place-items-center text-white text-2xl font-bold shrink-0 glow-orange-sm">
                  {form.avatar_url
                    ? <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
                    : (form.name.slice(0, 1).toUpperCase() || "F")}
                </div>
                <div>
                  <button
                    onClick={onPickPhoto}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {form.avatar_url ? "Change photo" : "Upload photo"}
                  </button>
                  <p className="text-[11px] text-stone-400 mt-1.5">JPG or PNG, square works best.</p>
                </div>
              </div>

              <label className="block mt-5 text-sm font-medium text-stone-700">Name</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Sandeep Rao"
                className="mt-1 w-full h-11 px-3 rounded-lg border border-stone-300 focus:border-[#FF6400] focus:ring-2 focus:ring-[rgba(255,100,0,0.2)] outline-none text-sm"
              />

              <label className="block mt-4 text-sm font-medium text-stone-700">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="A line or two about your coaching."
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 focus:border-[#FF6400] focus:ring-2 focus:ring-[rgba(255,100,0,0.2)] outline-none text-sm resize-none"
              />

              <label className="block mt-4 text-sm font-medium text-stone-700">Specialties</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => {
                  const on = form.specialties.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSpecialty(s)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        on
                          ? "bg-[#FF6400] border-[#FF6400] text-white"
                          : "bg-white border-stone-300 text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <PrimaryButton
                disabled={!form.name.trim() || saving}
                loading={saving}
                onClick={() => advance({
                  name: form.name.trim(),
                  bio: form.bio,
                  specialties: form.specialties,
                })}
              >
                Continue
              </PrimaryButton>
            </div>
          )}

          {/* ── Step 2: WhatsApp number ─────────────────────── */}
          {step === "whatsapp" && (
            <div>
              <h1 className="text-xl font-bold text-stone-900">Your WhatsApp number</h1>
              <p className="text-sm text-stone-500 mt-1">How clients will message your coaching bot.</p>

              <div className="mt-5 space-y-3">
                <ChoiceCard
                  selected={form.whatsapp_choice === "new"}
                  onClick={() => set("whatsapp_choice", "new")}
                  title="Get a new FitCoach number"
                  badge="Recommended"
                  lines={[
                    "A fresh WhatsApp number, ready in ~24 hours",
                    "Your personal number stays untouched",
                    "Reversible if you ever leave",
                  ]}
                />
                <ChoiceCard
                  selected={form.whatsapp_choice === "migrate"}
                  onClick={() => set("whatsapp_choice", "migrate")}
                  title="Migrate my existing business number"
                  lines={[
                    "Ports your current business number (2–7 days)",
                    "Clients see the same number",
                  ]}
                />
              </div>

              {form.whatsapp_choice === "migrate" && (
                <>
                  <div className="mt-4 rounded-lg bg-[#FFF2E8] border border-[#FFD2B0] p-3 flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#B34700] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#B34700] leading-relaxed">
                      <span className="font-semibold">You permanently lose the WhatsApp app on this number.</span>{" "}
                      All messaging moves to the FitCoach dashboard, and you can no longer
                      make calls from this number. Most coaches should pick a new number instead.
                    </div>
                  </div>
                  <label className="block mt-4 text-sm font-medium text-stone-700">Existing number</label>
                  <input
                    value={form.whatsapp_existing_number}
                    onChange={(e) => set("whatsapp_existing_number", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 w-full h-11 px-3 rounded-lg border border-stone-300 focus:border-[#FF6400] focus:ring-2 focus:ring-[rgba(255,100,0,0.2)] outline-none text-sm"
                  />
                </>
              )}

              <PrimaryButton
                disabled={
                  !form.whatsapp_choice ||
                  (form.whatsapp_choice === "migrate" && !form.whatsapp_existing_number.trim()) ||
                  saving
                }
                loading={saving}
                onClick={() => advance({
                  whatsapp_choice: form.whatsapp_choice,
                  whatsapp_existing_number:
                    form.whatsapp_choice === "migrate" ? form.whatsapp_existing_number.trim() : null,
                })}
              >
                Continue
              </PrimaryButton>
            </div>
          )}

          {/* ── Step 3: Business details ────────────────────── */}
          {step === "business" && (
            <div>
              <h1 className="text-xl font-bold text-stone-900">Business details</h1>
              <p className="text-sm text-stone-500 mt-1">Used later for payment setup (Razorpay KYC).</p>

              <label className="block mt-5 text-sm font-medium text-stone-700">Business name</label>
              <input
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                placeholder="e.g. Sandeep Fitness"
                className="mt-1 w-full h-11 px-3 rounded-lg border border-stone-300 focus:border-[#FF6400] focus:ring-2 focus:ring-[rgba(255,100,0,0.2)] outline-none text-sm"
              />

              <label className="block mt-4 text-sm font-medium text-stone-700">
                GST number <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                value={form.gst_number}
                onChange={(e) => set("gst_number", e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className="mt-1 w-full h-11 px-3 rounded-lg border border-stone-300 focus:border-[#FF6400] focus:ring-2 focus:ring-[rgba(255,100,0,0.2)] outline-none text-sm"
              />

              <label className="block mt-4 text-sm font-medium text-stone-700">Address</label>
              <textarea
                value={form.business_address}
                onChange={(e) => set("business_address", e.target.value)}
                placeholder="Business address"
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 focus:border-[#FF6400] focus:ring-2 focus:ring-[rgba(255,100,0,0.2)] outline-none text-sm resize-none"
              />

              <PrimaryButton
                disabled={!form.business_name.trim() || saving}
                loading={saving}
                onClick={() => advance({
                  business_name: form.business_name.trim(),
                  gst_number: form.gst_number.trim() || null,
                  business_address: form.business_address.trim() || null,
                })}
              >
                Continue
              </PrimaryButton>
            </div>
          )}

          {/* ── Step 4: Tier ────────────────────────────────── */}
          {step === "tier" && (
            <div>
              <h1 className="text-xl font-bold text-stone-900">Choose your plan</h1>
              <p className="text-sm text-stone-500 mt-1">You can change this anytime.</p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIERS.map((t) => {
                  const on = form.subscription_tier === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => set("subscription_tier", t.key)}
                      className={`relative text-left rounded-xl border p-4 transition-all ${
                        on
                          ? "border-[#FF6400] ring-2 ring-[rgba(255,100,0,0.25)] bg-[#FFF8F3]"
                          : "border-stone-300 hover:border-stone-400"
                      }`}
                    >
                      {t.popular && (
                        <span className="absolute -top-2 right-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#FF6400] text-white glow-orange-sm">
                          Popular
                        </span>
                      )}
                      <div className="font-semibold text-stone-900">{t.name}</div>
                      <div className="mt-1 text-2xl font-bold text-stone-900">
                        ₹{t.price.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-stone-400">/mo</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">Up to {t.clients} clients</div>
                      {on && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#FF6400] grid place-items-center">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <PrimaryButton
                disabled={!form.subscription_tier || saving}
                loading={saving}
                onClick={() => advance({ subscription_tier: form.subscription_tier })}
              >
                Continue
              </PrimaryButton>
            </div>
          )}

          {/* ── Step 5: Payment (placeholder) ───────────────── */}
          {step === "payment" && (
            <div>
              <h1 className="text-xl font-bold text-stone-900">Payment</h1>
              <p className="text-sm text-stone-500 mt-1">
                Secure checkout is coming next. For now we'll mark your subscription as pending.
              </p>

              <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">
                    {tierByKey(form.subscription_tier)?.name} plan
                  </span>
                  <span className="font-semibold text-stone-900">
                    ₹{tierByKey(form.subscription_tier)?.price.toLocaleString("en-IN")}/mo
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-stone-400">
                  Razorpay billing lands in CP2 — no charge yet.
                </div>
              </div>

              <PrimaryButton loading={saving} disabled={saving} onClick={payAndContinue}>
                Continue to payment
              </PrimaryButton>
            </div>
          )}

          {/* ── Step 6: Confirmation ────────────────────────── */}
          {step === "confirm" && (
            <div className="text-center py-2">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-[#FF6400] grid place-items-center glow-orange">
                <PartyPopper className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-stone-900 mt-4">You're all set, {firstName}!</h1>
              <p className="text-sm text-stone-500 mt-1.5">
                Your profile is ready. Add your first client to get started.
              </p>
              <PrimaryButton loading={saving} disabled={saving} onClick={finish}>
                Add your first client
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrimaryButton({
  children, onClick, disabled, loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glow-orange mt-6 w-full h-12 rounded-xl bg-[#FF6400] hover:bg-[#E55A00] text-white font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-colors"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function ChoiceCard({
  selected, onClick, title, badge, lines,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  badge?: string;
  lines: string[];
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? "border-[#FF6400] ring-2 ring-[rgba(255,100,0,0.25)] bg-[#FFF8F3]"
          : "border-stone-300 hover:border-stone-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-stone-900">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#FF6400] text-white">
            {badge}
          </span>
        )}
        {selected && (
          <span className="ml-auto h-5 w-5 rounded-full bg-[#FF6400] grid place-items-center shrink-0">
            <Check className="h-3.5 w-3.5 text-white" />
          </span>
        )}
      </div>
      <ul className="mt-2 space-y-1">
        {lines.map((l) => (
          <li key={l} className="text-xs text-stone-500 flex gap-1.5">
            <span className="text-[#FF6400] mt-0.5">•</span>
            {l}
          </li>
        ))}
      </ul>
    </button>
  );
}
