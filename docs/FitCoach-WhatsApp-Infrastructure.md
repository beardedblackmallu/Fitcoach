# FitCoach — WhatsApp Infrastructure & Trainer Onboarding

**Version:** 1.0
**Last updated:** 23 May 2026
**Status:** Reference document for V1 build
**Related:** FitCoach-PRD.md sections 5.5, 7

---

## 1. The two WhatsApps (most-misunderstood concept)

| | WhatsApp Business App | WhatsApp Business API |
|---|---|---|
| What it is | Free Play Store app trainers download | Developer API for programmatic messaging |
| Used by | Most Indian trainers today | FitCoach |
| Setup | Install app, register number, done | Business registration with Meta, approval, sender numbers added |
| Automation | None (manual chat only) | Full programmatic send/receive |
| Calling | Yes (voice + video) | No (API numbers cannot call) |
| Cost | Free | Per-message pricing |

FitCoach uses the API. Trainers must move off the app onto the API to be on FitCoach.

---

## 2. The BSP decision (locked for V1)

**FitCoach uses AiSensy as Business Solution Provider for V1.**

Rationale:
- 3-7 day onboarding vs 2-4 weeks for direct Meta
- They handle Meta business verification
- Their SDK abstracts webhook complexity
- Support team for production debugging
- Cost markup acceptable at solo-founder scale

V1.5 reconsideration: Once volume > 20 trainers, evaluate migration to direct Meta Cloud API for cost savings.

Alternatives considered and not chosen:
- Wati — similar to AiSensy, less popular among Indian fitness coaching
- Interakt — solid, slightly more expensive
- Direct Meta — too much complexity for V1 solo build

---

## 3. Phone number architecture (the two-number reality)

Every trainer operates with two numbers in V1:

**Number A — Platform API number** (provisioned via AiSensy)
- Used for ALL messaging via FitCoach dashboard
- Bot check-ins, plan delivery, escalation handoffs, trainer-to-client messages
- Cannot make voice or video calls
- Owned/operated under FitCoach's AiSensy account

**Number B — Trainer's personal phone**
- Used for ALL voice/video calls to clients
- "Tap to call" in dashboard surfaces client number; trainer dials manually
- Never connected to FitCoach's platform
- Trainer's existing personal mobile

This architecture is locked for V1. Future possibilities:
- V1.5: Voice API integration (Exotel/Knowlarity) for masked outbound calls from platform
- V2: Meta WhatsApp Business Calling API (once generally available) to unify both numbers

---

## 4. Trainer onboarding — number provisioning choice

At signup, trainer chooses one of two options:

### Option A — Get a new FitCoach number (recommended default)
- AiSensy provisions a fresh WhatsApp number from their pool
- Ready in 24 hours
- Trainer informs clients: "Save +91 80XXX XXXXX as 'Coach [Name] Fitness'"
- Personal number stays untouched and continues working with WhatsApp app
- Reversible — if trainer churns, they lose only the FitCoach number, not their main one

### Option B — Migrate existing WhatsApp Business number
- Trainer provides their existing business number
- Meta migration flow ports it to FitCoach's AiSensy account
- Takes 2-7 days
- **Critical tradeoff:** Trainer permanently loses ability to use WhatsApp app on this number
- All future messaging must go through FitCoach dashboard
- Cannot call from this number anymore
- Existing clients see the same number (no behavior change for them)

Most trainers should pick Option A. Option B reserved for established coaches whose clients already have their business number deeply embedded.

---

## 5. Business entity requirements

**FitCoach Pvt Ltd (or LLP/sole prop with GST) must be registered before AiSensy onboarding.**

Required documents:
- Certificate of incorporation
- GST registration certificate
- PAN of the company
- Authorized signatory ID
- Cancelled cheque for company bank account
- Business address proof

Approximate timelines:
- Pvt Ltd incorporation: 10-15 days
- LLP incorporation: 7-10 days
- GST registration: 7-10 days
- AiSensy approval after docs submitted: 3-7 days
- First sender number live: 24-48 hours after approval

Total from zero to first live trainer: ~4-6 weeks for entity + GST + AiSensy.

---

## 6. Per-message economics (India, current AiSensy rates as of May 2026)

Approximate costs include AiSensy markup over Meta base rates.

