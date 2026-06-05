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
**Phase 2 — Plan builder polish + mobile OAuth**
Active spec: docs/specs/in-progress/phase-2-onboarding-billing.md
Build plan index: docs/specs/BUILD-PLAN.md

Completed:
- [x] CP0 — Color reskin (teal → charcoal + burnt orange, 2026-06-05)

In progress:
- [ ] CP1 — Plan builder per-week variation
- [ ] CP2 — Nutrition tab persistence
- [ ] CP3 — AssignPlanModal real DB integration
- [ ] CP4 — Mobile OAuth deep linking

**Previous:** Phase 1 — Foundation (✅ Complete 2026-06-04)
Completed spec: docs/specs/done/phase-1-foundation.md

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
- **Route protection file is `src/proxy.ts`, NOT `middleware.ts`.**
  Next.js 16 deprecated `middleware.ts` and renamed the convention to
  `proxy.ts` (v16.0.0). Having both files simultaneously makes behavior
  unstable per the Next.js 16 docs. Do NOT create `middleware.ts` as a
  "safety net" or attempt to rename `proxy.ts` back to `middleware.ts`.

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

## Visual design tokens (Phase 2 CP0 reskin — 2026-06-05)
- **Primary accent:** Burnt orange `#C05C28` — escalations, badges, nav active state, one CTA per screen (replaces teal)
- **Charcoal:** `#1C1C1C` — sidebar, default primary buttons
- **Background:** `#F5F4F2` (replaces `#FAFAF9`)
- **Cards:** `#FFFFFF` border `#E5E3DE`
- **Success:** Teal `#1D9E75` — positive states ONLY
- **Text:** Primary `#1A1A1A`, secondary `#6B7280`, muted `#9A9A9A`
- **Font:** Inter via next/font/google, exposed as `--font-inter`
- **Border radius:** inputs `rounded-lg`, cards `rounded-xl`, modals `rounded-2xl`, pills `rounded-full`
- **Spacing:** pages `px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto`
- **Principle:** Orange is used sparingly. Default primary buttons are charcoal. If in doubt, use charcoal not orange.

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
