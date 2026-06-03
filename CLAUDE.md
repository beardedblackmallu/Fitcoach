@AGENTS.md

# FitCoach — Project Constitution

## What we're building
AI-powered WhatsApp coaching platform for independent fitness
trainers in India. Trainers use a Capacitor-wrapped mobile app
(iOS + Android) built on Next.js. Clients use regular WhatsApp
only — no client app, ever.

Full spec: docs/FitCoach-PRD.md (v1.1)
WhatsApp architecture: docs/FitCoach-WhatsApp-Infrastructure.md
Mobile decisions: docs/FitCoach-Mobile-Strategy.md

## Current build phase
**Phase 1 — Foundation**
Active spec: docs/specs/in-progress/phase-1-foundation.md

Checkpoints:
- [ ] Supabase project + schema deployed
- [ ] Supabase Auth (email + Google OAuth)
- [ ] AppContext mock data replaced with real Supabase queries
- [ ] RLS policies active and tested
- [ ] Capacitor iOS + Android builds working

## Tech stack (locked — do not deviate)
- **Frontend:** Next.js 16 + TypeScript strict + Tailwind v4 + Recharts
- **Mobile:** Capacitor wrapper (iOS + Android) — NOT React Native
- **Database:** Supabase (Postgres + Auth + Storage)
- **WhatsApp:** AiSensy BSP
- **Payments:** Razorpay
- **AI:** Claude Haiku (classification + food vision) + Sonnet (plans)
- **Hosting:** Vercel (web) + App Store + Play Store (mobile)

## Architecture rules (never break these)
- Every DB query MUST filter by trainer_id — enforced via RLS
- Multi-tenant: trainer A must NEVER see trainer B's data
- TypeScript strict — no `any` types
- No Next.js API routes — use Supabase client/RPC directly
- No mock data in production — throw clear errors if data missing
- No client-side WhatsApp — clients use regular WhatsApp only
- Capacitor plugins for camera/push/biometrics — not browser APIs

## Folder structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   └── (app)/
│       ├── layout.tsx
│       ├── page.tsx              # Dashboard
│       ├── clients/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── conversations/page.tsx
│       ├── inbox/page.tsx
│       ├── plans/
│       │   ├── page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── payments/page.tsx
│       └── settings/page.tsx
├── components/
└── lib/
    ├── supabase/
    │   ├── client.ts             # Browser Supabase client
    │   └── server.ts             # Server Supabase client
    ├── data.ts                   # Seed data (prototype only — being replaced)
    └── AppContext.tsx            # Global state
docs/
├── FitCoach-PRD.md
├── FitCoach-WhatsApp-Infrastructure.md
├── FitCoach-Mobile-Strategy.md
└── specs/
    ├── in-progress/
    └── done/
```

## Visual design tokens (unchanged)
- **Primary:** teal `#0D9488` (`bg-teal-600`, `text-teal-700`)
- **Accent:** amber `#F59E0B` — escalations only
- **Background:** `#FAFAF9`
- **Cards:** `bg-white border border-stone-200 rounded-xl`
- **Font:** Inter via next/font/google, exposed as `--font-inter`
- **Stone text scale:** `stone-900` headings, `stone-700` body, `stone-500` secondary, `stone-400` muted
- **Border radius:** inputs `rounded-lg`, cards `rounded-xl`, modals `rounded-2xl`, pills `rounded-full`
- **Spacing:** pages `px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto`

## Message bubble styles
- **Bot:** `bg-stone-100`, left-aligned, `🤖 Bot` label above timestamp
- **Trainer:** `bg-teal-600 text-white`, right-aligned, `✓ From [Trainer]` label, `(via FitCoach)` italic below timestamp
- **Client:** white with subtle border, left-aligned
- **System:** centered italic pill (call logs, date separators, "Plan delivered · N weeks ago")
- **Document (PDF):** PDF card inside bubble — page icon + workout/nutrition glyph, filename, metadata line, circular download button. Colors flip for trainer (teal) vs client (white).
- **Voice:** play button + animated waveform bars + duration

## Rules carried forward from prototype (still apply)
- Don't show online presence on client avatars — use "last active Xh ago"
- Don't hardcode plan duration strings — read from plan object
- Don't put video URLs on per-day exercise cards — library only
- Don't pre-fill nutrition on new plans — demo plan `p-12wt` only
- Don't add default exercise videos — trainers add their own
- YouTube only for video links in V1

## Rules that have CHANGED (prototype → production)
- ~~No real auth~~ → **Supabase Auth is required**
- ~~No real DB~~ → **Supabase Postgres is required**
- ~~No real payments~~ → **Razorpay integration coming in Phase 6**
- ~~No real WhatsApp~~ → **AiSensy integration coming in Phase 3**
- ~~No backend~~ → **Supabase RPC/Edge Functions for server logic**

## Uncertainty rule
If unsure about any API, library version, or pattern:
1. Say "I need to verify this" explicitly
2. Use Context7 to look up exact docs
3. Never guess or generate from memory

## Before every task
1. Read this file (CLAUDE.md)
2. Read the active spec in docs/specs/in-progress/
3. Read relevant PRD sections
4. Summarize your understanding in 3 sentences
5. Flag any contradictions before writing code

## Next.js 16 — important gotchas (retained from prototype)
This is Next.js 16 with breaking changes from prior versions.
Read `node_modules/next/dist/docs/` before touching framework-level
code. Key gotcha specific to this codebase:

- `useSearchParams()` requires a `<Suspense>` boundary in Next 16.
  See `conversations/page.tsx` for the pattern — export a wrapper
  that mounts the inner component inside `<Suspense>`.
- All pages are `"use client"` — no Server Components until
  Supabase SSR is fully wired.

## Architecture patterns (retained from prototype)

### Supabase clients
- `src/lib/supabase/client.ts` — browser client (for client components)
- `src/lib/supabase/server.ts` — server client (for route handlers / middleware)
- Every query on the client side auto-scopes via RLS (trainer_id = auth.uid())

### Global state in AppContext
Cross-screen state (modals, toasts, overrides) lives in
`src/lib/AppContext.tsx`. Don't add per-page context — use AppContext.

### Modals mount globally
All modals mount once in `(app)/layout.tsx` and read open/close
state from AppContext. Never mount modals inside individual pages.

### Adding a new modal
1. Add open/close state + payload type in AppContext
2. Create `src/components/MyModal.tsx`, return null if not open
3. Mount in `(app)/layout.tsx`
4. Trigger via `useApp().openMyModal(...)`

### Toasts
`useApp().showToast("message")` — neutral
`useApp().showToast("message", "success")` — green checkmark
Auto-dismisses ~2.8s. Use for state changes only, not navigation.

## Testing

```bash
npm run build    # Type check + production build — run before pushing
npm run dev      # Local dev
npm run android  # Build + open Android Studio
npm run ios      # Build + open Xcode
```

## Deployment
- Push to main → Vercel auto-deploys (web)
- Mobile: build via Capacitor, submit via App Store Connect +
  Google Play Console
- Environment variables required:
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY
