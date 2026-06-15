# FitCoach — Build Plan

Engineering build phases. This is the index of all phase specs.
Each phase spec lives in `docs/specs/in-progress/` while active and
moves to `docs/specs/done/` on completion.

> Phase numbers here are **engineering phases**, not the market /
> GTM phases defined in `docs/FitCoach-PRD.md` (which describe target
> customer segments over time).

> **Testing convention:** Android-first (emulator/device). iOS gets one pass
> per phase, at the end. The web build is not the shipped product — it's for
> quick logic glances only. All Phase 2 checkpoints have a content-walkthrough
> (Test 0) plus behavior tests, Android-first. See
> [`../prompts/phase-2-prompts.md`](../prompts/phase-2-prompts.md) →
> "Testing convention".

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

## Phase 2 — Onboarding + Billing ✅ Complete (2026-06-15)

**Spec:** [`done/phase-2-onboarding-billing.md`](done/phase-2-onboarding-billing.md)
**Prompts:** [`../prompts/phase-2-prompts.md`](../prompts/phase-2-prompts.md)

- ✅ CP0: Color reskin — charcoal + burnt orange (2026-06-05)
- ✅ CP0b: Brighter orange #FF6400 + glow, dark dashboard, animated welcome
  screen, unified native icon/splash (2026-06-11)
- ✅ CP1: Trainer onboarding wizard — resumable 6-step (2026-06-14)
- ✅ CP2: Subscription tiers + Razorpay billing (test mode) + /billing page
  + per-tier client limits (2026-06-15)
- ✅ CP3: Client management on real Supabase data — edit client, send plan
  with real inserts (2026-06-15)
- ✅ CP4: Mobile OAuth deep linking — Android Google Sign-In working;
  iOS nonce issue deferred (2026-06-15)

---

## Known tech debt (pre-App Store)

- **iOS Google Sign-In broken** — `Nonces mismatch` between GIDSignIn 9.0 and Supabase `signInWithIdToken`. Android works. Fix options: (a) upgrade `@capgo/capacitor-social-login` if nonce is exposed in result in a newer version, (b) switch to `serverAuthCode` flow. Must be resolved before App Store submission. See CP4 notes in `done/phase-2-onboarding-billing.md`.
- **Razorpay webhook** — must be registered in Razorpay Dashboard → Settings → Webhooks with URL `https://gcendipptiwpipadqzan.supabase.co/functions/v1/razorpay-webhook`, secret `c57d288f2dbc64503a76e2e210419613`, event `payment.captured`.
- **Android OAuth client** — create in Google Cloud Console with package `com.fitcoach.trainer` + SHA-1 `61:37:C6:C7:C2:BA:C9:EB:F1:96:CD:B1:97:0D:52:FE:16:F7:2C:98` (needed for production builds signed with release keystore).

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
