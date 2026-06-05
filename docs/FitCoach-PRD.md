# FitCoach — Product Requirements Document

**Version:** 1.0
**Last updated:** 15 May 2026
**Status:** Active — V1 prototype phase
**Owner:** [Founder name]
**Stage:** Pre-build / design partner recruitment

---

## 1. Executive summary

FitCoach is a WhatsApp-native coaching automation platform for independent online fitness trainers in India. It replaces the "WhatsApp + Google Sheets + manual chasing" workflow that defines most Indian online coaching today with structured automation, while preserving the personal coach-client relationship that is the entire reason clients hire a coach. Clients continue using regular WhatsApp on their phones with zero new apps; trainers get a dashboard and a shared inbox that automates the routine work and surfaces only what needs human judgment.

The product is built solo by a non-engineer founder using Claude Code, targeting design partner conversations now and a phased launch over the next 5–7 months.

---

## 2. Problem statement

Indian online fitness coaches managing 20–100 clients lose 3–5 hours every day to operational chaos: WhatsApp threads scattered across dozens of clients, Google Sheets they update manually every Sunday night, copy-pasting workout plans into chat, chasing payments, reminding clients to log meals, formatting weekly progress reports. The coaching itself — the actual expertise — gets squeezed between this administrative tax.

Existing tools fail this market: international apps (Trainerize, Trueform) don't fit WhatsApp-first behavior, large Indian platforms (HealthifyMe, FITTR) compete with the trainer rather than serving them, and generic CRMs treat fitness coaching as scheduled appointments rather than continuous async relationships.

FITTR's success has validated that Indian fitness clients already engage daily on WhatsApp — so the path forward is not to change client behavior, but to give trainers the infrastructure to operate at scale through the channel clients already use.

---

## 3. Product vision & positioning

**Positioning statement:** The WhatsApp-native operating system for independent fitness coaches in India.

**Vision:** Every independent online coach in India runs their business through FitCoach within 5 years. The platform handles routine automation while the trainer focuses entirely on coaching. Trainers can serve 3× more clients without burning out, and clients get a more consistent coaching experience than even premium one-on-one programs deliver today.

**Brand voice:** Confident, practical, respectful of the trainer's expertise. We never position the AI as smarter than the coach. We position it as the assistant who handles the grunt work so the coach can do their best work.

---

## 4. Target market

### Phase 1 (months 0–12)
Independent online coaches managing 20–100 clients. Pricing: ₹999–₹2,499/month.
Distribution channels: FITTR community, NASM India certifications, trainer Facebook groups, Instagram and YouTube fitness creators.
Hook: "Replace WhatsApp + Sheets chaos."

### Phase 2 (months 6–18)
Multi-coach companies with 5–50 coaches. Corporate wellness providers. Pricing: ₹5,000–₹25,000/month.
Distribution: Natural expansion from Phase 1 trainers who grow into teams. Direct sales to wellness companies.

### Phase 3 (months 18–36)
Gym-based personal trainers and Tier 2/3 city trainers. Pricing: ₹299–₹999/month.
Requires a "Lite" product variant: simpler UX, Hindi language support, offline-resilient design.
Emotional hook for gym PTs: "Build a client base independent of any gym."

### Parallel track (ongoing)
Celebrity and high-ticket coaches. Pricing as agency engagement: ₹15,000–₹50,000/month with white-label branding. Treated as enterprise sales, not self-serve. Not the primary business but a meaningful revenue stream.

---

## 5. Architectural decisions (LOCKED)

This section catalogs every major architectural decision made. Each is locked unless explicitly reversed in the Change Log.

### 5.1 Single WhatsApp number per trainer (shared inbox model)
Each trainer gets a dedicated WhatsApp Business API number. Clients see "Coach [Name] Fitness" as the sender, not a generic platform name. This is non-negotiable for professional positioning.

### 5.2 Bot vs trainer message differentiation
Bot messages are visually distinct from trainer messages in the client's WhatsApp thread. Bot bubbles are light grey with a "🤖 Bot" label. Trainer bubbles are teal with a "✓ [Trainer name] wrote this" label. Clients always know who they're talking to. Trust over mystique.

