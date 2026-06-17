# Phase 3 — WhatsApp Integration (AiSensy)

**Status:** PENDING external approvals
**Prompt library:** [`../../prompts/phase-3-prompts.md`](../../prompts/phase-3-prompts.md)

> ⚠️ **Only CP1 (mock abstraction) buildable now.**
> CP2–CP4 are LIVE-ONLY, deferred until business entity + GST + BSP + Meta
> approval lands. Estimated lead time from zero: 4–6 weeks
> (entity 10–15 days + GST 7–10 days + AiSensy approval 3–7 days +
> first sender number 24–48 hours).

---

## Known tech debt carried from Phase 2

- **iOS Google Sign-In broken** — `Nonces mismatch` between GIDSignIn 9.0
  and Supabase `signInWithIdToken`. Android works. Must be resolved before
  App Store submission. See `docs/specs/done/phase-2-onboarding-billing.md` CP4.

---

## Checkpoints

- [x] **CP1 — WhatsApp provider abstraction + mock adapter** (2026-06-17)
- [ ] **CP2 — Live BSP adapter (AiSensy)** [LIVE-ONLY — deferred]
- [ ] **CP3 — Inbound webhook → Conversations** [LIVE-ONLY — deferred]
- [ ] **CP4 — Outbound from app (composer → WhatsApp)** [LIVE-ONLY — deferred]

---

## CP1 — WhatsApp provider abstraction + mock adapter

**Status:** ✅ Complete (2026-06-17)

Delivered: `src/lib/whatsapp/provider.ts` (interface + normalized types),
`adapters/mock.ts`, `adapters/aisensy.ts` (stub, throws until CP2),
`index.ts` (factory, default `mock`). `WHATSAPP_PROVIDER=mock` in `.env.local`.
Tests: build green; mock selected by default; `sendText` logs from/to/text;
inbound normalization works; grep confirms no file outside `src/lib/whatsapp/`
imports an adapter directly.

**Env-scope note:** `WHATSAPP_PROVIDER` is a bare var (server-side only). In the
static-exported Capacitor client it is undefined → factory falls back to `mock`,
the intended CP1 behavior. Live sending (CP2) runs server-side (Edge Functions /
webhook) where the bare var resolves. Add `NEXT_PUBLIC_WHATSAPP_PROVIDER` only if
client-side switching is ever needed.

Scope: provider interface + normalized types + mock adapter + AiSensy stub
+ factory. No live API calls. App selects adapter via `WHATSAPP_PROVIDER`
env var (default `"mock"`).

Files to create:
- `src/lib/whatsapp/provider.ts` — `WhatsAppProvider` interface + normalized types
- `src/lib/whatsapp/adapters/mock.ts` — logs + returns fake success
- `src/lib/whatsapp/adapters/aisensy.ts` — correct signatures, TODO bodies
- `src/lib/whatsapp/index.ts` — factory

Env var: `WHATSAPP_PROVIDER=mock` added to `.env.local`.

Architecture rule: No file outside `src/lib/whatsapp/` imports an adapter
directly. All BSP calls go through `provider.ts`.

---

## CP2 — Live BSP adapter (AiSensy) [LIVE-ONLY]

**Prerequisites:** Business entity registered, GST approved, AiSensy
account approved, live/sandbox sender number provisioned.

Scope: Real AiSensy adapter implementing every method in
`WhatsAppProvider`. Credentials in `.env.local`. Verify API via Context7
before writing — not from memory. Per-trainer number provisioning via API.

---

## CP3 — Inbound webhook → Conversations [LIVE-ONLY]

**Prerequisites:** CP2 live, sender number receiving messages.

Scope: Webhook receives BSP payloads → `parseInboundWebhook` normalizes
→ identify trainer by number → insert into `messages` table → appear in
Conversations screen. Handle text/image/document/audio. 24-hour customer
service window tracking (Infra doc §7). Multi-tenant: sender number maps
to correct trainer's RLS scope.

Schema needs to flag before building:
- `messages` table columns (sender number → trainer mapping)
- Trainer ↔ sender number mapping table
- 24h window tracking column

---

## CP4 — Outbound from app (composer → WhatsApp) [LIVE-ONLY]

**Prerequisites:** CP3 live.

Scope: Composer sends via provider interface → client receives on WhatsApp.
Bot vs trainer message differentiation per PRD §5.2 and CLAUDE.md bubble
styles. 24h window enforcement in UI (outside window → require approved
template, explain why). Native Android voice recorder (Capacitor).

Template approval: All outbound templates (welcome, plan delivery, daily
check-in) must be pre-approved by Meta via AiSensy before sending.
