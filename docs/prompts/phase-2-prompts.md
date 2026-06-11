# Phase 2 — Prompts (Onboarding + Billing)

## Testing convention (read before any checkpoint)

- **Primary test environment: Android emulator or real Android device.** Our
  market is Android-heavy (India ~75–80%). All checkpoint tests are written for
  Android.
- **iOS simulator pass happens once per phase**, at the end — not per
  checkpoint. Most bugs are logic bugs identical on both; platform-specific
  bugs are caught in the phase-end iOS pass.
- **How to launch for testing:**
  `npm run build:mobile && npx cap sync && npx cap open android`
  then Run in Android Studio (emulator or connected device).
- **Native-feature tests** (camera/photo picker, push, deep links, splash, app
  icon) MUST be verified on the emulator/device — they don't exist in a
  browser.
- The web build (`npm run dev`) may be used for quick logic glances during
  development, but a checkpoint is NOT "done" until its tests pass on Android.

---

Each prompt is ready to paste into Claude Code. Run the tests at the bottom of
each on Android. Confirm pass → Claude Code marks complete, commits, updates
`BUILD-PLAN.md`.

---

## CP0a — Color reskin to charcoal + orange  [COMPLETE]

Reskinned from teal-primary to charcoal `#1C1C1C` + burnt orange `#C05C28`.
Updated `globals.css` tokens + PRD section 15. Superseded by CP0b (brighter
orange).

---

## CP0b — Brighter orange + splash + icon + dashboard layout  [COMPLETE]

**CONTEXT TO READ FIRST:**
1. CLAUDE.md
2. docs/specs/in-progress/phase-2-onboarding-billing.md
3. docs/FitCoach-PRD.md section 15

**TASK:**
Four parts, in order, build-check each.

**PART 1 — Brighter orange tokens (globals.css):**
- Primary: `#C05C28 → #FF6400` (McLaren papaya)
- Primary hover: `#A84E22 → #E55A00`
- Primary subtle bg: → `rgba(255,100,0,0.12)`
- Primary subtle border: → `rgba(255,100,0,0.25)`
- NEW Primary glow: `rgba(255,100,0,0.4)`
- Apply glow (box-shadow / drop-shadow) to: orange buttons, notification
  badges, header avatar, active bottom-nav icon, escalation status dot.
- Update PRD section 15 with `#FF6400` values (avoid stale doc).

**PART 2 — Dashboard mobile layout:**
- HEADER: `gradient(160deg, #1C1C1C 55%, #2A1800 100%)`; "GOOD AFTERNOON"
  `#555` uppercase + name white 20px bold; bell in frosted circle with orange
  glow badge; avatar `#FF6400` glow; 3 stat tiles in `rgba(255,255,255,0.07)`.
- ESCALATION CARD: `#1C1C1C`, left border 3px `#FF6400`, status dot glow
  `box-shadow 0 0 8px rgba(255,100,0,0.9)`, Reply buttons `#FF6400` glow.
- CHECK-IN CARDS: white, overdue timestamp `#FF6400`, Remind button `#FF6400`
  glow.
- PAGE BG `#F5F4F2`. Section labels 10px uppercase `#888`.
- BOTTOM NAV: active `#FF6400` + glow, badge 1.5px white border.

**PART 3 — Animated welcome screen (pre-login), bg `#1C1C1C`:**
- Check Framer Motion; if absent use CSS keyframes (don't add dep without
  flagging).
- Stage 1 (0–400ms): logo 84x84 rounded square `#FF6400`, white "F" 38px,
  triple glow rings (`0 0 0 10px rgba(255,100,0,0.12)`,
  `0 0 0 22px rgba(255,100,0,0.06)`, `0 8px 32px rgba(255,100,0,0.4)`),
  fade + scale 0.8→1.
- Stage 2 (400–700ms): "FitCoach" white 26px weight 800, fade + translateY
  8→0.
- Stage 3 (700–900ms): tagline "WhatsApp-native coaching for independent
  trainers" `#666` 12px, fade.
- Stage 4 (900–1200ms): CTAs fade + translateY 12→0 — "Get started" `#FF6400`
  glow → /signup; "Sign in" frosted → /login; "Trusted by 500+ coaches across
  India" `#444` 11px.
- Respect `prefers-reduced-motion` (instant, no animation).

**PART 4 — Unified native icon (iOS + Android):**
- Placeholder until designer delivers: `#FF6400` bg, white bold condensed "F",
  rounded square. Use Context7 to verify Capacitor icon approach; check
  `@capacitor/assets` CLI. Generate `public/icon-512.png` + `icon-192.png`,
  iOS `AppIcon.appiconset` (all sizes), Android mipmaps (all densities).
  Native splash bg `#1C1C1C`, duration 1500ms.

**TESTS TO RUN (Android emulator/device):**

**Test 0 — Screen walkthrough.** On the Android app, confirm each surface renders:
- Welcome screen: papaya logo tile with white "F" + triple glow rings, "FitCoach"
  wordmark, tagline, glowing "Get started" + frosted "Sign in" buttons, "Trusted
  by 500+ coaches across India".
- Dashboard header: dark gradient, "GOOD AFTERNOON" + first name, bell in frosted
  circle with orange glow badge, glowing papaya avatar, 3 stat tiles
  (Clients / Revenue / Compliance).
- Escalation card: dark `#1C1C1C`, orange left border, glowing status dot,
  "ACTION NEEDED" + count badge, client rows with glowing Reply buttons.
- Check-in cards: white, orange overdue timestamps, glowing "Remind" buttons.
- Bottom nav: active tab papaya + glow, badge with white border.

Then the behavior tests:
1. `npm run build` → zero errors (type/compile gate before building the app)
2. `npm run build:mobile && npx cap sync && npx cap open android` → Run in
   Android Studio
3. Home screen: the unified papaya "F" icon shows on the Android launcher
4. Cold launch (force-close, relaunch): charcoal + orange splash ~1.5s
5. On app open: the welcome screen's staged animation plays in order
6. Dashboard: dark header, dark escalation card, orange glows visible
7. Turn on Android "Remove animations" (Settings → Accessibility): welcome
   animation is skipped, content shows instantly

**COMPLETION PROTOCOL:**
Once user confirms all tests pass:
- Mark CP0 complete in phase-2-onboarding-billing.md
- Update docs/specs/BUILD-PLAN.md — Phase 2 CP0a + CP0b complete + date
- Commit "Phase 2 CP0b — brighter orange #FF6400, splash animation, unified
  icon, dashboard layout"

**VERIFY BEFORE EXECUTING:**
1. Confirm CLAUDE.md read
2. Use Context7 for Capacitor icon/splash + Framer Motion check
3. Confirm `#FF6400` everywhere, glow on orange, one icon both platforms
4. PART 1→2→3→4 in order, build-check each
5. Flag orange overuse before committing

---

## CP1 — Trainer onboarding wizard

**CONTEXT TO READ FIRST:**
1. CLAUDE.md
2. docs/specs/in-progress/phase-2-onboarding-billing.md — CP1
3. docs/FitCoach-PRD.md sections 5.10, 8.1
4. docs/FitCoach-WhatsApp-Infrastructure.md section 4

**TASK:**
Build a resumable 6-step onboarding wizard replacing the `/onboarding` stub.

- **Step 1 — Profile:** name, photo upload (Supabase Storage), bio,
  specialties (multi-select chips)
- **Step 2 — WhatsApp number choice:** Option A (new number, recommended) or
  Option B (migrate existing). UI ONLY — no AiSensy calls. Store the choice.
  Show the calling tradeoff for Option B per WhatsApp-Infrastructure.md
  section 4.
- **Step 3 — Business details for later Razorpay KYC:** business name, GST
  (optional), address
- **Step 4 — Subscription tier selection:** Starter ₹999/10 clients, Growth
  ₹1999/30, Pro ₹2999/50, Scale ₹4999/100. Cards, Growth pre-selected as
  popular.
- **Step 5 — Payment:** placeholder "Continue to payment" button (real
  Razorpay is CP2). For now mark subscription pending.
- **Step 6 — Confirmation** + "Add your first client" CTA → /clients

**Requirements:**
- `onboarding_step` column in `trainers` table tracks progress
- Resumable: drop off at step 3, resume at step 3 on next login
- Cannot access `(app)` screens until onboarding complete. On mobile the
  active gate is **AuthGuard** (client-side); `proxy.ts` only runs on the web
  build. Both check the onboarding flag.
- Progress indicator (Step X of 6) at top
- Back button on every step except 1
- All data saves to `trainers` table

**TESTS TO RUN (Android emulator/device):**

**Test 0 — Wizard walkthrough.** Going forward through all 6 steps, confirm each
renders correctly:
1. Profile — name (required, blocks Next if empty), photo upload, bio, specialty
   chips toggle on/off
2. WhatsApp — Option A preselected and marked "recommended"; selecting Option B
   reveals the existing-number field and shows the calling-loss warning
3. Business — business name (required), GST (optional, can skip), address
4. Tier — 4 cards: Starter ₹999/10 clients, Growth ₹1999/30, Pro ₹2999/50,
   Scale ₹4999/100; Growth marked "Popular" and preselected