### 5.3 Web PWA, not native mobile app
Single Next.js codebase serves both desktop (studio mode — plan building, analytics) and mobile (coach mode — voice notes, photo replies, quick chat). Browser APIs (MediaRecorder, getUserMedia) handle voice and camera natively on phones. Native app is deferred until post-PMF, only if design partners explicitly request it.

### 5.4 No client-side app or login
Clients only ever interact via regular WhatsApp on their phones. They never download anything, never log in. Zero friction.

### 5.5 WhatsApp calling — two-number architecture for V1
WhatsApp Business API numbers cannot make or receive voice/video calls. Trainers operate with two numbers in V1: Number A (the platform API number, for all messaging via the FitCoach dashboard) and Number B (their personal phone, for any voice or video calls to clients).

Trainer's calling workflow: "Tap to call" in the dashboard surfaces the client's number, trainer dials from their personal phone. Client onboarding Step 6a proactively discloses the trainer's personal number so clients can save it.

Trainer onboarding choice: Option A (fresh platform-provisioned number, recommended) or Option B (migrate existing WhatsApp Business number, which permanently loses calling ability from that number).

Voice API integration (Exotel/Knowlarity/MSG91) is deferred to V1.5/V2. Meta's WhatsApp Calling API is monitored for V2+ once generally available.

### 5.6 Plan delivery model — bundle for V1
When a trainer hits "Send plan to client," the bot sends 4 sequential WhatsApp messages spaced ~30 seconds apart: (1) Welcome message from trainer, (2) "How this works" explainer, (3) Workout plan PDF, (4) Nutrition plan PDF.

The PDFs are reference documents the client saves in their chat. Daily targeted messaging with adaptive skip-rescheduling logic is **deferred to V1.5** (see section 14.2).

### 5.7 Multi-week plan cycle structure
Plans are structured as Plan → Cycles → Weeks → Days → Exercises. Default cycle length is 4 weeks. Past weeks are read-only, the current week is locked, upcoming weeks within the active cycle are editable. After a cycle ends, the trainer designs the next cycle informed by the logs. No auto-progression algorithms in V1 — progression is a coach decision.

### 5.8 Pricing model — fixed templates AND custom plans
Trainers can create reusable plan templates ("Weight Loss Starter — 12 weeks") and also create one-off custom plans per client. Razorpay handles both: templates as subscription plans with auto-renewal, custom plans as one-time payment links.

### 5.9 Meal tracking — trainer-configurable per client
Three modes selectable per client: Off (bot never asks about meals), Encouraged (bot asks once daily with optional photo logging — default for new clients), Required (bot prompts for each of 3 meals/day, nutrition counted in compliance metrics).

Food logging mechanism: client photographs food and states the measurement → Claude Haiku vision identifies the food → system applies the stated measurement to nutrition lookup → calorie/macro breakdown. No portion-from-photo guessing. IFCT (Indian Food Composition Tables) as base nutrition database. Photo-logged meals build a proprietary Indian food database over time.

### 5.10 Trainer onboarding — hybrid
Self-serve UI for the basics, plus a 1:1 setup call. The first 50 setup calls are user research interviews disguised as onboarding — high-signal feedback, not support burden.

### 5.11 Honesty over mystique
Bot identifies itself as "the coaching assistant for [Trainer]" — never pretends to be the trainer. Bot validates trainer-entered data with the client (catches typos, gives client agency). Bot waits for client response between steps — natural conversational rhythm, no message dumping.

---

## 6. Tech stack

**Frontend:** Next.js + TypeScript, Tailwind CSS, Lucide React icons, Recharts for visualizations.

**Backend:** Next.js API routes, PostgreSQL + Prisma ORM.

**WhatsApp:** Meta Cloud API directly (no Business Solution Provider middleman, keeps us at base messaging rates).

**Payments:** Razorpay (UPI primary, cards and netbanking secondary).

**Storage:** Cloudflare R2 for storing food photos and media cheaply.

**AI:** Claude API. Haiku model for food vision and escalation classification (cost-optimized for high volume). Sonnet model for plan generation suggestions and complex client query handling.

**Hosting:** Railway.app or Render.com.

**Discipline:** Boring stack, no clever frameworks, no microservices, no Kubernetes. Built for 50 trainers, not 50,000.

---

## 7. WhatsApp infrastructure & economics

### 7.1 Per-message pricing (India, current rates)
- Marketing messages: ~₹1.09 per message
- Utility messages: ~₹0.145 per message
- Service messages: Free within the 24-hour customer service window

