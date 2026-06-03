# Phase 1 — Foundation

**Status:** In progress
**Goal:** Replace prototype mock data with real Supabase backend,
add authentication, wrap with Capacitor for iOS + Android.

## Checkpoints

### Checkpoint 1 — Supabase setup
- [ ] Supabase project created
- [ ] Schema from docs/schema.md deployed via SQL editor
- [ ] Environment variables set in .env.local:
      NEXT_PUBLIC_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY
      SUPABASE_SERVICE_ROLE_KEY
- [ ] /src/lib/supabase/client.ts created
- [ ] /src/lib/supabase/server.ts created
- [ ] Simple test query confirms connection

### Checkpoint 2 — Authentication
- [ ] Supabase Auth configured (email + Google OAuth)
- [ ] /src/app/(auth)/login/page.tsx
- [ ] /src/app/(auth)/signup/page.tsx
- [ ] /src/app/(auth)/forgot-password/page.tsx
- [ ] middleware.ts protects /(app) routes
- [ ] Header shows real trainer name from auth session
- [ ] Logout works
- [ ] Test: signup → verify → login → logout → can't access dashboard

### Checkpoint 3 — Replace mock data
- [ ] AppContext reads from Supabase, not data.ts
- [ ] Clients list (real data, filtered by trainer_id)
- [ ] Client detail page
- [ ] Plans list + plan builder saves to DB
- [ ] Escalations/inbox
- [ ] Payments stub
- [ ] RLS policies active
- [ ] Test: two trainer accounts, data isolation confirmed
- [ ] Test: refresh page, data persists

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

### Checkpoint 5 — Mobile polish
- [ ] Splash screen (teal background, FitCoach logo)
- [ ] Status bar configured
- [ ] Android back button handled
- [ ] Safe area handling (iOS notch + Android nav bar)
- [ ] Test: full flow on real Android device

## Architecture rules for this phase
- Every query filters by trainer_id — enforced via RLS
- No mock data in any production code path
- TypeScript strict — no any types
- Use Supabase client/RPC — no Next.js API routes

## Success criteria
- Two trainer accounts can sign up, log in, add clients
- Trainer A cannot see Trainer B's data
- All data persists across page refreshes
- Android app builds and installs on real device
- iOS builds in simulator

## Do NOT start Phase 2 until all checkpoints above are ticked.
