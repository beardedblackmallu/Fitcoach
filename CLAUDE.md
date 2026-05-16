@AGENTS.md

# FitCoach — Working notes for Claude

This is a clickable prototype of a WhatsApp-native coaching platform for independent online fitness trainers in India. It will be shown to real trainers in design-partner conversations, so **polish matters**. All data is hardcoded. No real backend, no real WhatsApp, no real auth.

For the full product spec, edge cases, and acceptance criteria for every feature, **read `docs/PRD.md` before making changes**. Update the PRD whenever you ship a new feature or change a behavior.

## What this app actually does

A trainer (Sandeep Kumar in the demo) uses this dashboard to:
- Manage their roster of clients (Priya, Karan, Anita, etc.)
- Build multi-week workout and nutrition plans
- Send those plans to clients via WhatsApp PDFs
- Chat with clients via voice notes, photos, text — all routed through one WhatsApp Business number
- React to "escalations" — moments where the bot detected it shouldn't reply and pulled the trainer in (medical concerns, off-topic questions, etc.)
- Track progress, payments, compliance

The bot and the trainer share one WhatsApp thread per client. Bot messages and trainer messages are visually distinguished so the client knows who's talking.

The **killer feature** is the escalation system. Treat it as the most important thing on screen: amber styling, prominent placement, suggested replies, one-click "Use this" to prefill the composer.

## Tech stack

- **Next.js 16** (App Router, Turbopack). **Read `AGENTS.md`** and the bundled docs in `node_modules/next/dist/docs/` before touching framework-level code — this is not the Next.js you know from training data.
- **TypeScript** strict
- **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`, theme tokens via `@theme inline`)
- **lucide-react** for icons
- **recharts** for charts (weight progress line chart on client detail)
- **No backend, no database** — every page is `"use client"`, all state lives in React `useState` + a global React Context

## Folder structure

```
src/
├── app/
│   ├── layout.tsx              # root, mounts AppProvider, loads Inter font
│   ├── globals.css             # Tailwind import + theme tokens + animations
│   └── (app)/
│       ├── layout.tsx          # Sidebar + Header + global modals
│       ├── page.tsx            # Dashboard
│       ├── clients/
│       │   ├── page.tsx        # Client list
│       │   └── [id]/page.tsx   # Client detail
│       ├── conversations/page.tsx
│       ├── inbox/page.tsx
│       ├── plans/
│       │   ├── page.tsx        # Plan list
│       │   └── [id]/edit/page.tsx  # Plan builder (Workouts + Nutrition tabs)
│       ├── payments/page.tsx
│       └── settings/page.tsx
├── components/                  # Modals, sidebar, header, toasts, avatar, NutritionTab
└── lib/
    ├── data.ts                  # ALL seed data + types
    └── AppContext.tsx           # Global state (modals, toasts, overrides, etc.)
docs/
└── PRD.md                       # Product spec — update on every feature change
```

## Architecture conventions

### Every page is a client component
`"use client";` at the top. There's no Server Components story here because there's no backend. If you want to use `useParams`, `useSearchParams`, `useRouter`, `useState`, or our `useApp()` hook, that's why.

`useSearchParams` requires a `<Suspense>` boundary in Next 16 — see `conversations/page.tsx` for the pattern (export a wrapper that mounts the inner page inside Suspense).

### Global state lives in `AppContext`
Anything that needs to be visible across multiple screens or modals goes in `src/lib/AppContext.tsx`. Examples already there:
- Toast queue + `showToast(text, "success" | "default")`
- Voice recorder modal target (clientName)
- Tap-to-call modal target (clientId, name, phone)
- Send-plan / client-picker / assign-plan modals
- Add-client modal flag
- Exercise video YouTube modal target
- New-plan modal + prefill
- `plans[]` (templates + user-created) with `addPlan` + `assignClientsToPlan`
- `clientPlanOverrides` — when a plan is assigned, the client's effective plan name updates everywhere via `getEffectivePlanName(clientId, seedPlanName)`
- `libraryVideos: Record<exerciseName, url>` — the library is the source of truth for exercise videos; lifted from per-page state so links persist across navigation
- `composerPrefill` — Inbox "Use this" sets this; Conversations consumes it on mount
- `callLogs` — Tap-to-call drops a system message into the relevant conversation thread

When you add a feature that needs cross-screen state, **add it to AppContext, not React Context per page**.

### All seed data lives in `src/lib/data.ts`
Clients, conversations, escalations, today's check-ins, plans, exercise library, default nutrition plan, empty nutrition plan, notifications — all of it. When you need to add a new client or plan or message, edit this file. Don't sprinkle data across pages.

The `clients[]` and `plans[]` arrays use stable string ids (`priya`, `karan`, `p-12wt`, `p-strength8`, etc.). Components look up by id with helpers like `getClient(id)`, `getPlan(id)`, `getConversation(clientId)`.

### Modals mount globally
Voice recorder, tap-to-call, send plan, add client, etc. all mount in `(app)/layout.tsx` and read their open/closed state from `AppContext`. Don't mount modals inside individual pages — opening them by setting context state is cleaner and prevents the "modal disappears when I navigate" bug.

Per-page modals are okay if they're truly local (e.g., the Notes popover inside the plan builder).

### Routing
Use `useRouter().push("/path")` for navigation, `next/link`'s `<Link>` for declarative links. Dynamic params are read via `useParams<{ id: string }>()` from `next/navigation`. Query strings via `useSearchParams()`. Both require `"use client"`.

## Visual design tokens

- **Primary** — teal `#0D9488` (`bg-teal-600`, `text-teal-700`). Used for primary buttons, links, active nav state, trainer message bubbles.
- **Accent** — amber `#F59E0B`. Used **only** for the escalation system, the "Action needed" container on the dashboard, the "Review before planning" health pill, and a few coach-notes highlights. Resist using amber for anything else.
- **Background** — warm off-white `#FAFAF9` (set on body in `globals.css`).
- **Cards** — `bg-white border border-stone-200 rounded-xl`. Subtle hover: `hover:shadow-sm hover:border-stone-300`.
- **Stone** scale for grey text — `text-stone-900` headings, `text-stone-700` body, `text-stone-500` secondary, `text-stone-400` muted.
- **Font** — Inter via `next/font/google`, exposed as `--font-inter`. Tabular-nums (`tabular-nums` class) on numbers (weight, calories, compliance %, etc.).
- **Spacing** — generous. Pages typically `px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto`. Plan builder uses `max-w-[1400px]`.
- **Border radius** — `rounded-lg` for inputs/buttons (10px), `rounded-xl` for cards (12px), `rounded-2xl` for modals (16px), `rounded-full` for pills and avatars.

