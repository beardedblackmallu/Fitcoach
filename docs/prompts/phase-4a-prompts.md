# Phase 4A — Prompts (AI Logic — buildable now)

## Testing convention
Android-first. Phase 4A is testable WITHOUT WhatsApp — AI functions
tested against sample inputs via dev-only test screens. Requires
ANTHROPIC_API_KEY in .env.local (product runtime key, separate from
Claude Code subscription).

## Dependency
Anthropic API key from console.anthropic.com with credit loaded.
ANTHROPIC_API_KEY in .env.local. Never commit.

## Note
Phase 4B (wire AI to live WhatsApp stream, daily check-in
scheduler, workout-log parsing) is DEFERRED until Phase 3 live.

### CP1 — Anthropic client + AI abstraction
CONTEXT: CLAUDE.md; phase-4a-ai-logic.md CP1.
TASK: Install Anthropic SDK (verify version via Context7).
src/lib/ai/client.ts — configured client reading ANTHROPIC_API_KEY.
src/lib/ai/index.ts — typed functions classifyMessage(),
analyzeFoodPhoto() (filled later CPs). All AI calls go through this
module — no direct SDK calls elsewhere. Models per PRD: Haiku for
classification + vision, Sonnet for heavier tasks. Verify current
model string IDs via Context7 / product docs — not memory.
TESTS:
Test 0 — client.ts reads key; index.ts exports the signatures.
1. Trivial test call returns an API response without error.
2. Missing/invalid key → clear error, not silent failure.
3. No file outside src/lib/ai/ imports the Anthropic SDK directly.
COMPLETION: mark CP1 [x]; update BUILD-PLAN.md (Phase 4A CP1
complete + date); commit "Phase 4A CP1 — Anthropic client + AI
abstraction".
VERIFY: CLAUDE.md read; Context7 for SDK + model IDs;
ANTHROPIC_API_KEY present; AI calls abstracted.

### CP2 — Escalation classifier
CONTEXT: CLAUDE.md; PRD s9; phase-4a-ai-logic.md CP2.
TASK: classifyMessage() using Claude Haiku. Input: client message
(+ optional context + profile). Output structured JSON
{ escalate, category, confidence, reason }. Categories per PRD s9:
medical, emotional distress, off-topic, compliance drop, dramatic
weight change, pause/cancel/refund, life event, audio (escalate),
or none (routine). Prompt for JSON-only; parse safely. Build a
dev-only test screen /dev/classifier (text box + Classify button +
result).
TESTS:
Test 0 — /dev/classifier renders with input + result.
1. "My knee really hurts after squats" → escalate true, medical.
2. "Creatine ok with my BP meds?" → escalate true, medical/supplement.
3. "Done with today's workout!" → escalate false (routine).
4. "I want to cancel my plan" → escalate true, pause/cancel.
5. "Logged 78kg" (last was 82kg) → escalate true, dramatic weight
   change.
6. "What do you think of my new job offer?" → escalate true,
   off-topic.
7. Empty/malformed input → graceful, no crash.
8. Valid JSON every time (run each 2-3x for consistency).
COMPLETION: mark CP2 [x]; update BUILD-PLAN.md; commit "Phase 4A
CP2 — escalation classifier".
VERIFY: CLAUDE.md read; Context7 for Haiku ID + structured output;
JSON parsing safe; note: wires to live messages in Phase 4B.

### CP3 — Food photo → nutrition (vision)
CONTEXT: CLAUDE.md; PRD s5.9 (meal tracking, IFCT);
phase-4a-ai-logic.md CP3.
TASK: analyzeFoodPhoto() using Claude Haiku vision. Input: food
photo + client's STATED measurement. Output: identified foods +
calorie/macro breakdown (cal, protein, carbs, fats, fiber) as
structured JSON. Per PRD 5.9: NO portion-guessing from photo —
apply the stated measurement. Indian food context (IFCT-style).
Dev-only test screen /dev/food (photo upload + measurement text +
result).
TESTS:
Test 0 — /dev/food renders: photo upload + measurement + result.
1. Idli photo + "2 idli, 2 tbsp chutney" → items + plausible
   macros.
2. Dal+rice + stated portions → reasonable breakdown.
3. Stated measurement respected (not guessed from photo).
4. Non-food photo → graceful "couldn't identify".
5. Valid JSON every time.
6. Indian foods recognized (roti, dal, paneer, idli, dosa).
COMPLETION: mark CP3 [x]; update BUILD-PLAN.md; move
phase-4a-ai-logic.md to docs/specs/done/; mark Phase 4A COMPLETE;
commit "Phase 4A complete — AI logic (classifier + food vision)".
VERIFY: CLAUDE.md read; Context7 for Haiku vision image format;
stated-measurement approach; note: wires to live meal photos in
Phase 4B.
