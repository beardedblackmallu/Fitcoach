# Phase 2 — Trainer Onboarding + Billing

**Status:** In progress
**Active checkpoint:** CP2 — Subscription tiers + Razorpay

## Checkpoint 0 — Color reskin ✅ Complete

- [x] Tokens updated in globals.css (charcoal + burnt orange)
- [x] All screens visually updated
- [x] Build passes (zero TypeScript errors)
- [x] PRD section 15 updated

**Scope:** Pure token + Tailwind class replacement. No layout, spacing, or logic changes.

---

## Checkpoint 0b — Brighter orange + glow + native polish ✅ Complete

Direction shift from flat/minimal to bold papaya-glow. Supersedes CP0's
burnt orange and the PRD's old "no gradients/animations" aesthetic.

- [x] **Part 1** — Primary `#C05C28 → #FF6400` (hover `#E55A00`), new
  `--primary-glow` token + glow utilities (`.glow-orange*`). Warning family
  re-warmed (`#FFF2E8 / #FFD2B0 / #B34700`). All old-orange hex swapped
  app-wide. Glow applied to: primary CTAs, badges, trainer avatar, active
  bottom-nav icon, escalation status dots. PRD §15.1 + §15.3 rewritten.
- [x] **Part 2** — Dashboard mobile layout: dark gradient header
  (`160deg #1C1C1C → #2A1800`) with greeting + frosted bell + glowing
  avatar + 3 stat tiles; dark escalation card (`#1C1C1C`, orange left
  border, glowing dot, orange-tint client rows, glowing Reply); white
  check-in cards with orange overdue timestamps + glowing Remind. Desktop
  layout preserved.
- [x] **Part 3** — Animated pre-login `/welcome` route (CSS keyframes,
  Framer Motion not installed). Staged entrance logo→wordmark→tagline→CTAs,
  respects `prefers-reduced-motion`. Logged-out users land on `/welcome` —
  enforced by `AuthGuard` in the app (the active gate on mobile) and by
  `proxy.ts` on the web build.
- [x] **Part 4** — Unified native icon + splash from one source
  (`scripts/gen-icons.mjs` → `assets/` → `@capacitor/assets`). Identical
  rectangle-"F" on both platforms (permanent fix for the old mismatch).
  Splash bg `#1C1C1C`, `launchShowDuration` 1500, status bar charcoal.
  PWA `public/icon-512.png` + `icon-192.png` generated.
- [x] Build passes (web + mobile), `cap sync` clean both platforms
- [x] `/welcome` smoke-checked in the web dev build (quick logic glance, no
  console errors). Authoritative pass is the Android app.

**Routing note:** welcome screen is a top-level `/welcome` route (outside the
`(auth)` card layout). Public in both `AuthGuard` (the mobile gate) and
`proxy.ts` (web only).

**Known cosmetic gap:** the sub-second *native* pre-splash glyph still
differs slightly (iOS storyboard uses Futura-Bold; Android 12 uses the
rectangle-F foreground). App icon + Capacitor plugin splash are pixel-
identical. Final logo to come from the designer.

---

## Checkpoints 1-4

Full copy-paste prompts (task, requirements, behavior tests, completion
protocol) live in [`../../prompts/phase-2-prompts.md`](../../prompts/phase-2-prompts.md).
Each checkpoint's **content walkthrough (Test 0)** is mirrored below so spec and
prompt library stay in sync. All tests run on the Android app (see the
Android-first testing convention in the prompt library).

### CP1 — Trainer onboarding wizard ✅ Complete (2026-06-14)

Resumable 6-step wizard at top-level `/onboarding`. Cursor in
`trainers.onboarding_step`; completion stamps `user_metadata.onboarding_complete`
so `AuthGuard` (mobile) + `proxy.ts` (web) gate the app cheaply. Migration
`002_trainer_onboarding.sql` adds the onboarding/profile/business/subscription
columns + the public `avatars` Storage bucket (owner-scoped RLS). Photo upload
uses `@capacitor/camera` (native picker), not a web file input. All 7 behavior
tests + the Test 0 walkthrough passed on Android.

**Test 0 — Wizard walkthrough.** Through all 6 steps confirm:
1. Profile — name (required, blocks Next if empty), photo upload, bio, specialty
   chips toggle
2. WhatsApp — Option A preselected + "recommended"; Option B reveals the
   existing-number field + calling-loss warning
3. Business — business name (required), GST (optional), address
4. Tier — Starter ₹999/10, Growth ₹1999/30 (Popular, preselected), Pro ₹2999/50,
   Scale ₹4999/100
5. Payment — selected plan + price + "Continue to payment"; marks pending
6. Confirmation — success + "Add your first client"
Plus: progress + "Step X of 6" accurate; Back on steps 2–6 (not 1).

### CP2 — Subscription tiers + Razorpay

**Billing approach decision (2026-06-14): building on Razorpay ORDERS, not
Subscriptions.** Razorpay's Subscriptions/Recurring product is not activated on
the account (`/v1/plans` → 401; dashboard "Create Plan" fails), even with KYC
complete — enabling it needs Razorpay Support, no self-serve toggle. Orders/
Payments work fully in test mode (same UPI/cards/INR). So CP2 ships as a
one-time Order per cycle (manual renewal); migration `003_billing_orders.sql`
adds `razorpay_order_id`/`razorpay_payment_id`/`current_period_end` +
`payment_provider` (forward-looking for Stripe/international). Native
auto-recurring Subscriptions is the **deferred upgrade** — build it per the
prompt library once Razorpay enables Recurring; the swap is isolated to the
`create-order` → `create-subscription` Edge Function call. Migration 003
applied to Supabase ✓.

**Test 0 — Billing screens walkthrough.** Confirm: Razorpay checkout shows the
correct plan + ₹ amount; test mode clearly indicated; success screen shows active
plan + renewal date; `/billing` shows current plan, price, renewal date, upgrade
options; tier-limit prompt names current + next tier.

### CP3 — Client management goes real

**Test 0 — Client screens walkthrough.** Confirm: add-client form shows all
intake fields grouped Basic / Body / Preferences / Health; required validation
(name, phone) fires; phone enforces +91; client list shows avatar, name, phone,
plan, compliance, status; detail shows health profile + amber "Review before
planning" when injuries/medical present; AssignPlan lists real plans;
ClientPicker lists real clients; CSV import shows a preview table before confirm.

### CP4 — OAuth deep linking (mobile)

**Test 0 — OAuth screens walkthrough.** Confirm: "Continue with Google" renders
on both login and signup; tapping opens the native Google account picker (not an
in-app web view); after selection the app returns to the dashboard.
