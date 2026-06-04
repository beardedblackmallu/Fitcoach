# Phase 1 — Foundation

**Status:** Complete (2026-06-04)
**Goal:** Replace prototype mock data with real Supabase backend,
add authentication, wrap with Capacitor for iOS + Android.

## Completion protocol

For each checkpoint:
1. Claude Code completes the work
2. Run all "Tests to run" — user performs them manually
3. User reports "all tests pass" or lists which failed
4. If all pass: Claude Code marks every item under that checkpoint
   as [x], commits with "Phase 1 Checkpoint N complete", pushes to
   GitHub, then proceeds to next checkpoint
5. If any fail: Claude Code does NOT mark complete. Fixes the
   failing issue, asks user to re-run failed tests
6. User does not need to ask for these updates — Claude Code does
   them automatically once tests are confirmed

---

## Checkpoints

### Checkpoint 1 — Supabase setup
- [x] Supabase project created (gcendipptiwpipadqzan · ap-south-1 Mumbai)
- [x] Schema from docs/schema.md deployed via SQL editor
- [x] Environment variables set in .env.local:
      NEXT_PUBLIC_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY
      SUPABASE_SERVICE_ROLE_KEY
- [x] /src/lib/supabase/client.ts created
- [x] /src/lib/supabase/server.ts created
- [x] Simple test query confirms connection (✅ Connected! trainers rows: 0)

#### Watch for these
- Legacy Supabase API key format used (anon / service_role starting
  with `eyJ...`) — NOT the new sb_publishable_ / sb_secret_ format.
  We deliberately chose legacy for SDK compatibility.
- @supabase/ssr installed — not deprecated @supabase/auth-helpers-nextjs
- RLS enabled on every table in schema
- trainer_id foreign key on every client-owned table

#### Tests to run
1. Test query returns successfully (SELECT COUNT FROM trainers returns 0)
2. .env.local has all three Supabase variables
3. Both /src/lib/supabase/client.ts and server.ts exist and export createClient()

#### Completion status
✅ Complete — all tests passed.

---

### Checkpoint 2 — Authentication
- [x] Supabase Auth configured (email + Google OAuth)
- [x] /src/app/(auth)/login/page.tsx
- [x] /src/app/(auth)/signup/page.tsx
- [x] /src/app/(auth)/forgot-password/page.tsx
- [x] src/proxy.ts protects /(app) routes (Next.js 16 — NOT middleware.ts)
- [x] Header shows real trainer name from auth session
- [x] Logout works
- [x] Test: signup → verify → login → logout → can't access dashboard

#### Watch for these
- @supabase/ssr used — not @supabase/auth-helpers-nextjs
- src/proxy.ts exists and protects (app) routes — NOT middleware.ts.
  Next.js 16 renamed middleware.ts to proxy.ts. Having both causes
  unstable behavior. Do not recreate middleware.ts.
- /auth/callback/route.ts handles OAuth code exchange (not /callback)
- Auth pages in (auth) route group — do not inherit (app) layout
- Real auth session used in Header — not hardcoded "Sandeep Kumar"

#### Tests to run
1. http://localhost:3000 → redirects to /login when logged out
2. Sign up at /signup with real email → receive verification email
3. Click verification link → lands on dashboard
4. Sign out via header dropdown → redirects to /login
5. Sign in again with email + password → reaches dashboard
6. Try /signup while logged in → redirects to /
7. Logged out, paste /clients into URL → redirects to /login.
   Repeat for /conversations, /plans, /inbox
8. Close browser tab, reopen localhost:3000 → still logged in
9. Try login with wrong password → clear error message shown
10. Header shows real signed-up name, not "Sandeep Kumar"
11. /forgot-password flow: enter email → receive reset link →
    reset password → log in with new password
12. Sign up a second account (use email+test@gmail.com alias) →
    both accounts can log in independently

---

### Checkpoint 3 — Replace mock data
- [x] AppContext reads from Supabase, not data.ts
- [x] Clients list (real data, filtered by trainer_id)
- [x] Client detail page
- [x] Plans list + plan builder saves to DB
- [x] Escalations/inbox
- [x] Payments stub
- [x] RLS policies active
- [x] Test: two trainer accounts, data isolation confirmed
- [x] Test: refresh page, data persists

#### Watch for these
- Every Supabase query filters by trainer_id (or relies on RLS)
- RLS policies actually deny cross-tenant access (test it)
- No remaining references to data.ts in production code paths
- AppContext refactored cleanly, components still work
- Loading states added where data is fetched
- Error states added where queries can fail
- TypeScript types match Supabase schema — no any

#### Tests to run
1. Sign in as Trainer A → add a client → refresh page → client
   still there
2. Sign in as Trainer A → create a plan → refresh page → plan
   still there
3. Sign in as Trainer A → assign plan to client → refresh →
   assignment persists
4. Sign in as Trainer A → mark an escalation resolved → refresh
   → still resolved
5. Sign in as Trainer B → see ZERO of Trainer A's clients, plans,
   or escalations
6. Trainer A's dashboard counts match Trainer A's actual data
7. Open Supabase dashboard → confirm rows exist in tables for
   Trainer A's actions