| Message type | Cost per message | When it applies |
|---|---|---|
| Service message | Free | Within 24-hour customer service window after client message |
| Utility template | ~₹0.20-0.30 | Outbound transactional (appointment reminders, plan delivery) |
| Marketing template | ~₹1.20-1.40 | Outbound promotional messages |
| AiSensy platform fee | ~₹999/month base | Subscription, includes message bundle |

### The cost optimization built into FitCoach

Every client-initiated message opens a 24-hour customer service window (CSW). All outbound messages within that window are free.

**Design principle:** Trainers' clients should always initiate first message daily. Morning weight check-in, workout completion log, meal photo — all client-initiated.

Expected cost reduction: 60-80% vs naive utility-template-everything approach.

### Unit economics at 30 clients per trainer

- Optimized WhatsApp + AiSensy cost: ~₹400-600/month per trainer
- Claude Haiku AI cost (escalation classifier + food vision): ~₹300/month per trainer
- Total platform cost per trainer: ~₹700-900/month
- Trainer pays: ₹1,999/month (Growth tier)
- Net margin: 55-65%

---

## 7. Critical compliance & operational notes

**Opt-in is mandatory.** Every client must explicitly opt-in to receive WhatsApp messages from FitCoach. The trainer's invite flow MUST capture this.

**Template approval is required for utility/marketing messages.** Every non-conversational message format (welcome message, plan delivery notification, payment reminder, daily check-in prompt) must be approved as a template by Meta before use. AiSensy handles submission. Approval: 24-48 hours typically.

**24-hour window enforcement.** After the last client message, the trainer has 24 hours to respond freely. After that, only approved utility/marketing templates can be sent (paid). FitCoach's UI must clearly indicate when a conversation has gone beyond the 24-hour window.

**Quality rating affects deliverability.** Meta rates each sender number on quality (1 to 5 stars). Spammy/low-engagement numbers get throttled or banned. FitCoach must:
- Prevent trainers from sending unsolicited bulk messages
- Discourage marketing templates outside narrow use cases
- Monitor each number's quality rating via AiSensy dashboard

**Number warm-up.** New sender numbers start with low daily message limits (1000/day typically). Limits grow with usage history and quality rating. Trainers cannot send to 100 clients on day one of their FitCoach signup.

---

## 8. Failure modes to design for

| Failure | What happens | Mitigation |
|---|---|---|
| Trainer's number gets quality-rated down by Meta | Throttled/banned by Meta | Detect early via webhooks, alert trainer, coach them on better messaging practices |
| AiSensy outage | All messages fail | Show clear error state, queue and retry, eventually offer SMS fallback (V2) |
| Client never opens message | No delivery confirmation | Track delivery + read receipts, surface "client hasn't read in 48h" to trainer |
| Trainer hits daily message limit | Subsequent messages fail | Monitor approaching limits, warn trainer, prioritize critical messages |
| Client blocks trainer's number | All future messages bounce | Detect bounce events, mark client as "unreachable," prompt trainer to contact via phone |

---

## 9. What FitCoach must do at signup vs runtime

### At trainer signup
1. Collect business details (or confirm they belong to your existing entity)
2. Capture choice between Option A (new number) or Option B (migrate)
3. If A: trigger AiSensy provisioning, surface number to trainer in 24h
4. If B: collect existing number details, trigger migration flow, surface status to trainer
5. Submit all template messages (welcome, plan delivery, daily check-in) for approval — these must be pre-approved per trainer's specific wording
6. Once live: trainer receives confirmation, gets onboarding tutorial

### At runtime (per message)
1. Check if 24-hour CSW is open with this client
2. If yes: send as service message (free)
3. If no: send as approved utility template (paid)
4. Handle delivery + read receipts via webhook
5. Update conversation thread in dashboard live
6. Update message quality metrics for trainer's sender number

---

## 10. Change log

| Date | Version | Change | Decided by |
|------|---------|--------|------------|
| 23 May 2026 | 1.0 | Initial doc — AiSensy chosen as V1 BSP, two-number architecture confirmed | Founder + Claude |

---

*This document supplements the main PRD. WhatsApp-related architectural decisions live here for engineering reference. Update via pull request alongside any change to integration approach.*