5. Payment — shows the selected plan + price + "Continue to payment"; marks
   subscription pending
6. Confirmation — success message + "Add your first client" CTA
Plus: progress indicator advances correctly, "Step X of 6" is accurate at each
step, Back works on steps 2–6 (not step 1).

Then the behavior tests:
1. Fresh signup in the app → after email verification, the app opens the
   onboarding wizard at Step 1 of 6
2. Complete steps 1–2, force-close the app, reopen → resumes at Step 3
3. Complete all 6 steps → the app opens the Clients screen (onboarding
   unlocked)
4. Supabase dashboard: trainers row has all profile data +
   `onboarding_step = complete`
5. While onboarding is incomplete, open the Clients tab → the app sends you
   back to the onboarding wizard
6. Step 2 → select "Migrate existing number" → the calling-loss warning appears
7. Step 1 → upload a photo via the native Android photo picker → appears in
   Supabase Storage (avatars bucket) + shows as the header avatar in the app

**COMPLETION PROTOCOL:**
Once user confirms all tests pass:
- Mark CP1 items [x] in phase-2-onboarding-billing.md
- Update docs/specs/BUILD-PLAN.md — Phase 2 CP1 complete + date
- Commit "Phase 2 CP1 complete — trainer onboarding wizard"

**VERIFY BEFORE EXECUTING:**
1. Confirm CLAUDE.md read
2. Confirm `onboarding_step` column needs adding to schema (add via migration
   if missing)
3. Summarize understanding, flag contradictions before coding

---

## CP2 — Subscription tiers + Razorpay

**CONTEXT TO READ FIRST:**
1. CLAUDE.md
2. docs/specs/in-progress/phase-2-onboarding-billing.md — CP2
3. docs/FitCoach-PRD.md section 12 (pricing)

**TASK:**
Wire real Razorpay subscription billing (TEST MODE ONLY).

