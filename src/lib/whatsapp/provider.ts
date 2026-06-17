// WhatsApp provider abstraction (Phase 3 CP1).
//
// ARCHITECTURE RULE: the BSP (Business Solution Provider — AiSensy in V1) is
// hidden behind this interface. No screen/route/logic imports an adapter or a
// BSP SDK directly. Everything goes through getWhatsAppProvider() in ./index.
// Swapping providers = one new adapter file in ./adapters/.
//
// All types here are NORMALIZED — the app never sees provider-specific shapes.
// Inbound payloads are translated by parseInboundWebhook() into
// NormalizedInboundMessage; raw provider JSON is kept only for debugging.
//
// Two-number architecture (WhatsApp-Infrastructure.md §3): each trainer has a
// platform API number (Number A, provisioned here) for ALL messaging. Their
// personal phone (Number B) is never touched by this layer.

// ----- Number provisioning -----

export type WhatsAppNumberState =
  | "pending"       // provisioning requested, nothing live yet
  | "provisioning"  // BSP is creating/porting the number
  | "active"        // live and ready to message
  | "migrating"     // Option B: existing number being ported in
  | "failed";       // provisioning/migration failed

// Result of provisionNumber(). Number A from the trainer's perspective.
export interface ProvisionedNumber {
  trainerId: string;
  phoneNumber: string | null;  // E.164, null until the number goes live
  displayName: string | null;  // "Coach [Name] Fitness" shown to clients
  state: WhatsAppNumberState;
  providerRef: string | null;  // provider-side handle/id for this number
}

// ----- Number quality (Meta rates each sender; affects deliverability) -----

// Meta quality rating maps to a traffic-light scale; "unknown" before warm-up.
export type NumberQualityRating = "green" | "yellow" | "red" | "unknown";

export interface NumberQuality {
  rating: NumberQualityRating;
  messagingLimitTier: string; // e.g. "TIER_250", "TIER_1K", "TIER_10K"
  canSend: boolean;           // false if Meta has throttled/banned the number
}

// ----- Outbound sends -----

// A normalized acknowledgement for any outbound message.
export interface SendResult {
  providerMessageId: string;          // BSP's id for the sent message
  status: "sent" | "queued" | "failed";
  error?: string;
}

export interface SendTextParams {
  from: string; // trainer's provisioned WhatsApp number (E.164)
  to: string;   // client's WhatsApp number (E.164)
  text: string;
}

// Shared shape for document/image/audio. `caption` ignored for audio;
// `filename` only meaningful for documents.
export interface SendMediaParams {
  from: string;
  to: string;
  mediaUrl: string;   // hosted URL of the asset (PDF, image, audio)
  caption?: string;
  filename?: string;
}

// Approved Meta template — required to message OUTSIDE the 24h customer
// service window (WhatsApp-Infrastructure.md §7).
export interface SendTemplateParams {
  from: string;
  to: string;
  templateName: string;                // approved template name
  languageCode: string;                // e.g. "en"
  variables?: Record<string, string>;  // body variable substitutions
}

// ----- Inbound (webhook) -----

export type InboundMessageType =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "unsupported";

// One normalized inbound message. `to` is the trainer's provisioned number and
// is how inbound traffic is routed to the right trainer (multi-tenant).
export interface NormalizedInboundMessage {
  providerMessageId: string;
  from: string;                  // client's number (E.164)
  to: string;                    // trainer's provisioned number (E.164)
  type: InboundMessageType;
  text: string | null;           // text body or media caption
  mediaUrl: string | null;       // populated for media types
  mimeType: string | null;
  timestamp: string;             // ISO 8601
  raw: unknown;                  // original payload — debugging only, never app logic
}

// ----- The provider contract -----

export interface WhatsAppProvider {
  readonly name: string;

  // Number A provisioning for a trainer (Option A new number / Option B port).
  provisionNumber(trainerId: string): Promise<ProvisionedNumber>;

  // Service messages — free within the 24h window.
  sendText(params: SendTextParams): Promise<SendResult>;
  sendDocument(params: SendMediaParams): Promise<SendResult>;
  sendImage(params: SendMediaParams): Promise<SendResult>;
  sendAudio(params: SendMediaParams): Promise<SendResult>;

  // Outside the 24h window — requires an approved template (paid).
  sendTemplate(params: SendTemplateParams): Promise<SendResult>;

  // Translate a raw webhook body into normalized messages. A single webhook may
  // carry several messages, or none (e.g. delivery-status events) → [].
  parseInboundWebhook(payload: unknown): NormalizedInboundMessage[];

  // Current Meta quality rating for a provisioned number.
  getNumberQuality(phoneNumber: string): Promise<NumberQuality>;
}