### 7.2 The cost optimization baked into product design
Every client-initiated message (morning weight log, workout completion, query) opens a 24-hour CSW (customer service window). All utility responses within that window are free.

**Design principle:** Clients should initiate first message daily. This converts what would otherwise be paid marketing/utility messages into free service messages. Expected cost reduction: 60–80%.

### 7.3 Unit economics (validated)
At 30 clients per trainer:
- Optimized WhatsApp cost: ~₹65/month
- Worst case: ~₹213/month
- AI vision cost (Claude Haiku at 30 clients): ~₹300/month
- Total platform cost per trainer (at 30 clients): ~₹365–513/month
- Trainer pays: ₹1,999/month (Standard tier)
- Net margin: 70%+

---

## 8. V1 feature scope (6 buckets)

### 8.1 Foundation
- Trainer signup and login
- Coach profile (name, photo, bio, specialties)
- WhatsApp number provisioning workflow
- Onboarding wizard

### 8.2 Client management
- Add client manually
- Bulk add via paste-list and CSV upload
- Client list with search and filters
- Client detail page with full history
- WhatsApp invite link generation
- Expanded client intake form (see section 12)

### 8.3 Plan builder
- Workouts tab with cycle/week/day/exercise structure
- Nutrition tab with macro targets, meals, alternatives, coach notes, hunger substitutions
- Exercise library with YouTube video links
- Multi-week cycle management with read-only past weeks
- Trainer-managed iteration (no auto-progression)

### 8.4 WhatsApp loop
- Plan delivery via 4-message sequence (see section 11)
- Daily morning check-in via bot
- Workout logging via client chat reply
- Trainer composer: text, voice notes, photos, videos
- Bot vs trainer message indicator visible to client

### 8.5 Smart tracking
- Meal photo + measurement → Claude Haiku vision → calorie/macro calculation
- Weight trend graph
- Compliance percentage per client
- Auto weekly digest delivered to trainer
- Client keyword queries: weight progress, this week, my streak, workouts left, help
- Chart image responses generated server-side and sent via WhatsApp

### 8.6 Payments and launch
- Razorpay UPI integration
- Fixed templates as Razorpay subscription plans
- Custom plans as one-time payment links
- Auto renewal reminders to clients
- Failed payment escalations to trainer
- PWA manifest and service worker
- Push notifications for escalations

---

## 9. The escalation system (key differentiator)

The escalation system is the feature that makes FitCoach more than a CRM. Most coaching platforms automate everything they can and leave the rest to the trainer to find. FitCoach autonomously detects situations needing human judgment and pulls the trainer in with full context.

