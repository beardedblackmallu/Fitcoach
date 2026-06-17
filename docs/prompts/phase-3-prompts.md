# Phase 3 — Prompts (WhatsApp Integration)

> STATUS: PENDING external approvals (business entity + GST + BSP +
> Meta WhatsApp API).
> ✅ CP1 (mock abstraction) buildable NOW.
> ⏳ CP2-CP4 [LIVE-ONLY] — deferred until a live BSP sender number
> exists.

## Testing convention
Android-first, iOS pass per phase. Where no live number exists,
test against the mock adapter or BSP sandbox. Tests needing real
Meta approval are marked [LIVE-ONLY].

## CRITICAL ARCHITECTURE RULE
BSP abstracted behind a provider interface. No screen/route/logic
imports a BSP directly. All BSP calls go through
src/lib/whatsapp/provider.ts + an adapter in
src/lib/whatsapp/adapters/. Swapping providers = one new adapter
file.

### CP1 — WhatsApp provider abstraction + mock adapter [BUILDABLE NOW]
CONTEXT: CLAUDE.md; WhatsApp-Infrastructure.md s1-4;
phase-3-whatsapp.md CP1.
TASK:
1. src/lib/whatsapp/provider.ts — interface WhatsAppProvider:
   provisionNumber(trainerId), sendText, sendDocument, sendImage,
   sendAudio, sendTemplate, parseInboundWebhook(payload),
   getNumberQuality.
2. Normalized types (NormalizedInboundMessage etc.) so the app
   never sees provider shapes.
3. adapters/mock.ts — implements every method, logs + returns fake
   success.
4. adapters/aisensy.ts — stub, correct signatures, TODO bodies, no
   real SDK.
5. index.ts — factory selecting adapter via WHATSAPP_PROVIDER
   (default "mock"). Add WHATSAPP_PROVIDER=mock to .env.local.
TESTS (Android, mock):
Test 0 — confirm provider.ts, mock.ts, aisensy.ts (stub),
index.ts, and the spec stub all exist.
1. npm run build → zero errors.
2. WHATSAPP_PROVIDER=mock → app launches normally on Android.
3. Test call to sendText via mock → logs from/to/text.
4. grep: no file outside src/lib/whatsapp/ imports mock.ts or
   aisensy.ts directly — report result.
COMPLETION: mark CP1 [x] in phase-3-whatsapp.md; update
BUILD-PLAN.md (Phase 3 CP1 complete + date, CP2-4 still PENDING);
commit "Phase 3 CP1 — WhatsApp provider abstraction + mock adapter".
VERIFY: CLAUDE.md read; architecture rule understood; summarize +
flag contradictions.

### CP2 — Live BSP adapter [LIVE-ONLY — deferred]
PREREQUISITE: entity + GST done, BSP approved, live/sandbox number.
CONTEXT: CLAUDE.md; WhatsApp-Infrastructure.md; phase-3-whatsapp.md
CP2.
TASK: Implement the real adapter for the chosen BSP (default
AiSensy) against its real API (verify via Context7, never from
memory). Credentials in .env.local. Outbound text/image/PDF/audio.
Per-trainer number provisioning. WHATSAPP_PROVIDER=aisensy goes
live.
TESTS (real device + live/sandbox):
Test 0 — credentials load, adapter selected via env var.
1. [LIVE-ONLY] Send text → received on WhatsApp.
2. [LIVE-ONLY] Send PDF → openable.
3. [LIVE-ONLY] Send image+caption → received.
4. [LIVE-ONLY] Provision number via API → in BSP dashboard.
5. Switch back to mock → app still works.
COMPLETION: mark CP2 [x]; update BUILD-PLAN.md; commit "Phase 3
CP2 — live BSP adapter".
VERIFY: CLAUDE.md read; live credentials present; Context7 for real
API; confirm mock-swap still works.

### CP3 — Inbound webhook → Conversations [LIVE-ONLY — deferred]
CONTEXT: CLAUDE.md; WhatsApp-Infrastructure.md s7,9;
phase-3-whatsapp.md CP3.
TASK: Webhook receives BSP inbound payloads → normalize via
provider.parseInboundWebhook (never parse provider shape in route)
→ identify which trainer's number → store in messages table → show
in that trainer's Conversations. Handle text/image/document/audio.
24h customer service window tracking (Infra s7). Conversations
screen goes mock → real.
TESTS:
Test 0 — Conversations renders real threads from DB.
1. [LIVE-ONLY] WhatsApp msg to provisioned number → appears in
   right trainer's Conversations in seconds.
2. Mock: simulate inbound webhook → message appears.
3. Inbound image renders.
4. Two trainers/two numbers → each sees only own client messages
   (RLS holds).
5. 24h window indicator correct.
COMPLETION: mark CP3 [x]; update BUILD-PLAN.md; commit "Phase 3 CP3
— inbound webhook to Conversations".
VERIFY: CLAUDE.md read; parseInboundWebhook used; multi-tenant by
sender number + RLS; flag messages-table schema needs.

### CP4 — Outbound from app (composer → WhatsApp) [LIVE-ONLY — deferred]
CONTEXT: CLAUDE.md; PRD s5.2,8.4; phase-3-whatsapp.md CP4.
TASK: Composer sends via provider → client receives. Sent messages
show trainer styling + "From [Trainer]" label per CLAUDE.md. Bot vs
trainer differentiation preserved. Respect 24h window (outside it,
require approved template, Infra s7), show in UI. Native Android
recorder for voice (Capacitor).
TESTS:
Test 0 — composer renders: text input, mic, camera, send.
1. [LIVE-ONLY] Send text → arrives on client WhatsApp.
2. [LIVE-ONLY] Voice note → playable audio.
3. [LIVE-ONLY] Photo → arrives.
4. Sent messages show trainer styling + label.
5. Mock: sends log + appear optimistically.
6. Outside 24h → UI requires template, explains why.
COMPLETION: mark CP4 [x]; update BUILD-PLAN.md; move
phase-3-whatsapp.md to docs/specs/done/; mark Phase 3 COMPLETE;
commit "Phase 3 complete — WhatsApp integration"; run per-phase iOS
pass.
VERIFY: CLAUDE.md read; all sends via provider interface; Context7
for Capacitor audio; bot/trainer differentiation intact.
