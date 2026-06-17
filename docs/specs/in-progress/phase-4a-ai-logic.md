# Phase 4A — AI Logic (Anthropic API)

**Status:** In progress — buildable now
**Prompt library:** [`../../prompts/phase-4a-prompts.md`](../../prompts/phase-4a-prompts.md)

> **Phase 4A = AI logic needing only the Anthropic API (no WhatsApp).**
> Phase 4B (wiring AI to live WhatsApp, daily check-in scheduler,
> workout-log parsing) is DEFERRED until Phase 3 goes live.

**Prerequisite:** `ANTHROPIC_API_KEY` in `.env.local` with credit loaded.
Get from console.anthropic.com. Never commit. Keep separate from the
Claude Code subscription key — this is the product's runtime key.

---

## Checkpoints

- [ ] **CP1 — Anthropic client + AI abstraction**
- [ ] **CP2 — Escalation classifier**
- [ ] **CP3 — Food photo → nutrition (vision)**

---

## CP1 — Anthropic client + AI abstraction

Scope: Install Anthropic SDK (verify version via Context7). Typed client
module + function signatures that the rest of the app uses. No direct SDK
imports outside `src/lib/ai/`.

Files to create:
- `src/lib/ai/client.ts` — configured Anthropic client reading `ANTHROPIC_API_KEY`
- `src/lib/ai/index.ts` — typed exports: `classifyMessage()`, `analyzeFoodPhoto()`

Models per PRD §6 and CLAUDE.md tech stack: Claude Haiku for
classification + vision, Claude Sonnet for heavier tasks. Verify current
model string IDs via Context7 before writing — not from memory.

---

## CP2 — Escalation classifier

Scope: `classifyMessage()` using Claude Haiku. Input: client message +
optional conversation context + client profile. Output structured JSON:
`{ escalate, category, confidence, reason }`.

Categories per PRD §9.1:
- `medical` — pain, injury, symptoms, supplement/medication questions
- `emotional_distress`
- `off_topic`
- `compliance_drop` — 3+ missed check-ins
- `dramatic_weight_change` — >2 kg in a week
- `audio` — V1 escalates all audio
- `pause_cancel_refund`
- `life_event` — travel, illness, transitions
- `none` — routine (no escalation)

Dev-only test screen: `/dev/classifier` (text input + Classify button +
result display). Hidden from production navigation.

---

## CP3 — Food photo → nutrition (vision)

Scope: `analyzeFoodPhoto()` using Claude Haiku vision. Input: food photo +
client's STATED measurement (string). Output structured JSON: identified
foods + calorie/macro breakdown (cal, protein, carbs, fats, fiber).

Key constraint per PRD §5.9: **NO portion-guessing from the photo.**
Apply the trainer/client's stated measurement. Indian food context
(IFCT-style). Gracefully handles unrecognizable/non-food photos.

Dev-only test screen: `/dev/food` (photo upload + measurement text +
result display). Hidden from production navigation.

**Phase 4B wiring (deferred):** Both functions wire to live inbound
WhatsApp messages once Phase 3 is live — classifier runs on every
inbound message, food vision runs when client sends a meal photo.