### 9.1 Detection triggers
- Medical concerns (pain, injury, symptoms)
- Emotional distress
- Off-topic questions (relationship, family, work stress)
- Compliance drops (3+ missed check-ins in a row)
- Dramatic weight changes (>2 kg in a week)
- Audio messages (V1 doesn't transcribe — escalates instead)
- Pause / cancel / refund mentions
- Life events (travel, illness, life transitions)

### 9.2 Detection mechanism
Claude API as classifier (not simple keyword matching). The model evaluates the message in context of the conversation history and the client's profile to determine if escalation is warranted.

### 9.3 Surface points
- Dashboard "Action needed" section (above the fold, amber-styled)
- Dedicated Inbox screen with filter tabs (All, Medical, Off-topic, Compliance, Other)
- Conversation banners (in-thread alert)
- Client detail page sidebar
- Push notification + notification bell badge

### 9.4 Trainer tools in escalation context
- AI-suggested response options (2 starting points the trainer can use, modify, or ignore)
- Tap-to-call functionality with personal phone disclaimer
- "Mark resolved" workflow
- Why-was-this-escalated explanation (so trainer trusts the system)

---

## 10. Plan builder — workouts and nutrition

The plan builder is the most-used screen in the product. It's where coaches spend their Sunday nights today (in Google Docs), and replacing that workflow is one of the highest-value transformations FitCoach offers.

### 10.1 Structure
Two tabs at the top of every plan: **Workouts** (default) and **Nutrition**. Both save together as one plan. Both deliver together when the trainer sends.

### 10.2 Workouts tab
- Cycles (4-week chunks by default, customizable per plan)
- Weeks within each cycle (read-only for past, locked for current, editable for upcoming)
- Days of the week (Mon–Sun)
- Exercises per day with sets × reps × weight notation
- Duplicate-day functionality
- Rest day support
- Exercise library on the left panel with categories (All, Push, Pull, Legs, Core, Cardio)
- YouTube video links on exercises in the library (every exercise has a form video reference)

### 10.3 Nutrition tab
- Daily macro targets (calories, protein, carbs, fats)
- 6 default meal cards (Pre-workout, Post-workout, Meal 1 — Breakfast, Meal 2 — Lunch, Snacks, Meal 3 — Dinner)
- Each meal: food items (name, quantity, calories, carbs, fats, protein, fiber), auto-calculated meal total, "+ Add alternative" for OR options
- Coach notes textarea (diet rules specific to this coach/plan)
- Hunger substitutions list (editable items the client can have when hungry)

### 10.4 Empty state vs demo pre-fill
The 12-Week Transformation demo plan is pre-filled with sample content (idly+chutney breakfast, oats+PB alternative, sample coach notes, sample hunger substitutions) so design partners see what a completed plan looks like.

**Every new plan starts empty.** The trainer fills it with their own coaching philosophy — their macros, their meals, their rules, their substitutions. Pre-fills are demo content, never defaults.

### 10.5 Client intake fields captured during onboarding
- Basic: Name, phone, email, age, gender
- Body: Height (cm), current weight (kg), target weight (kg)
- Goals: Primary goal (dropdown), workout preference (Gym/Home/Hybrid), diet preference (Veg/Non-veg/Eggetarian/Vegan)
- Supplements: Whey protein use (Yes/No/Not sure)
- Health: Allergies, **injuries with timeframes** (critical — informs exercise selection), medical conditions, additional notes

Health profile data appears on the client detail page with an amber "⚠ Review before planning" warning if injuries or medical conditions are present.

---

## 11. Plan delivery workflow (LOCKED for V1)

### 11.1 Trainer-side workflow
1. Trainer clicks "Send plan to client" on a completed plan.
2. Modal opens for client selection (multi-select via checkboxes).
3. Preview pane shows what will be sent — workout PDF preview and nutrition PDF preview, with editable welcome message at top.
4. Trainer reviews and clicks "Send via WhatsApp."
5. Brief sending state (~2–3 seconds simulated in prototype).
6. Success state confirms delivery to each client with timestamps.

### 11.2 Client-side delivery sequence
The bot sends 4 WhatsApp messages over ~2 minutes, spaced ~30 seconds apart:

1. **Welcome message** from the trainer (personalized, trainer-editable before sending)
2. **"How this works" explainer** — sets expectations for daily check-ins, meal photos, weekly updates
3. **Workout plan PDF** — full reference document
4. **Nutrition plan PDF** — full reference document

After delivery, the client uses the PDFs as reference. Daily engagement happens through the existing flows (morning check-in, meal photos, workout logging via chat reply, weekly progress updates). The PDFs sit in the chat history as the source of truth.

### 11.3 Trainer can re-send updated plans
"Send updated plan to [Client]" triggers the same 4-message sequence with the new PDFs. Plan version history is naturally preserved in the chat thread.

### 11.4 Deferred to V1.5
Daily targeted messaging ("Today is Monday — Push Day. Here's your workout:..." with inline video links), skip detection, smart rescheduling prompts, plan-shift logic when client misses a day. The adaptive layer ships in V1.5 once design partners have used V1 for 2–3 months and we know what they actually want.

---

## 12. Pricing model

### 12.1 Trainer subscription tiers
- **Starter:** ₹999/month — up to 10 clients
- **Growth:** ₹1,999/month — up to 30 clients
- **Pro:** ₹2,999/month — up to 50 clients
- **Scale:** ₹4,999/month — up to 100 clients
- **Enterprise:** Custom pricing for >100 clients or multi-coach companies

### 12.2 Trainer's client pricing
Trainers set their own client pricing through FitCoach. FitCoach takes no cut of trainer-to-client revenue in V1 (this is intentional — we're a tool, not a marketplace).

### 12.3 Payments to trainer
Razorpay handles client payments directly to the trainer's bank account. FitCoach charges trainers separately for the platform subscription. This keeps clean separation between platform revenue and trainer revenue.

---

## 13. Conversation flows

### 13.1 Status
| Flow | Status |
|------|--------|
| Client onboarding (including personal number disclosure) | ✅ Designed and locked |
| Daily morning check-in | ⏳ Pending design |
| Workout logging | ⏳ Pending design |
| Meal logging (3 modes) | ⏳ Pending design |
| Client progress queries | ⏳ Pending design (keyword-based scope locked) |
| Payment reminders | ⏳ Pending design |

### 13.2 Conversation design principles
- Bot waits for client response between steps; no message dumping
- Bot validates trainer-entered data with the client
- Emoji used sparingly (👋, ⚠, 🤖, ✓ only); never gratuitous
- Bot identifies itself honestly; never pretends to be the trainer
- Personal numbers and sensitive info handled with care

---

## 14. Roadmap

### 14.1 V1 (months 0–7)
Everything in section 8. Launch with 3–5 design partners using the product free for 6 months. Target by month 7: 25 paying trainers, average 30 clients each, ~₹50,000/month MRR.

### 14.2 V1.5 (months 7–12)
- Adaptive daily messaging with skip-rescheduling logic
- Per-trainer customizable check-in templates
- Trainer's reusable "coach notes" template library
- Tap-to-call voice API integration (Exotel/Knowlarity) for masked outbound calls
- Hindi language support for client-facing flows
- Audio message transcription in escalations

### 14.3 V2 (months 12–24)
- Multi-coach team management
- Corporate wellness B2B variant
- Lite product variant for gym PTs and Tier 2/3 trainers (₹299–₹999/month)
- Meta WhatsApp Business Calling API integration (once GA)
- Native mobile app for trainers (if design partner data justifies it)
- Marketplace/discovery features (trainers can be found by clients)

### 14.4 Items deferred (with rationale)
| Deferred item | Why deferred | Revisit when |
|---|---|---|
| Auto-progression algorithms | Trainers told us this would reduce their value | Never — trainer-managed progression is correct |
| Native trainer mobile app | PWA covers it; native is expensive | If 50%+ of trainers explicitly request it |
| Marketplace / trainer discovery | Conflicts with "we serve the trainer" positioning | V2 only if data shows mutual benefit |
| Client mobile app | Zero-friction WhatsApp is the entire thesis | Never |
| Video call integration | Trainers handle this with Zoom today | Only if becomes a frequent request |

---

## 15. Brand & visual design

### 15.1 Color system
*(Updated Phase 2 CP0 — reskinned from teal to charcoal + burnt orange.)*
- **Primary accent:** Burnt orange #C05C28 (escalations, badges, nav active
  state, one key CTA per screen — replaces teal #0D9488)
- **Charcoal:** #1C1C1C (sidebar background + default primary buttons)
- **Accent:** Burnt orange #C05C28 (escalations, alerts, "needs attention"
  states — replaces amber #F59E0B)
- **Surface:** #F5F4F2 (page background — replaces #FAFAF9)
- **Card:** #FFFFFF
- **Border:** #E5E3DE
- **Success:** Teal #1D9E75 (retained for positive states ONLY)
- **Text primary:** #1A1A1A
- **Text secondary:** #6B7280

### 15.2 Typography
Inter as the system font. 14–16px body, 18–24px section headers, 28–32px page titles.

### 15.3 Aesthetic
Linear / Notion style modern SaaS. Generous whitespace, subtle shadows, no clutter, no gratuitous gradients or animations. Visual hierarchy through size and weight, not color.

Orange is used sparingly — one primary CTA per screen maximum, escalation indicators, nav active state, badges. Default primary buttons are charcoal #1C1C1C. If in doubt, use charcoal not orange.

### 15.4 Voice & tone
Confident, practical, warm. Respects the trainer's expertise. Never preachy. Avoids "AI mystique" or pretending to be smarter than the user.

---

## 16. Prototype status

### 16.1 Tools used
- **Lovable.dev** — Tested, then abandoned. Generated working UI but couldn't be carried into V1 production code.
- **Claude Code** — Active. Real Next.js codebase that will become the V1 production scaffold.
- **Vercel** — Hosting the live prototype at https://fitcoach-alpha-seven.vercel.app/

### 16.2 What's working in the prototype (verified)
- Dashboard with time-aware greeting, metrics, Action Needed escalations, today's check-ins, WhatsApp connection pill in header, notifications badge
- Inbox with filter tabs and escalation cards
- Clients list with 10 sample clients
- Plan builder with multi-cycle weekly structure (workout side)
- Conversations screen with bot vs trainer message differentiation (per user confirmation)
- Settings page with proper section structure

### 16.3 Known gaps (as of 15 May 2026)
- Plan list page at `/plans` — needs visual confirmation it exists (or `/plans` goes directly to a builder)
- Nutrition tab in Plan Builder — needs visual confirmation it exists (text scrape suggests it may not)
- Send Plan workflow — the multi-step modal flow needs visual verification
- Chat-window preview of plan being sent — user reports this doesn't work yet
- Several modal-based features (tap-to-call modal, custom duration input, notifications dropdown) — text scrape can't verify

### 16.4 Recent changes (user-initiated)
- Video links moved from per-day exercise cards to the exercise library left panel (so trainers don't have to manually add to every exercise — all clients get optional video reference)
- Attempted: chat-window preview of plan delivery in the Send Plan workflow (not yet working)

---

## 17. Design partner program

### 17.1 Goals
Recruit 3–5 trainers as design partners during the V1 build phase. Use their feedback to shape product decisions and validate the value proposition before broader launch.

### 17.2 The deal
**Design partner gets:**
- Product free for 6 months at launch
- Listed as founding partner with name and photo
- Direct WhatsApp line to founder
- Real input on what gets built (decisions made with their feedback in mind)

**Design partner gives:**
- 30-minute call weekly during the 4–5 month build
- Honest feedback, including "this is bad" or "I'd never use this"
- ₹500/month after the 6 free months *if* the product earns it (no obligation otherwise)

### 17.3 Outreach channels
- Founder's existing trainer's referrals
- FITTR community
- Instagram DMs to fitness coaches with 5k–50k followers
- LinkedIn professional outreach to certified trainers (NASM, ACE)

### 17.4 First artifact
Loom video walkthrough of the prototype + live Vercel link.

---

## 18. Open questions & risks

### 18.1 Open product questions
- Does the bundle delivery model (PDFs only, no daily targeted messages) actually drive enough engagement in V1, or will compliance drop without the daily push? → Validate with design partners over months 1–3.
- Will trainers want to customize the bot's tone of voice on a per-client basis, or is one trainer-wide voice enough? → Watch for explicit requests.
- Should plan templates be shareable between trainers (community library), or kept private? → Default private; revisit if community emerges.

### 18.2 Risk register
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Meta changes WhatsApp Business API pricing significantly | Medium | High | Diversify with BSPs as backup; build cost-optimization into product DNA |
| FITTR or HealthifyMe launches competing coach-side product | Medium | High | Speed; design partner moat; deeper SMB-trainer focus they can't match |
| Solo founder bandwidth becomes the bottleneck | High | High | Use Claude Code aggressively; bring in contractor for ops once revenue ≥ ₹2L/month |
| Design partners give bad feedback that points the product wrong | Low | Medium | Recruit 3–5 not just 1; weight feedback by quality of trainer's existing business |
| Trainers churn after the 6-month free period | Medium | Medium | Build deep workflow lock-in via plan templates, client history, conversation logs |

---

## 19. Glossary

- **API number** — WhatsApp Business number connected via Meta's Cloud API (no calling capability)
- **BSP** — Business Solution Provider (third-party who proxies WhatsApp API access; we're not using one)
- **CSW** — Customer Service Window (24-hour free messaging period opened by client message)
- **CWS** — same as CSW (commonly seen typo in Meta docs)
- **Cycle** — A 4-week (default) chunk of a plan; multiple cycles make up a complete plan
- **Escalation** — A bot-detected situation requiring trainer's human judgment
- **IFCT** — Indian Food Composition Tables (nutrition database)
- **PWA** — Progressive Web App
- **V1 / V1.5 / V2** — Product versions with locked scope per section 14

---

## 20. Change log

| Date | Version | Change | Decided by |
|------|---------|--------|------------|
| 15 May 2026 | 1.0 | Initial PRD document created from accumulated decisions in chat threads | Founder + Claude |

---

*This PRD is the source of truth for FitCoach product decisions. Update via pull request to the project repo. AI-generated content suggestions go through founder review before merging.*
