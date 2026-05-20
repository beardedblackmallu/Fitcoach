# FitCoach

*A WhatsApp-native coaching platform for independent online fitness trainers in India.*

---

## The problem

India has thousands of independent online fitness coaches running their business out of WhatsApp — sending plans as PDFs, doing daily check-ins by text, taking voice notes when clients have form questions. WhatsApp works, but the coaches drown in repetitive admin: morning check-in reminders for 20+ clients, payment chase-ups, plan customization across spreadsheets.

The existing tools force a binary choice. Either fully automate via a bot (which clients hate, because it feels impersonal and falls apart the moment something off-script comes up), or stay manual on WhatsApp (which doesn't scale past ~15 clients per coach). Nobody has built the middle path: a system that handles the repetitive 80% and intelligently pulls the coach in for the personal 20%.

## The product

FitCoach gives a coach one WhatsApp Business number that handles **both** automated bot messages and the coach's personal messages — voice notes, videos, photos — to the same thread. Clients only ever use regular WhatsApp on their phone. They never log in to anything. They never download an app.

The coach uses a web dashboard to:
- Manage their roster of clients
- Build multi-week workout and nutrition plans (with cycles, alternatives, food substitutions)
- Send plans to clients as PDFs over WhatsApp
- Chat with clients (voice notes, photos, text)
- Track compliance, weight progress, payments
- Respond to **escalations** — the bot's autonomous decision to defer to a human

## The killer feature: escalations

The differentiator is the bot's self-awareness. When a client says *"my left knee has been hurting since yesterday's workout, should I skip leg day?"*, the bot detects medical keywords and refuses to answer — instead, it routes the message into the coach's Inbox with:

- The full client message in context
- A plain-English explanation of why the bot deferred
- 2–3 suggested replies the coach can use, edit, or ignore
- One-tap actions: open the conversation, call the client, send a voice note, or mark resolved

This reframes the product from "automation that sometimes fails" to "smart coaching assistant that knows its limits." It's the conversation I wanted design partners to react to.

## What I built

A complete clickable prototype across 9 routes, mobile-responsive throughout:

- **Dashboard** — KPI tiles + amber-prioritized Action Needed feed + today's check-ins
- **Clients** — searchable roster with status, compliance bars, and 3-dot actions (assign plan, view profile, pause)
- **Client detail** — weight progress chart, compliance breakdowns, recent activity, **health profile** with intake-driven amber warning ("Review before planning") for clients with injuries or medical conditions
- **Conversations** — two-pane chat with visually distinguished bot / trainer / client / system / document / voice / image bubbles, all in one thread per client. Trainer messages show "(via FitCoach)" so the relationship is honest
- **Inbox** — escalation queue with collapsible "why this was escalated" and "Use this" suggested replies that populate the chat composer
- **Plans** — template + custom-plan library with a full builder (Workouts tab: 7-day grid × N weeks × cycles; Nutrition tab: macros + meals with primary/alternative variants + coach notes + hunger substitutions)
- **Send Plan workflow** — four-step modal: pick clients → preview the PDF that gets sent → animated WhatsApp send → success state with delivery confirmations
- **Add client** — intake form with the fields a real coach actually asks: injuries with timeframes, medical conditions, diet preference, whey use, allergies
- **Payments, Settings** — first-cut scaffolding

Plus shared infrastructure: a voice-note recorder with three states (idle → recording → playback), a tap-to-call modal that drops a system message into the conversation log, a YouTube video link manager keyed by exercise library (so adding a video to "Squat" propagates everywhere it's used), and a global toast / notifications system.

## Design decisions worth calling out

A few non-obvious calls that shape the product:

- **No client login, ever.** Clients use WhatsApp natively. This is the single biggest distribution advantage in the Indian market — competing apps require client onboarding which kills adoption.
- **No online-presence indicators.** WhatsApp Business API doesn't expose last-seen to businesses, and I refused to fake it. The status reads "last active 2h ago" based on real message timestamps.
- **Empty by default, demo by exception.** New nutrition plans start completely empty so coaches build their own philosophy. Only the demo plan (`12-Week Transformation`) carries pre-filled sample content for design-partner walkthroughs.
- **Library as source of truth.** Form videos belong to the exercise library, not per-day exercise cards. Adding a Squat video once applies across every Monday/Wednesday/Friday Squat in every plan, in every week. Avoids the "trainer pastes the same link 12 times" failure mode.
- **Honest about the trainer's phone.** Tap-to-call doesn't route through the platform. The disclaimer says so explicitly: *"Call from your personal phone — clients receive your real number, not the FitCoach platform number."* Real trust over fake convenience.
- **Indian context throughout.** ₹ everywhere, +91 phone format, food references to dal makhani, idly, chutney, jeera rice. Names like Priya Sharma, Karan Mehta, Anita Desai. This is not a US fitness app re-skinned.

## Tech

- **Frontend** — Next.js 16 (App Router, Turbopack) with TypeScript, Tailwind CSS v4, lucide-react icons, Recharts for the weight-progress line chart.
- **State** — React Context for cross-screen state (modals, toasts, plan/client overrides, library videos, composer prefills, resolved escalations, call logs). No backend.
- **Data** — all seeded in `src/lib/data.ts`; the prototype is intentionally backend-free so design-partner conversations focus on UX, not infra.
- **Hosted on Vercel**, auto-deploys on every push.
- **Production architecture (designed, not built)** — Postgres on Supabase with Row Level Security, file storage for voice notes / food photos / PDFs, AiSensy as the WhatsApp Business Solution Provider, Claude API for the bot, Razorpay for payments, Vercel Cron for daily check-ins. Full schema documented in `docs/schema.md`, full feature spec in `docs/PRD.md`.

## Process

I worked from a layered approach:

1. **Concept brief** (2 days) — exact screens, exact words on buttons, exact colors, exact behaviors per modal. Wrote it as a spec instead of starting from sketches.
2. **Prototype build** (1 week) — shipped the full clickable app in iterative passes. Built the spine first (sidebar/header/layout), then each screen, then the modals.
3. **Refinement loops** — design partner-style feedback on language ("Send plan to client" beats "Assign to client"), prominence (escalations need amber containers, not just amber borders), and discipline (the nutrition tab shouldn't pre-fill for every new plan).
4. **Documentation** — `PRD.md` covers feature-by-feature edge cases and acceptance criteria; `schema.md` covers the production database design; `CLAUDE.md` codifies architectural conventions for any future contributor.

## What's next

The prototype is for design-partner conversations — getting real coaches to react. From the early reactions, I'm shaping the production build: which features matter, which ones are over-built, what's missing from the intake form, how trainers actually use voice notes vs text.

Once 3–5 design partners have committed, the production build (database + WhatsApp integration + payments + auth) is a focused 2–3 month engineering effort.

## Links

- **Live prototype**: [vercel deployment URL]
- **GitHub**: [github.com/beardedblackmallu/Fitcoach](https://github.com/beardedblackmallu/Fitcoach)
- **Full product spec**: [`docs/PRD.md`](./PRD.md)
- **Database schema**: [`docs/schema.md`](./schema.md)

---

### When adding this to your portfolio site

A few suggestions for how to present this:

- **Lead with the killer feature.** The escalation system is the strongest hook — a 15-second GIF of the Inbox showing Anita's knee message + "Use this" populating the conversation composer is worth more than a static screenshot.
- **Use the Send Plan flow as your "depth" moment.** Walking through the 4-step modal (select clients → preview the PDF → animated send → success state) is a real product-thinking story.
- **Don't over-explain the prototype caveat.** It's standard for product portfolios to show clickable prototypes; the case study reads strongest if you treat it as a real product you've designed and built.
- **Screenshots to capture** (in order of importance):
  1. Dashboard with the amber Action Needed section
  2. Inbox with Anita's escalation expanded
  3. Plan Builder → Nutrition tab on the demo plan (idly + chutney + alternatives visible)
  4. Send Plan preview step (PDF mockup on right, summary on left)
  5. Priya's conversation thread showing the onboarding moment (PDF cards in chat)
  6. Add Client modal showing the 4 intake sections
- **Mention the documentation.** A portfolio that includes a PRD and a schema design signals you ship complete thinking, not just visuals.

Word count: ~750. Tweak however you want.
