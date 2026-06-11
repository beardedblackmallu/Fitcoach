# FitCoach — Build Plan

Engineering build phases. This is the index of all phase specs.
Each phase spec lives in `docs/specs/in-progress/` while active and
moves to `docs/specs/done/` on completion.

> Phase numbers here are **engineering phases**, not the market /
> GTM phases defined in `docs/FitCoach-PRD.md` (which describe target
> customer segments over time).

---

## Phase 1 — Foundation ✅ Complete (2026-06-04)

**Spec:** [`done/phase-1-foundation.md`](done/phase-1-foundation.md)

Replace prototype mock data with a real backend, add authentication,
wrap with Capacitor so the app runs natively on iOS and Android.

- ✅ CP1: Supabase project + schema deployed (Mumbai region)
- ✅ CP2: Authentication (email + password, OAuth deferred to Phase 2)
- ✅ CP3: All screens read from Supabase (clients, plans, escalations,
  payments, dashboard counts)
- ✅ CP4: Capacitor static-export build, iOS + Android native shells
- ✅ CP5: Mobile polish (splash, status bar, back button, safe areas)

**Known gaps** carried into Phase 2 / Phase 3 are documented in
`done/phase-1-foundation.md` and `docs/design-backlog.md`.

---

## Phase 2 — Onboarding + Billing 🔄 In progress

**Spec:** [`in-progress/phase-2-onboarding-billing.md`](in-progress/phase-2-onboarding-billing.md)
**Prompts:** [`../prompts/phase-2-prompts.md`](../prompts/phase-2-prompts.md) —
copy-paste prompt library for CP1–CP4 (tests + completion protocol baked in)

- ✅ CP0: Color reskin — charcoal + burnt orange (2026-06-05)
- ✅ CP0b: Brighter orange #FF6400 + glow, dark dashboard, animated welcome
  screen, unified native icon/splash (2026-06-11)
- [ ] CP1: Trainer onboarding wizard — resumable 6-step (profile, WhatsApp
  number choice, business details, tier select, payment stub, confirm)
- [ ] CP2: Subscription tiers + Razorpay billing (test mode) + /billing page
  + per-tier client limits
- [ ] CP3: Client management on real Supabase data — closes Phase 1 mock gaps
  (AssignPlan/ClientPicker/NewPlanModal), full intake form, CSV import
- [ ] CP4: Mobile OAuth deep linking (evaluate Capgo social-login plugin first)

---

## Phase 3 — AiSensy WhatsApp integration (not started)

This is the bot. Everything that says "shows empty until Phase 3"
in the Phase 1 docs unblocks here.

- AiSensy webhook → writes inbound messages to `messages` +
  `conversations` tables
- Outbound API → trainer reply → AiSensy → WhatsApp delivery
- Realtime subscription on `messages` for live updates
- Conversations page migrated off mock data
- Bot classification (Claude Haiku) → creates escalations on
  medical / off-topic detection
- Suggested replies (Claude Haiku) → stored in
  `escalation_suggested_replies`
- Inbox feed and dashboard escalation feed go live
- Today's check-ins feed wired to real bot data

---

## Phase 4 — Compliance + analytics (not started)

- `workout_logs` and `food_logs` aggregation
- Dashboard "Avg compliance" card goes live (currently mock)
- Per-client compliance % derived from check-in data
- Weekly progress emails to trainers

---

## Phase 5 — Plan delivery (not started)

- Plan PDF generation
- AiSensy document delivery to client WhatsApp
- "Send plan to client" button goes live (currently a stub)

---

## Phase 6 — Razorpay payments (not started)

- Razorpay subscription setup per trainer
- "Send payment link" button goes live (currently a stub)
- Webhook → updates `payments` table on successful capture
- CSV export of payments

---

## Phase 7+ — TBD

Scope locked when Phase 6 lands. Likely candidates: trainer team
support (Phase 2 market segment), AI plan generation (Claude Sonnet),
push notifications via APNs/FCM, voice note transcription.