- Configure Razorpay test account; add keys to `.env.local`
  (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- Create 4 subscription plans in Razorpay matching the tiers
- Step 5 of onboarding opens Razorpay checkout
- On success: `subscription_status` + `razorpay_subscription_id` saved to
  `trainers` table
- On failure: clear error + retry
- Razorpay webhook updates subscription status in DB
- Dashboard checks subscription on load; expired → /billing
- Basic /billing page: current plan, renewal date, upgrade options
- Client-count limit enforced per tier

Use Context7 to verify current Razorpay Node/Next.js integration before
writing any payment code. **Never store card details.**

**TESTS TO RUN (Android emulator/device):**

**Test 0 — Billing screens walkthrough.** On the Android app, confirm:
- Razorpay checkout opens with the correct selected plan name + ₹ amount
- Test mode is clearly indicated (not live)
- On success: confirmation screen shows the active plan + renewal date
- `/billing` screen shows current plan, price, renewal date, and upgrade options
  for higher tiers
- Tier-limit block: when at the client cap, the upgrade prompt names the current
  tier and the next tier up

Then the behavior tests:
1. In the app, pick Starter → Razorpay checkout opens correctly inside the app
   (in-app WebView / native checkout — not an external browser)
2. Test card 4111 1111 1111 1111 → payment succeeds; Supabase dashboard shows
   the trainers row status active
3. Razorpay failure test card → the app shows a clear error, retry works
4. As a Starter trainer, add an 11th client → the app blocks it with an upgrade
   prompt
5. Simulate an expired subscription → the app shows the Billing screen
   (`/billing`)
6. Webhook received → Supabase dashboard shows the subscription status update

**COMPLETION PROTOCOL:**
Once user confirms all tests pass:
- Mark CP2 items [x] in phase-2-onboarding-billing.md
- Update docs/specs/BUILD-PLAN.md — Phase 2 CP2 complete + date
- Commit "Phase 2 CP2 complete — Razorpay subscription billing"

**VERIFY BEFORE EXECUTING:**
1. Confirm CLAUDE.md read
2. Confirm Razorpay TEST mode keys present
3. Use Context7 for Razorpay patterns — don't generate from memory
4. Flag schema columns needed (`subscription_status`,
   `razorpay_subscription_id`) before coding

---

## CP3 — Client management goes real

**CONTEXT TO READ FIRST:**
1. CLAUDE.md
2. docs/specs/in-progress/phase-2-onboarding-billing.md — CP3
3. docs/FitCoach-PRD.md sections 8.2, 10.5

**TASK:**
Move all client management from mock to real Supabase. Close the known gaps
carried from Phase 1.

- Add-client modal → INSERT to `clients` table, full intake form (name,
  phone +91 validated, email, age, gender, height, weight, target, goal,
  workout pref, diet pref, whey use, allergies, injuries with timeframes,
  medical conditions, notes)
- Client list + detail → read from Supabase
- Health profile section: amber warning if injuries/medical present
- AssignPlan modal → real plans (was mock — Phase 1 gap)
- ClientPicker modal → real clients (was mock — Phase 1 gap)
- `customClient` lookup in NewPlanModal → real DB (was mock)
- CSV bulk import: parse → preview → confirm → insert, graceful per-row error
  handling

Injuries field is critical safety data — **never truncate.** All queries
filter by `trainer_id`.

**TESTS TO RUN (Android emulator/device):**

**Test 0 — Client screens walkthrough.** On the Android app, confirm:
- Add-client form shows ALL intake fields grouped: Basic (name, phone +91, email,
  age, gender), Body (height, weight, target), Preferences (goal, workout, diet,
  whey), Health (allergies, injuries with timeframe placeholder, medical
  conditions, notes)
- Required-field validation fires (name, phone)
- Phone enforces +91 format
- Client list shows: avatar, name, phone, plan, compliance, status
- Client detail shows the health profile section; amber "Review before planning"
  warning appears when injuries/medical present
- AssignPlan modal lists real plans with correct names/durations
- ClientPicker modal lists real clients
- CSV import shows a preview table before confirm

Then the behavior tests:
1. Add a client via the modal → all fields save → client appears in the list
2. Edit a client, force-close the app and reopen → changes persisted
3. Client with injuries → amber safety warning on the client detail screen
4. CSV import (pick the file via the native Android file picker) of 3 clients
   → all 3 appear
5. Malformed CSV row → the app shows a clear error; valid rows still import
6. AssignPlan modal shows real plans from Supabase
7. ClientPicker modal shows real clients from Supabase
8. Add a client beyond the tier limit → the app blocks it

**COMPLETION PROTOCOL:**
Once user confirms all tests pass:
- Mark CP3 items [x] in phase-2-onboarding-billing.md
- Update docs/specs/BUILD-PLAN.md — Phase 2 CP3 complete + date
- Commit "Phase 2 CP3 complete — client management on real data"

**VERIFY BEFORE EXECUTING:**
1. Confirm CLAUDE.md read
2. Confirm RLS still enforces trainer isolation on all new queries
3. Summarize understanding, flag contradictions

---

## CP4 — OAuth deep linking (mobile)

**CONTEXT TO READ FIRST:**
1. CLAUDE.md
2. docs/specs/in-progress/phase-2-onboarding-billing.md — CP4
3. docs/FitCoach-Mobile-Strategy.md

**TASK:**
Enable Google OAuth on native iOS + Android (deferred from Phase 1).

- Evaluate Capgo social-login plugin FIRST (noted in Phase 1 spec — Ionic
  acquisition shifted momentum to Capgo for native social login). Use it if
  it's the cleaner path.
- Google OAuth works on native builds
- Deep link `fitcoach://auth/callback` routes correctly without opening
  external browser
- iOS: Universal Links (apple-app-site-association)
- Android: Intent Filter in AndroidManifest.xml

Use Context7 to verify current Capacitor deep-linking + Capgo plugin setup
before writing.

**TESTS TO RUN (Android emulator/device — then the phase-end iOS pass):**

**Test 0 — OAuth screens walkthrough.** On the Android app, confirm:
- "Continue with Google" button renders on both the login and signup screens
- Tapping it opens the native Google account picker (not an in-app web view of
  Google)
- After selection, the app returns to the dashboard

Then the behavior tests:
1. "Continue with Google" in the app on Android → the Google account picker
   opens
2. Select an account → the app opens the dashboard (not the login screen)
3. Deep link `fitcoach://auth/callback` is handled inside the app — no external
   browser opens
4. **Phase-end iOS pass:** repeat 1–3 on the iOS simulator. This is the single
   per-phase iOS verification — run it now since CP4 is the last checkpoint.

**COMPLETION PROTOCOL:**
Once user confirms all tests pass:
- Mark CP4 items [x] in phase-2-onboarding-billing.md
- Update docs/specs/BUILD-PLAN.md — Phase 2 CP4 complete + date
- Move phase-2-onboarding-billing.md to docs/specs/done/
- Mark Phase 2 COMPLETE in BUILD-PLAN.md
- Commit "Phase 2 complete — onboarding, billing, clients, OAuth"

**VERIFY BEFORE EXECUTING:**
1. Confirm CLAUDE.md read
2. Check Capgo plugin before hand-rolling deep links
3. Use Context7 — don't generate from memory
