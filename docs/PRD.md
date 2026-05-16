# FitCoach — Product Requirements Document

**Status:** Clickable prototype for design-partner conversations
**Owner:** Sandeep / coaching team
**Last updated:** May 2026

This is a living document. Update it whenever a feature ships, an edge case is handled, a decision is reversed, or an acceptance criterion changes. The changelog at the bottom tracks meaningful product-level shifts.

---

## 1. Product summary

FitCoach is a coaching platform for independent online fitness trainers in India. It gives a trainer a single WhatsApp Business number that handles both automated bot messages (daily check-ins, plan delivery, payment reminders) **and** the trainer's personal communication (voice notes, videos, text messages they send to specific clients).

Clients only ever use regular WhatsApp on their phone — they never log into anything.

The trainer uses this web dashboard to manage clients, build multi-week workout + nutrition plans, chat with clients, review progress and analytics, and handle escalations when the bot needs human judgment.

The dashboard is mobile-responsive — coaches use it on laptop (plan building, deep work) and on phone (quick communication, voice notes on the go).

### Killer feature

An **escalation system** where the bot autonomously detects when a situation needs human judgment (medical concerns, emotional distress, off-topic questions, compliance drops) and pulls the trainer in with full context. This makes the product feel like a "smart coaching assistant" rather than just automation.

---

## 2. Personas

- **Sandeep Kumar** — the trainer. Bengaluru-based strength & nutrition coach. 24 active clients. Uses the dashboard daily, mostly on laptop in the evening for plan building and on phone during the day for chat.
- **Priya Sharma, Karan Mehta, Anita Desai, etc.** — clients. Use WhatsApp on their phone. Have no app to install.

---

## 3. Visual design

- **Primary** — teal `#0D9488`
- **Accent** — warm amber `#F59E0B` (reserved for escalations + health warnings only)
- **Background** — warm off-white `#FAFAF9`
- **Font** — Inter
- **Icons** — lucide-react
- **Currency** — all values in Indian Rupees (₹)
- **Phone format** — `+91 XXXXX XXXXX`
- **Names** — Indian throughout
- **Food references** — Indian (dal, roti, idly, chutney, jeera rice, etc.)

---

## 4. Information architecture

Sidebar nav (in order):
1. Dashboard (`/`)
2. Clients (`/clients` → `/clients/[id]`)
3. Conversations (`/conversations`) — badge: unread count
4. Inbox (`/inbox`) — red badge: active escalation count
5. Plans (`/plans` → `/plans/[id]/edit`)
6. Payments (`/payments`)
7. Settings (`/settings`)

Header (all screens):
- FitCoach logo (left)
- Search bar — placeholder `"Search clients, plans, conversations..."`
- Notifications bell (red badge with unread count, dropdown)
- WhatsApp connection pill — `● +91 98765 12345 · Connected`, tooltip
- Coach avatar (Sandeep Kumar) — links to Settings

---

## 5. Features

### 5.1 Dashboard

**Purpose**
Surface what the trainer should act on right now. Most important content first.

**Layout (top to bottom)**
1. Greeting line ("Good afternoon, Sandeep") + today's date pill
2. Four KPI cards: Active clients (24), Plans expiring this week (3), Revenue this month (₹48,000), Avg compliance (78%)
3. **Action needed** section — only renders if there are active escalations
4. **Today's check-ins** feed — 6 client cards with status + primary action

**Action needed**
- Wrapped in an amber-bordered container (`border-[#F59E0B] bg-[#FFFBEB]`) with a "🟡 Needs your attention" pill above the section header
- Each escalation card: client avatar + name + reason badge + quoted client message (in an amber-tinted inset) + `Open conversation` button + `Tap to call` button
- Each card has an amber left-border accent (`border-l-4 border-l-[#F59E0B]`)
- `View all` link to `/inbox`

**Edge cases**
- If zero active escalations: section is hidden entirely (don't render an empty container)
- Escalations marked resolved decrement the count instantly via `resolvedEscalations` in AppContext

**Acceptance criteria**
- [x] Page renders 200, no console errors
- [x] Hidden when zero escalations
- [x] Open conversation routes to `/conversations?c=<clientId>`
- [x] Tap to call opens TapToCallModal with the right client
- [x] Action-needed section is visually unmissable (amber container + left border + pill)

---

### 5.2 Clients list

**Purpose**
Manage the trainer's roster. 10 demo clients with realistic Indian names and varied compliance/status.

**Columns**
- Client (avatar + name + phone)
- Plan (reads through `getEffectivePlanName(c.id, c.plan)` so reassignments reflect)
- Start date (hidden on mobile)
- Compliance (bar + percentage; colored emerald ≥80, amber ≥60, red <60)
- Weight (start → current, hidden below lg)
- Status (Active / Paused / Expired, colored pill)
- 3-dot row menu

**Row actions** (3-dot menu)
- Assign plan → opens AssignPlanModal
- View profile → navigates to `/clients/[id]`
- Pause client → toast "<Name> paused — bot won't send check-ins"

**Top bar**
- Search input (filters by name client-side)
- Bulk import — toast stub
- Add client — opens AddClientModal

**Row click**
Navigates to `/clients/[id]`. Stop propagation on the 3-dot menu so clicking it doesn't trigger row navigation.

**Edge cases**
- Search shows "No clients match" empty state
- Paused/Expired clients still show in the list (filterable by status would be V2)

**Acceptance criteria**
- [x] All 10 clients render with realistic Indian names
- [x] Compliance bar colors correctly at the boundary values
- [x] Clicking 3-dot doesn't navigate
- [x] Plan column reflects assignment overrides

---

### 5.3 Client detail page (`/clients/[id]`)

**Purpose**
Single-client deep dive. Trainer takes action and reviews progress.

**Top section**
- Large avatar + name + plan badge ("Week 3 of 12-Week Transformation") — plan name resolves via `getEffectivePlanName`
- Goal text below (e.g., "Lose 5 kg by March 2026")
- Phone + joined N weeks ago

**Action bar** (icons + labels)
- Send voice note → VoiceRecorderModal
- Send photo/video → toast stub
- Open conversation → `/conversations?c=<id>`
- Adjust plan → `/plans`
- Pause client → toast
- Tap to call → TapToCallModal

**Tabs**
- Overview (default)
- Workouts (stub)
- Nutrition (stub)
- Progress (stub)
- Chat (stub with "Open in Conversations" CTA)

**Overview tab**
- Weight progress chart (recharts line chart, 8 weekly data points for Priya)
- Two compliance cards side by side (Workout %, Nutrition %)
- Recent activity feed (5 events with icons + timestamps)

**Right sidebar**
- Quick stats (current weight, target, joined, plan ends in N weeks)
- **Health profile** card — reads from client intake fields
  - Allergies / Injuries / Medical conditions / Notes
  - Amber "⚠ Review before planning" pill at the top when injuries or medical conditions are present (not "None", not empty)
  - Empty fields are filtered out of the rendered list
- Recent escalations history (static demo content)

**Priya's pre-filled intake** (sample for design partners)
- Allergies: None
- Injuries: "Lower back strain (2 years back). Right shoulder discomfort occasionally."
- Medical: None
- Notes: "Prefers morning workouts. Travels for work occasionally — needs hotel gym backup plans."

**Edge cases**
- If client id is unknown → calls `notFound()` (Next.js 404)
- "None" / empty injuries don't trigger the amber warning pill
- All filled fields are case-insensitive against "none" for the warning trigger

**Acceptance criteria**
- [x] Plan badge reflects most recent assignment
- [x] Weight chart renders without SSR warnings affecting client-side display
- [x] Health profile shows amber pill only for Priya (others have empty injuries/medical)

---

### 5.4 Conversations (`/conversations?c=<id>`)

**Purpose**
The shared inbox. Bot, trainer, and client messages live in the same thread, visually distinguished.

**Layout**
Two-pane on desktop (list left, thread right), single-pane on mobile (list, tap → thread; back button returns).

**Left pane (conversation list)**
- Search input
- Row per conversation: avatar + name + preview + timestamp + bot icon (if last message was from bot) + unread count badge
- Sorted: unread first, then by recency
- Default selected: Priya Sharma (or whatever `?c=<id>` says)

**Right pane (thread)**
- Top bar: avatar + name + "last active Xh ago" (never "online" — WhatsApp Business doesn't expose presence) + video call icon (greyed, tooltip explains) + profile link + more menu
- Scrollable message list (auto-scrolls to bottom on conversation change and after sending)
- Composer: text input + attach + voice mic + camera + send. Helper text below: "Messages send via WhatsApp from your business number"

**Message bubble styles**
- **Bot** — `bg-stone-100`, left-aligned, `🤖 Bot` label above timestamp
- **Trainer** — `bg-teal-600 text-white`, right-aligned, `✓ From Sandeep` label, `(via FitCoach)` italic next to timestamp
- **Client** — white bubble with subtle border, left-aligned
- **System** — centered italic grey pill (call logs, "Plan delivered · 8 weeks ago", date separators like "Today")
- **Document** — PDF card inside a bubble: layered icon (page + workout/nutrition glyph at bottom-right), filename, "Workout · PDF · N pages · size", circular download button. Colors flip for trainer (teal on translucent) vs client (white on neutral).
- **Voice note** — circular play button + animated waveform bars + duration ("0:34")
- **Image** — placeholder food gradient with caption

**Right context panel (≥xl)**
- Avatar + name + goal
- Quick stats (current weight, target, joined Nw ago, plan ends in Nw)
- Tap to call button
- View full profile link

**Composer prefill flow**
When the trainer clicks "Use this" on an Inbox suggested reply, `composerPrefill` is set in AppContext to `{ clientId, text }`. Navigating to `/conversations?c=<clientId>` triggers `consumeComposerPrefill(clientId)` on mount, which populates the draft input and clears the prefill.

**Priya thread shows the onboarding moment**
At the top of Priya's thread:
1. System pill: "📦 Plan delivered · 8 weeks ago"
2. Trainer text welcome message
3. Trainer document: Workout plan PDF
4. Trainer document: Nutrition plan PDF
5. Client text reply
6. System pill: "Today"
7. (live thread continues)

**Tap-to-call logs**
When trainer uses Tap to call and copies a number, a system message gets appended to the conversation thread: `"📞 Sandeep called Priya — 2:14 PM"`. Centered italic grey.

**Edge cases**
- `?c=<id>` of unknown client falls back to the first conversation (Priya)
- Sending an empty message is a no-op (button disabled)
- Voice mic icon opens VoiceRecorderModal targeting the active client
- Mobile single-pane: tapping a list row hides the list; back arrow brings it back

**Acceptance criteria**
- [x] Bot/trainer/client/system/document/voice/image bubbles render distinctly
- [x] "(via FitCoach)" suffix on every trainer message timestamp
- [x] No client shows online dot (uses `lastSeen` instead)
- [x] Auto-scroll to bottom on conversation change
- [x] Plan-delivery PDFs visible in Priya's thread
- [x] Inbox `Use this` populates the composer

---

### 5.5 Inbox (`/inbox`)

**Purpose**
The trainer's queue of escalations from the bot. The single place that connects bot autonomy with human judgment.

**Filter tabs (with live counts)**
- All
- Medical
- Off-topic question
- Compliance
- Other

**Escalation card structure** (per escalation)
- Avatar + client name + "🟡 Escalated by bot" pill + time ago
- Reason badge with amber dot ("Medical concern detected" / "Out-of-scope question")
- Client message quoted in amber-tinted inset
- Collapsible **"Why this was escalated"** — explains the bot's heuristic
- Action buttons row:
  - Open conversation (primary teal)
  - Tap to call
  - Send voice note
  - Mark resolved (text-only, right-aligned)
- Collapsible **"Suggested response(s)"** — AI-generated reply options. Each reply has a `Use this` button that copies into the conversation composer via `composerPrefill` and navigates.

**Default expansion**
- **First card** in the visible list has both "Why" and "Suggested response" sections expanded by default — demonstrates the full UX
- Subsequent cards collapsed

**Resolved escalations**
- Removed from the visible list
- Decrement the Inbox badge in the sidebar
- "All caught up" empty state when none remain (emerald checkmark, message)

**Anita's escalation (the demo medical case)**
- Reason: "Medical concern detected"
- Quote: "my left knee has been hurting since yesterday's workout, should I skip leg day?"
- Why: "The bot detected medical keywords (pain, hurt, injury) in the client's message. Medical concerns require professional judgment, so the bot deferred to you instead of guessing."
- Suggested replies (2): empathetic skip + ask-for-detail | suggest-quick-call

**Karan's escalation (the off-topic case)**
- Reason: "Out-of-scope question"
- Quote: "is creatine safe to take with my BP medication?"
- Why: "Bot detected a question about supplement-medication interaction, which requires professional judgment."
- Suggested replies (2): ask-which-meds | wait-on-creatine-research-tonight

**Edge cases**
- Filter tabs use live `counts` so they update as escalations are resolved
- Resolved escalations live in `AppContext.resolvedEscalations` (an array of ids) so they don't come back on navigation

**Acceptance criteria**
- [x] First card expanded by default
- [x] Use this writes to `composerPrefill` and routes to conversations
- [x] Mark resolved decreases the sidebar badge immediately
- [x] Empty state visible when all are resolved

---

### 5.6 Plans (list) (`/plans`)

**Purpose**
The trainer's library of workout + nutrition templates and one-off custom plans.

**Layout**
- Header: "Plans" title, "+ New plan" button (teal)
- Filter tabs: Templates / Custom plans (with live counts)
- 3-column grid of plan cards (1-column on mobile)

**Plan card**
- Icon + plan name
- Duration: "N weeks · K cycle(s)" — fully dynamic from plan data
- Optional description (line-clamped 2 lines)
- Footer: clients count (`Users` icon) + last edited
- Edit button + 3-dot menu (Duplicate / Archive / Delete — all toast stubs)

**Sample templates (seed)**
- 12-Week Transformation (id `p-12wt`) — 5 clients
- Strength Foundations 8-week — 2 clients
- Fat Loss + Toning 12-week — 1 client
- Beginner Hypertrophy 16-week — 1 client
- Postnatal Recovery 8-week — 1 client
- Athlete Performance 12-week — 2 clients

**+ New plan flow**
Opens NewPlanModal with empty fields (default to "saved as template").

**Edge cases**
- Empty filter tab (e.g., no custom plans) shows "No custom plans yet" empty state
- New plans appear at the top of the grid (most recent first)

**Acceptance criteria**
- [x] All 6 templates render
- [x] Duration text uses live plan data, never hardcoded
- [x] Filter tabs update counts as plans are added

---

### 5.7 Plan builder (`/plans/[id]/edit`)

**Purpose**
The most important screen for the trainer's work. Build out the workout grid + nutrition plan, then send to clients.

**Header**
- Back link to `/plans`
- Editable plan name (live save on blur with toast)
- "Save plan" button (toast stub)
- **"Send plan to client"** button (teal) — opens SendPlanModal

**Top tabs**
1. **Workouts** (default)
2. **Nutrition**

#### Workouts tab

**Cycle navigation**
- Cycle 1 button (active, teal background)
- Cycle 2+ buttons locked with `<Lock>` icon, tooltip: "Plan when Cycle 1 ends — uses logs to inform next cycle"
- Number of locked cycles derived from `plan.cycles`

**Week tabs**
- Week 1..N where N = `plan.cycleLengthWeeks` (e.g., 4 weeks for default cycles, but adapts to custom cycle length)

**Layout** — `[260px exercise library][rest = 7-day grid]`

**Exercise library (left panel)**
- Search input + category chips (All / Push / Pull / Legs / Core / Cardio)
- 15 default exercises
- Each row:
  - Name + category label
  - "Add to day" button (`<Plus>`) — opens dropdown of Mon..Sun
  - **Video affordance** below the name:
    - If `libraryVideos[name]` exists: red `▶ Watch form` button + subtle pencil `<Pencil>` icon (opacity-60 → 100 on hover, tooltip "Edit video link")
    - If empty: dashed-border `+ Add video link` button
  - Pencil/Add buttons open VideoLinkModal

**7-day grid (right panel)**
- 7 columns (Mon..Sun), responsive (1 column on small, 2-7 as space allows)
- Each day column:
  - Header: day key (Mon, Tue, ...) + day label (Monday, Tuesday, ...) + "Rest" button + "+" add button
  - Exercise cards stacked vertically
  - "Duplicate" link at bottom (toast stub)

**Exercise card in grid (read-only re: videos)**
- Drag handle + name + detail ("4×8 @ 80kg") + optional notes line (amber, italic)
- If library has a video for this exercise name: red `▶ Watch form` button
- Hover reveals notes (`<StickyNote>`) + remove (`<Trash2>`) icons
- No URL editing here — videos are managed only from the library

**Rest day card**
- Centered italic "Rest day" + "Recovery" + "+ Add exercise" link to swap it out

**Empty day**
- "Empty" text + "+ Add exercise" inline link

#### Nutrition tab

See [Nutrition planning](#58-nutrition-planning) below.

**Edge cases**
- Plan id `p-12wt` seeds Workouts grid with content (squat/bench/etc. for demo) and Nutrition tab with pre-filled idly + chutney + eggs Meal 1
- All other plan ids (existing templates and freshly-created) start with empty workouts grid AND empty nutrition tab
- Unknown plan id → "Plan not found" view with link back to `/plans`

**Acceptance criteria**
- [x] Workouts tab default; switch to Nutrition without state loss
- [x] Locked Cycle 2+ buttons show tooltip
- [x] Library video updates apply to every day-card instance via libraryVideos lookup
- [x] Demo plan vs empty plan correctly seeded based on `params.id === "p-12wt"`

---

### 5.8 Nutrition planning

**Purpose**
Let trainers design daily macros + meals + alternatives + diet rules + hunger substitutions.

**Sections**

1. **Daily macro targets** — 4 cards (Calories, Protein, Carbs, Fats), each editable number input with unit suffix and label below
   - Empty plans: each card shows placeholder (e.g., "e.g., 2000", "e.g., 130", "e.g., 250", "e.g., 60") when value is 0
   - Demo plan: 2100 / 130 / 250 / 60

2. **Meals section** — 6 collapsible meal cards by default:
   - Pre-workout
   - Post-workout
   - Meal 1 — Breakfast
   - Meal 2 — Lunch
   - Snacks
   - Meal 3 — Dinner
   - "+ Add meal" button at the top
   - Auto-expansion: meals with content expand on initial render; empty meals stay collapsed (show small "Empty" italic label)

3. **Meal card (expanded)**
   - Editable meal name input
   - Primary option block:
     - Editable variant label ("Primary option" by default)
     - Food table: name, qty, cal, C, F, P, fiber, delete (hover-revealed)
     - Empty state: "Add food items for this meal" inside the table
     - Meal total row always renders, sums foods in primary
     - "+ Add food item" button
   - "+ Add alternative" button → creates "Alternative 1 (OR)" block with the same structure (incrementing label for additional alts)
   - Per-meal notes field with placeholder "e.g., 30 min before workout"

4. **Coach notes** — full-width textarea
   - Empty plans: placeholder "Add your diet rules and guidelines for this plan (e.g., oil limits, restaurant rules, alcohol guidelines, foods to avoid)"
   - Demo plan pre-fill: the oil/ghee/vegetables/hunger rules

5. **Hunger substitutions** — amber-tinted box
   - Each item is an inline-editable input with hover delete
   - "+ Add substitution" button
   - When empty: helper line above the button "Add items your client can have when hungry between meals"
   - Demo plan pre-fill: protein bar / nuts / fruit / buttermilk

**Demo plan pre-fill (p-12wt only)**

Meal 1 — Breakfast:
- Primary (5 foods): Idly 2pc + Chutney 2tbsp + 2 whole eggs + 2 egg whites + Fish oil cap. Total ~444 cal / 27P / 35C / 23F / 4 fiber
- Alternative 1 (OR): 50g oats + 1 tbsp peanut butter + 1 scoop whey. Total ~453 cal / 37P / 46C / 15F / 8 fiber

Meals 2 through 6 stay empty on the demo plan (deliberate — demonstrates partial-fill UX).

**Edge cases**
- All inputs (food name, qty, macros) are inline-editable; numeric fields use `type="number"` with min=0
- Removing all foods from a variant still shows the placeholder and Meal total row reads 0
- Demo content is sample, fully editable, and edits persist for the session

**Acceptance criteria**
- [x] New plans land with all macros blank, all meals collapsed/empty, coach notes empty, hunger subs empty
- [x] Templates other than p-12wt also start empty
- [x] Meal total auto-recalculates as foods change
- [x] Adding an alternative spawns "Alternative N (OR)" with empty rows
- [x] Hunger subs add/edit/delete works

---

### 5.9 Send plan workflow

**Purpose**
The most important workflow in the app — actually delivering a plan to clients via WhatsApp.

**Trigger** — "Send plan to client" button on plan builder header. Opens 4-step modal flow.

**Step 1: Select clients**
- Title: "Send <Plan name> to client(s)"
- Search input + scrollable client list with checkboxes
- Clients already on this plan have a teal-filled checkbox and are disabled
- Footer: "Plan duration: N weeks" (from plan data) + start date picker (defaults to next Monday, computed dynamically)
- Buttons: "Cancel" + "Preview & send to N" (disabled when zero selected)

**Step 2: Preview**
Modal widens to `max-w-4xl`. Two-pane:

Left summary panel:
- Plan name
- Sending to: avatar + name per selected client
- Duration + start date
- "What client receives" checklist:
  - ✓ Workout plan PDF (week 1 + full)
  - ✓ Nutrition plan PDF
  - 🎬 Exercise video links
  - 💬 Welcome message
  - ✨ Onboarding instructions
- Editable welcome message textarea (pre-filled with `Hi <FirstName>, here's your custom plan. Let's get started! Reply with any questions.`)

Right PDF mockup panel:
- Styled white "PDF page" with FitCoach header (logo + Coach: Sandeep)
- Plan name + selected client names + duration + start date
- Daily targets grid (4 macro cards, pulled from `defaultNutritionPlan`)
- Sample meal — Breakfast (top 4 foods from primary)
- Week 1 · Monday workout sample (Squat / Bench Press / Pull-ups)
- Footer: "Generated by FitCoach · WhatsApp delivery"

Bottom: "Back" + "Send via WhatsApp" buttons.

**Step 3: Sending**
- Modal contracts back to `max-w-lg`
- Centered spinner + "Sending to N clients..." + pulse progress bar
- Backdrop click disabled during this state (can't escape mid-send)
- Auto-advances to step 4 after ~2.2s

**Step 4: Success**
- Emerald checkmark
- "Plan sent successfully to N client(s)"
- Per-client delivered list: "✓ Priya Sharma — Delivered to WhatsApp · Just now"
- "What happens next" panel: 3 messages they'll receive + how the trainer sees activity in Conversations
- Buttons: "Done" + "Open Conversations" (routes to `/conversations`)

**Plan assignment commits only on transition into step 4** — `assignClientsToPlan(planId, clientIds)` runs after the animated send, not on click of "Send via WhatsApp". This way a user who closes mid-animation hasn't actually committed anything.

**Edge cases**
- Modal close (X / backdrop) resets all step state for next open
- Already-assigned clients can't be deselected (they're disabled with "Already on this plan" subtext)
- Start date defaults to the next Monday (if today is Monday, that's 7 days out)
- The plan's `clientIds` and the per-client `clientPlanOverrides` both update on success

**Acceptance criteria**
- [x] All 4 steps render cleanly with no overlap
- [x] Welcome message editable
- [x] PDF mockup displays plan name, client names, macros, meal sample, workout sample
- [x] Send animation runs ~2.2s
- [x] Success state shows per-client delivery confirmation
- [x] Open Conversations routes correctly

---

### 5.10 New plan creation

**Purpose**
Create a new plan template or one-off custom plan.

**Trigger** — "+ New plan" button on `/plans`, OR "+ Create custom plan for <client>" inside AssignPlanModal.

**Fields**
- Plan name (text)
- Duration dropdown: 4 / 8 / 12 / 16 / **Custom**
  - Custom selected → reveals number input "Custom duration (weeks)", placeholder "e.g., 6", validation min=1, max=52
- Cycle length dropdown: 2 / 4 (default) / 6 / 8 / **Custom**
  - Custom selected → reveals number input "Custom cycle length (weeks)", placeholder "e.g., 3", validation min=1, max=duration
- Cross-validation: cycle length must be ≤ duration. If violated (including preset cycle in small custom duration), error renders under cycle field
- Description textarea (optional)
- **Save as reusable template** checkbox
  - Default: checked (template)
  - Default when opened via "Create custom plan for <client>": unchecked (custom)
- Helper text under checkbox swaps based on state
- Live summary line below inputs: "N weeks · K cycles of M weeks"

**On submit**
- Disabled until valid
- Computes `cycles = max(1, ceil(duration / cycleLength))`
- Creates a new Plan with type = template or custom based on checkbox
- If opened for a custom client: also calls `assignClientsToPlan(planId, [clientId])`
- Toast: "Template plan created" / "One-off plan created" / "Custom plan created for <Name>"
- Closes modal and navigates to `/plans/<newId>/edit`

**Edge cases**
- Empty plan name → "Untitled plan"
- Custom duration empty → inline error "Please enter the number of weeks", Create disabled
- Custom duration out of range → "Duration must be between 1 and 52 weeks"
- Custom cycle empty → "Please enter the cycle length in weeks"
- Custom cycle > duration → "Cycle length can't exceed total duration (N weeks)"
- All custom values propagate to all displays (plan builder header, plan list cards, send modal duration, etc.) — no hardcoded fallbacks

**Acceptance criteria**
- [x] Duration custom input appears + validates
- [x] Cycle length custom input appears + validates
- [x] Cross-validation cycle ≤ duration
- [x] Save-as-template defaults flip based on invocation context
- [x] Custom values reflect everywhere downstream

---

### 5.11 Add client

**Purpose**
Capture what a trainer actually asks at intake — not just name + phone.

**Trigger** — "+ Add client" button on `/clients` (or in the future, from the dashboard).

**Sections** (scrollable modal)

1. **Basic info** — Name *, Phone * (`+91` prefix glued), Email (optional), Age, Gender (Male/Female/Prefer not to say)
2. **Body & goals** — Height (cm), Current weight (kg), Target weight (kg), Primary goal (Weight loss / Muscle gain / General fitness / Sport-specific / Postnatal recovery / Other)
3. **Preferences** — Workout (Gym/Home/Hybrid), Diet (Vegetarian/Non-vegetarian/Eggetarian/Vegan), Whey protein use (Yes/No/Not sure)
4. **Health** — Allergies, Injuries (placeholder: "List any past injuries with approximate timeframes (e.g., 'ACL strain on left knee 4 years back')"), Medical conditions (placeholder: "Diabetes, BP, thyroid, PCOS, etc."), Additional notes

**Validation**
- Name and Phone required
- All other fields optional

**On submit**
- Toast: "<Name> added — onboarding message queued"
- Modal closes and resets

**Edge cases**
- Missing name or phone → toast "Name and phone are required", form stays open

**Acceptance criteria**
- [x] All 4 sections render with section icons + headings
- [x] Required validation enforces name + phone
- [x] Modal is scrollable; section icons visible at all scroll positions

---

### 5.12 Voice notes

**Purpose**
Trainer's most engaging communication channel. 3-stage record-and-send modal.

**States**
1. **Initial** — large mic button, "Hold to record" hint, "or tap to start"
2. **Recording** — pulsing red square button, animated waveform bars, timer counting up (mm:ss), "Release to stop"
3. **Recorded** — playback bar with play/pause + scrub progress + duration, action buttons

**Actions in Recorded state**
- Re-record (rotation icon) — back to Initial, resets timer
- Cancel — closes modal
- Send — toast "Voice note sent to <Name> via WhatsApp" (success), closes modal

**Triggers**
- Conversations composer mic button
- Client detail action bar "Send voice note"
- Inbox escalation card "Send voice note"

**Edge cases**
- Modal closed mid-recording: state resets on reopen
- "Hold to record" with mousedown/mouseup OR onClick to start; click-out doesn't auto-stop (deliberate — allows playback)

**Acceptance criteria**
- [x] All 3 stages render
- [x] Send toast shows correct client name
- [x] Reopen always starts in Initial state

---

### 5.13 Tap to call

**Purpose**
Make it easy for the trainer to switch from text/voice to a real phone call when needed. Important because the platform doesn't actually call clients — the trainer uses their personal phone, and the client sees the trainer's real number.

**Trigger** — Tap to call buttons across the app (dashboard escalations, inbox cards, conversations side panel, client detail action bar).

**Modal**
- Title: "Call <Client name>"
- Phone number displayed large with `tel:` link (taps open the phone dialer on mobile)
- "Copy" button next to the number
- Disclaimer: "📞 Call from your personal phone — clients receive your real number, not the FitCoach platform number. After the call, the conversation continues here."
- Buttons: "Open conversation" (routes) + "Close"

**Behavior on copy**
- Writes phone to clipboard
- Toast: "Number copied"
- Drops a system message into that client's conversation thread: "📞 Sandeep called <Name> — H:MM AM/PM" (current time)
- Modal stays open (user might want to click Open conversation next)

**Edge cases**
- Clipboard write failure is silently ignored (still shows toast + logs the call)
- Reopening the modal for a different client clears stale state

**Acceptance criteria**
- [x] Number formatted as +91 XXXXX XXXXX
- [x] Copy logs a system message into the conversation
- [x] Open conversation routes to the correct client's thread

---

### 5.14 Exercise videos (form videos)

**Purpose**
Let trainers attach a form-demo YouTube video to each exercise in the library so the video flows through to every plan and every client.

**Library is source of truth**
Video URLs are keyed by exercise name in `libraryVideos: Record<string, string>` in AppContext. Setting Squat's video applies to every Monday/Wednesday/Friday Squat in every plan. State persists across navigation within the session.

**Library row UI**
- If video exists: red `▶ Watch form` button + subtle pencil edit icon
- If no video: dashed `+ Add video link` button

**VideoLinkModal**
- Title: "Add video link" or "Edit video link"
- Input with link icon, placeholder "Paste YouTube URL"
- Validation: must contain `youtube.com` or `youtu.be`
- Inline `Please enter a valid YouTube URL` error when invalid
- Green `Looks good` confirmation when valid
- Helper line before interaction: "Accepts youtube.com or youtu.be links. Other platforms not yet supported."
- "Save" button (disabled when empty)
- "Remove video" red button (only when editing existing)
- "Cancel"
- Toasts: "Video link updated" / "Video link removed"

**Day-card render**
- Read-only: shows `▶ Watch form` button only if the library has a URL for that exercise name
- No URL editing on day cards

**Watch experience** — ExerciseVideoModal
- 16:9 black panel with embedded YouTube iframe
- "Open on YouTube" fallback link at the bottom

**Edge cases**
- Exercise name not in library (custom name like "New exercise") → no library video lookup, no Watch button on day card
- Library starts empty by default — no pre-populated URLs
- Vimeo / Loom / other platforms rejected by validation

**Acceptance criteria**
- [x] No default URLs anywhere
- [x] Adding a video on the library shows up on every day card using that exercise
- [x] Modal validates YouTube URLs
- [x] Remove returns the exercise to no-video state
- [x] State persists across plan navigation within session

---

### 5.15 Plan PDFs in chat

**Purpose**
Show the design partner what the client actually sees after Send Plan: PDFs delivered as WhatsApp documents.

**Implementation**
- `MessageKind: "document"` with optional fields: `docName`, `docSize`, `docKind` ("workout" | "nutrition" | "other"), `docPages`
- Document bubble renders a PDF card inside the standard message bubble: layered icon (page outline + workout/nutrition glyph), filename, metadata line ("Workout · PDF · N pages · size"), circular download button. Colors flip for trainer/client.

**Priya's onboarding moment (top of her thread)**
1. System: "📦 Plan delivered · 8 weeks ago"
2. Trainer text welcome message
3. Trainer document: "Priya — 12-Week Transformation (Workout).pdf · Workout · PDF · 9 pages · 234 KB"
4. Trainer document: "Priya — Nutrition Plan.pdf · Nutrition · PDF · 4 pages · 187 KB"
5. Client text reply
6. System: "Today"
7. (live thread continues)

**Acceptance criteria**
- [x] Document bubbles render distinctly from text/voice/image
- [x] Workout glyph (dumbbell) on workout docs, Apple on nutrition
- [x] Visible in Priya's thread

---

### 5.16 Notifications

**Purpose**
Centralized top-bar dropdown that aggregates escalations + activity + payment events.

**Bell icon**
- Red rounded badge with unread count

**Dropdown** (`360px` wide)
- "Notifications" header + unread count
- Scrollable list:
  - 🟡 Anita Desai needs attention — mentioned knee pain (23 min ago) → /inbox
  - 🟡 Karan Mehta asked about supplements (1h ago) → /inbox
  - ✅ Priya Sharma logged her workout (12 min ago) → /conversations?c=priya
  - 💰 Payment received from Neha Singh — ₹2,000 (3h ago) → /payments
  - ⚠️ Rohan Kapoor missed morning check-in (2h ago) → /conversations?c=rohan
- "Mark all as read" link at bottom
- Each notification routes to the relevant screen on click and marks as read

**Edge cases**
- Mark all as read zeros the badge without removing notifications
- Read items render dimmed in the dropdown
- Click-outside closes the dropdown

**Acceptance criteria**
- [x] Badge count is accurate
- [x] Each notification routes correctly
- [x] Marking one read updates the badge

---

### 5.17 WhatsApp connection status

**Purpose**
Constant assurance that the platform is wired up and ready to send.

**Header pill** (≥md)
- Green pulse dot + `+91 98765 12345 · Connected`
- Tooltip: "Your platform WhatsApp Business number. Manage in Settings."

**Edge cases**
- Hidden on mobile (sm) to preserve space — the user can find it in Settings anyway

---

### 5.18 Payments (stub)

**Purpose**
Track payments, send links, manage renewals.

**Top KPIs**
- Received this month (sum of paid)
- Pending (sum of pending)
- Active subscriptions (active client count)

**Transactions table**
- 8 demo rows mixing Paid and Pending
- Pending rows show "Send link" button → toast stub

**Acceptance criteria**
- [x] Renders ₹ in `en-IN` format
- [x] Pending rows show send link CTA

---

### 5.19 Settings (stub)

**Purpose**
Manage trainer profile, WhatsApp number, bot behavior, notifications, billing, privacy.

**Layout**
- Profile card (avatar + name + role)
- 6 section rows: Profile, WhatsApp number, Bot behavior, Notifications, Billing & payouts, Privacy & security
- Each row → toast stub for V1

---

## 6. Cross-cutting concerns

### 6.1 Routing and state hydration
- All screens are client components; query params hydrate via `useSearchParams()` (requires Suspense boundary on the route)
- `useParams<{ id: string }>()` for dynamic segments
- `?c=<clientId>` is the convention for routing into Conversations for a specific client

### 6.2 Mobile responsiveness
- Sidebar collapses behind a hamburger on `<lg`
- Conversations switches from two-pane to single-pane on `<md` (list → tap → thread; back button)
- Header search collapses on `<sm`
- WhatsApp pill hides on `<md`
- Top action bar wraps on `<md`

### 6.3 Toast notifications
- `showToast(text, "default" | "success")`
- Auto-dismiss ~2.8s
- Used for confirmations, not for purely-navigational actions
- Bottom-center, slide-up animation

### 6.4 Accessibility
- Buttons have `aria-label` where icon-only
- Focus rings on inputs (teal ring `focus:ring-teal-100`)
- Form fields have `<label>` elements (not just placeholders)
- Modal close on backdrop click + X button + Escape would be V2

### 6.5 Performance
- No code splitting needed at prototype scale
- Recharts renders client-side; the SSR width/height warning is benign
- Tailwind v4 with @import is the standard pattern; no PostCSS config drift

---

## 7. Out of scope (V1)

These are deliberate omissions for the prototype phase.

- Real authentication / login
- Real backend / database / persistence beyond the session
- Real WhatsApp Business API integration
- Real PDF generation
- Real payment gateway
- Real call routing (Tap to call is metadata-only)
- Real voice recording (the modal is animated state, not WebRTC)
- Non-YouTube video platforms (Vimeo, Loom, etc.)
- Online presence indicators (WhatsApp Business doesn't expose them — never add a green dot)
- Multi-coach / team accounts
- Internationalization (Indian English only)
- Dark mode
- Drag-and-drop reordering of exercises (cards have grip handles but DnD is V2)
- Plan history / version control
- Client mobile app (clients use WhatsApp natively)

---

## 8. Changelog

Each meaningful product change goes here. Newest at the top.

### 2026-05
- **Editable video links in library** — VideoLinkModal supports add/edit/remove with YouTube validation. `libraryVideos` lifted to AppContext for cross-navigation persistence. Pencil edit icon on library rows next to Watch form button.
- **Empty nutrition tab by default** — only `p-12wt` gets the demo idly+chutney pre-fill. New plans and other templates start with empty macros, empty meals, empty coach notes, empty hunger subs (with placeholder text and helper lines).
- **Move video URL to library** — videos now belong to the exercise library row, not per-day-card instances. One video applies everywhere that exercise appears.
- **Plan PDFs visible in Priya's chat** — added document message kind, prepended Priya's thread with the onboarding moment (system pill → welcome text → workout PDF → nutrition PDF → client reply → "Today" separator → live thread).
- **Remove default exercise videos** — library starts empty; trainers add their own form videos per exercise.
- **Nutrition tab + Send Plan workflow + expanded intake + Health profile + Exercise videos** — major feature batch. Workouts/Nutrition tabs in plan builder, macros + meals + alternatives + coach notes + hunger subs in Nutrition tab. SendPlanModal as 4-step modal with PDF preview, animated send, success state. AddClientModal with 4 sections. HealthProfile on client detail with amber warning pill.
- **Fix custom duration flow** — Custom in NewPlanModal Duration / Cycle length dropdowns now reveals real number inputs with validation. Bug fix: custom durations were falling back to 12 weeks. Added `clientPlanOverrides` so post-assignment, the client's plan name shows everywhere.
- **Big fix batch** — Plan list page + Send-plan modal (originally "Assign to client"), header polish (search + bell badge + WhatsApp connection pill), Action Needed amber prominence, Tap-to-Call modal redesign with Open conversation, Inbox default-expanded + Use this button, Plan builder polish (rest day, cycle tooltip), Conversations refinements (last active text, 🤖 Bot, voice waveform, (via FitCoach) tag).

### 2026-05 (initial)
- **Initial prototype** — all 6 screens scaffolded: Dashboard, Clients (list + detail), Conversations, Inbox, Plans (builder), Payments, Settings. Sidebar + Header layout. Voice note, Tap-to-call, Notifications dropdown modals. 10 clients + 2 escalations + 6 today's check-ins seeded.

---

## 9. How to update this document

Whenever you:
- Add a feature → add a `### N.M Feature name` section with Purpose, Layout, Edge cases, Acceptance criteria.
- Change a behavior → revise the relevant section, add an entry to the changelog.
- Make a "don't do this" decision → record it in the section's edge cases AND in `CLAUDE.md` under "Things to NOT do".
- Remove or stub a feature → mark it in section 7 (Out of scope) or update the changelog with the removal date.

**Acceptance criteria checkboxes** use `- [x]` when met and `- [ ]` when not (yet). They serve as a living test plan for design-partner demos.
