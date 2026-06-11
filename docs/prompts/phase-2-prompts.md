# Phase 2 — Prompts (Onboarding + Billing)

Each prompt is ready to paste into Claude Code. Run the tests at the bottom of
each. Confirm pass → Claude Code marks complete, commits, updates
`BUILD-PLAN.md`.

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
- Cannot access `(app)` routes until onboarding complete (proxy.ts +
  AuthGuard check `onboarding_step`)
- Progress indicator (Step X of 6) at top
- Back button on every step except 1
- All data saves to `trainers` table

**TESTS TO RUN:**
1. Fresh signup → lands on /onboarding step 1
2. Complete step 1-2, close browser, reopen → resumes step 3
3. Complete all 6 → lands on dashboard
4. Trainer row in Supabase has all profile data + `onboarding_step = complete`
5. Incomplete onboarding → /clients redirects back to wizard
6. Option B selection → shows calling-loss warning
7. Photo upload → appears in Supabase Storage + shows in header

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

**TESTS TO RUN:**
1. Pick Starter → Razorpay test checkout opens
2. Test card 4111 1111 1111 1111 → payment succeeds, status active in DB
3. Razorpay failure test card → clear error, retry works
4. Starter trainer adds 11th client → blocked with upgrade prompt
5. Simulate expired subscription → redirected to /billing
6. Webhook received → DB status updates correctly

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

**TESTS TO RUN:**
1. Add client manually → all fields save → in list
2. Edit client → persists on refresh
3. Client with injuries → amber warning on detail page
4. CSV import 3 clients → all appear
5. Malformed CSV row → clear error, valid rows still import
6. AssignPlan modal shows real plans
7. ClientPicker modal shows real clients
8. Add client beyond tier limit → blocked

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

**TESTS TO RUN:**
1. "Continue with Google" on Android → Google picker opens
2. Select account → lands on dashboard (not login)
3. Same on iOS simulator
4. Deep link handled without external browser

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