### Message bubble styles (Conversations)
- **Bot**: light grey (`bg-stone-100`), left-aligned, `🤖 Bot` label above
- **Trainer**: teal (`bg-teal-600 text-white`), right-aligned, `✓ From Sandeep` label, `(via FitCoach)` italic below timestamp
- **Client**: white with subtle border, left-aligned
- **System**: centered, italic, light grey rounded-full pill (used for call logs, "Plan delivered · 8 weeks ago", date separators)
- **Document**: PDF card inside a bubble — page icon + workout/nutrition glyph + filename + metadata + circular download button

## Common patterns

### Adding a new modal
1. Define an open/close state field in `AppContext` (e.g., `addClientOpen`, `openAddClient`, `closeAddClient`). For modals that need data, use a target object like `{ clientId, clientName, phone }`.
2. Create the modal component in `src/components/MyModal.tsx`. Return `null` if not open. Use the existing modals as templates — they all share fade-in backdrop + scale-in panel.
3. Mount it once in `src/app/(app)/layout.tsx`.
4. Trigger it from anywhere via `useApp().openMyModal(...)`.

### Adding a new screen
1. Create `src/app/(app)/myroute/page.tsx`. Start with `"use client";`.
2. Wrap in standard padding: `<div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">`.
3. Add a sidebar entry in `src/components/Sidebar.tsx` (icon from lucide, label, optional badge).
4. Document the screen in `docs/PRD.md` — purpose, key fields, edge cases, acceptance criteria.

### Adding data
1. Put the type and the seed array in `src/lib/data.ts`. Export both.
2. Add a `getX(id)` helper if components will look up by id.
3. If the data needs to change during the session (assignments, overrides, additions), maintain state in `AppContext`, seeded from `data.ts`.

### Toasts
`useApp().showToast("message")` for neutral, `showToast("message", "success")` for the green-checkmark variant. Auto-dismisses after ~2.8s. Don't show toasts for purely-navigational actions — only for state changes or confirmations.

## Things to NOT do

These are intentional design decisions. If you find yourself reverting one, talk to me first.

- **Don't show real-time online presence on client avatars.** WhatsApp Business API doesn't expose last-seen / online status to businesses. Use `"last active Xh ago"`, not `"online"`. The green dot in `Avatar` should never render `online={true}` for any client.
- **Don't hardcode plan duration strings.** Always read from `plan.durationWeeks`, `plan.cycleLengthWeeks`, `plan.cycles`. Past bug: silently falling back to 12 when "Custom" was selected — now fixed, don't reintroduce.
- **Don't put video URLs on per-day exercise cards.** Videos belong to the library exercise (keyed by name in `libraryVideos`). Adding a video to a Squat applies to every Monday/Wednesday/Friday Squat in every plan, in every week. Day cards are read-only with respect to videos.
- **Don't pre-fill nutrition content on new plans.** Only `p-12wt` (the demo plan) gets `defaultNutritionPlan`. Everything else gets `emptyNutritionPlan`. New plans start blank so the trainer fills their own philosophy in.
- **Don't add default exercise videos.** Library exercises start with no video. Trainers add their own per exercise. Reverting this is a regression — we had pre-populated videos earlier and removed them deliberately.
- **Don't add other video platforms.** YouTube only in V1 — `VideoLinkModal` validates against `youtube.com` and `youtu.be`. Vimeo / Loom / etc. can come later.
- **Don't simulate WhatsApp message sending with a real API.** Send/voice/document deliveries are all visual — toasts, animations, success states. The product is a prototype for design-partner conversations.
- **Don't add real auth, real DB, or real payment integration.** This is a clickable prototype.

## Testing changes

```bash
npm run build         # Type check + production build. Run before pushing.
npm run dev           # Local dev (auto-picks a free port, usually 3000 or 3001)
```

I do not run a test suite — there are no automated tests. The smoke test is: build cleanly, then hit each route via `curl -o /dev/null -w "%{http_code}"` to confirm 200.

## Deployment

- Push to `main` on GitHub.
- Vercel auto-deploys (~90 seconds). The live URL is in the Vercel dashboard.
- No environment variables, no build secrets.

## When you ship something

After every meaningful change:
1. **Update `docs/PRD.md`** — add or revise the feature section. Add to the changelog at the bottom.
2. Commit with a descriptive message (multiline is fine — explain *why*, not just *what*).
3. Push.