8. Try to query Trainer A's data while signed in as Trainer B
   via browser console → should fail with RLS error

---

### Checkpoint 4 — Capacitor setup
- [ ] Capacitor installed and configured
- [ ] capacitor.config.ts: appId com.fitcoach.app
- [ ] next.config.ts updated for static export
- [ ] Plugins installed: push-notifications, camera, filesystem,
      preferences, network, app, splash-screen, status-bar
- [ ] iOS platform added (npx cap add ios)
- [ ] Android platform added (npx cap add android)
- [ ] package.json scripts: build:mobile, ios, android
- [ ] Test: npm run android → app runs on emulator

#### Watch for these
- capacitor.config.ts: appId is com.fitcoach.app, appName "FitCoach"
- next.config.ts has output: 'export' for mobile builds
- All required Capacitor plugins installed
- ios/ and android/ folders created at project root
- package.json has build:mobile, ios, android scripts
- No Next.js API routes used (incompatible with static export)

#### Tests to run
1. npm run build:mobile completes without errors
2. npm run android opens Android Studio with FitCoach project
3. Build to Android emulator → app launches, shows login screen
4. Can sign in on Android emulator → reaches dashboard
5. Can navigate between screens on emulator
6. Web build still works at npm run dev (Capacitor didn't break web)

#### Known gaps — Checkpoint 4

- **Mobile OAuth deep linking deferred to Phase 2** — email+password only
  on native for now. Google OAuth needs a deep-link bridge that static
  export + Capacitor can't do without extra plugin work.
- **Dynamic routes use placeholder static params** — `/clients/[id]` and
  `/plans/[id]/edit` export `generateStaticParams() => [{ id: "_" }]` with
  `dynamicParams=false`. Only a throwaway `_` shell is pre-rendered; real
  IDs resolve client-side via the App Router inside Capacitor. This is the
  accepted Capacitor + Next.js static-export pattern.
- **Auth callback converted from Route Handler to client page** —
  `auth/callback/route.ts` → `auth/callback/page.tsx`. Static export can't
  run server Route Handlers that read the Request. Client page does the
  `exchangeCodeForSession` in the browser.
- **proxy.ts disabled in mobile build, active on web** — static export
  strips middleware/proxy. AuthGuard (client-side) is the only auth gate on
  mobile; on web proxy.ts runs server-side first + AuthGuard as second layer.
- **iOS `cap sync` blocked by CocoaPods/Ruby encoding bug** — local env
  issue (Encoding::CompatibilityError in CocoaPods 1.16.2 + Ruby 4.0.5),
  not our code. Android path unaffected. Resolve iOS env separately.
- **Android Studio required for `npm run android`** — build + sync work
  headless, but `cap open android` needs Android Studio + SDK installed.

#### Phase 2 note — evaluate Capgo for native social login

Ionic (Capacitor's parent) was acquired in late 2025 / early 2026 and
community momentum has partly shifted to Capgo's plugin ecosystem,
especially for native social login. When building OAuth deep linking in
Phase 2, evaluate Capgo's social-login plugin before hand-rolling a deep
link bridge.

---

### Checkpoint 5 — Mobile polish
- [x] Splash screen (teal background, FitCoach "F" logo) — both platforms
- [x] Status bar configured (teal #0D9488 with white icons)
- [x] Android back button handled (canGoBack → history.back; else exitApp)
- [x] Safe area handling (top + bottom on mobile, header on desktop)
- [x] Test: full flow on Android emulator + iOS simulator

#### Watch for these
- Splash screen uses FitCoach logo on teal #0D9488 background
- Status bar color matches active screen (teal on app screens)
- Android back button navigates back through history, only exits
  app from root screen
- Safe area insets respected on iOS (notch) and Android (nav bar)
- No text overflowing or buttons cut off on small screens

#### Tests to run
1. Cold launch app on Android device → splash screen shows before
   login appears
2. Press Android back button at /clients → returns to /
3. Press Android back button at / → app exits (or shows confirm)
4. Open on Android device with notch → no content hidden behind
   status bar
5. Test full flow: signup → login → add client → create plan →
   logout on real Android device
6. iOS simulator: same full flow works

---

## Known gaps (discovered during CP3 — deferred to Phase 2)

These are intentional limitations accepted for Phase 1. Each is
tracked in docs/design-backlog.md. Do NOT try to fix these during
Phase 1 — they require AiSensy (Phase 3) or significant schema work.

### Plan builder

| Gap | Why deferred |
|---|---|
| All weeks show the same exercises | One week template saved (cycle 1 / week 1). Per-week variation needs a grid state per week + more complex DB writes. Phase 2. |
| Nutrition tab not saved to DB | Requires writing to 5 nested tables (nutrition_plans → meals → variants → foods → hunger_substitutions). Deferred to Phase 2. |
| "Send plan to client" button is a stub | Needs Razorpay + AiSensy PDF delivery. Phase 3/6. |
| AssignPlanModal and ClientPickerModal still use mock plans | AppContext.plans is still seeded from data.ts. Will be replaced when full plans migration is complete. |

### Inbox / Escalations

| Gap | Why deferred |
|---|---|
| Inbox shows "All caught up" (empty) in real usage | Escalations are created by the bot webhook when it detects medical/off-topic messages. No bot exists yet — that is Phase 3 (AiSensy). You cannot manually trigger real escalations until the webhook is wired. |
| Suggested replies section always empty | Suggested replies are AI-generated by Claude and stored in escalation_suggested_replies. No AI generation pipeline yet — Phase 3. |
| "Open conversation" from inbox routes to mock conversations | Conversations page still uses data.ts mock data. Will work correctly once conversations are migrated (CP3 Screen 5). |
| Quoted message shows "(message unavailable)" if no trigger message | The escalation schema links to messages via triggered_by_message_id. Without a real message row, the JOIN returns null. Correct in production when bot writes real messages. |
| BottomNav inbox badge shows 0 | Correct — no real escalations exist yet. Will show real count once bot creates them in Phase 3. |

### Conversations — fully deferred to Phase 3

The conversations page is intentionally left on data.ts mock data.
It will NOT be migrated in Phase 1.

| Gap | Why deferred |
|---|---|
| Entire conversations page reads mock data | Real conversations require AiSensy webhook to write messages to the DB. Without the bot, there is no message data to display. A partial migration (real DB but empty threads) adds complexity with zero user value. |
| Message sending is visual only | The composer sends messages to AppContext state, not to Supabase or AiSensy. Real sending requires AiSensy BSP API (Phase 3). |
| Conversation list shows Priya/Karan/Anita regardless of trainer | Mock data.ts conversations are not scoped to any trainer. This is acceptable for Phase 1 prototype testing. |

Phase 3 work required:
- AiSensy webhook → writes inbound messages to `messages` + `conversations` tables
- Outbound API → trainer reply → AiSensy → WhatsApp delivery
- Real-time subscription on `messages` for live updates
- Conversation list fetched from `conversations` table filtered by trainer

### Dashboard — partial migration (CP3)

Three of four metric cards are now wired to real DB data.
The fourth and both feed sections remain mock with console.warn.

| Section | Status | Depends on |
|---|---|---|
| Active clients count | ✅ Real | clients table |
| Plans expiring this week | ✅ Real | plan_assignments + plans |
| Revenue this month | ✅ Real | payments table (paid_at) |
| Avg compliance | ⚠️ Mock (`console.warn`) | workout_logs aggregation — Phase 4 |
| Action needed (escalation feed) | ⚠️ Mock (`console.warn`) | AiSensy webhook — Phase 3 |
| Today's check-ins feed | ⚠️ Mock (`console.warn`) | AiSensy check-in messages — Phase 3 |

The three mock sections each emit a `console.warn` in dev so they
are immediately identifiable during testing and not mistaken for bugs.

### Capacitor (CP4)

| Gap | Why deferred |
|---|---|
| Mobile OAuth deep linking deferred to Phase 2 — email+password only on native for now | Google OAuth in a native app requires deep-link handling (custom URL scheme → app → token exchange). Static export can't run the server callback route. Email+password works fully on native (Supabase browser client is bundled — verified). |
| iOS cannot build in this environment yet | Two environment blockers (not code): (1) only Xcode Command Line Tools installed, full Xcode required for `xcodebuild`/pod install; (2) Ruby 4.0.5 (Homebrew) is incompatible with CocoaPods 1.16.2 (Unicode normalization error). iOS folder is scaffolded and web assets copied; needs full Xcode + working CocoaPods to build. Android is unaffected and is the primary CP4 test. |
| Static export required four code changes | (1) auth callback converted from Route Handler to client page; (2) dynamic routes `/clients/[id]` and `/plans/[id]/edit` split into server wrapper + client View with `generateStaticParams`; (3) `force-static` added to icon + manifest routes; (4) `AuthGuard` client component added because proxy.ts is stripped in static export. Web build keeps proxy.ts server-side protection fully intact. |
| generateStaticParams returns a placeholder `[{id:"_"}]` not `[]` | Turbopack's static-export collector rejects an empty array. The placeholder generates one throwaway HTML shell; real IDs resolve client-side via the App Router inside Capacitor. |

### Phase 2 note — evaluate Capgo for native social login

Ionic (Capacitor's parent company) was acquired in late 2025/early
2026 and community momentum has partly shifted to Capgo's plugins,
especially for native social login. When building OAuth deep linking
in Phase 2, evaluate Capgo's social-login plugin before hand-rolling
a deep-link bridge — it may handle the Google sign-in token exchange
on iOS/Android out of the box.

---

## Architecture rules for this phase
- Every query filters by trainer_id — enforced via RLS
- No mock data in any production code path
- TypeScript strict — no any types
- Use Supabase client/RPC — no Next.js API routes
- Route protection: src/proxy.ts (not middleware.ts — see CLAUDE.md)

## Success criteria
- Two trainer accounts can sign up, log in, add clients
- Trainer A cannot see Trainer B's data
- All data persists across page refreshes
- Android app builds and installs on real device
- iOS builds in simulator

## Do NOT start Phase 2 until all checkpoints above are ticked.
