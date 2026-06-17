// AiSensy WhatsApp adapter — STUB (Phase 3 CP1).
//
// Signatures only. Real implementation is Phase 3 CP2 [LIVE-ONLY], blocked on
// business entity + GST + AiSensy approval + a live sender number. Do NOT add
// the real SDK or API calls here until CP2 — verify AiSensy's API via Context7
// at that point (never from memory).
//
// Every method throws loudly so that flipping WHATSAPP_PROVIDER=aisensy before
// CP2 fails fast instead of silently no-op'ing.

import type {
  WhatsAppProvider,
  ProvisionedNumber,
  NumberQuality,
  SendResult,
  SendTextParams,
  SendMediaParams,
  SendTemplateParams,
  NormalizedInboundMessage,
} from "@/lib/whatsapp/provider";

function notImplemented(method: string): never {
  throw new Error(
    `[whatsapp:aisensy] ${method}() not implemented yet — Phase 3 CP2 (LIVE-ONLY). ` +
      `Use WHATSAPP_PROVIDER=mock until the live sender number is provisioned.`,
  );
}

export class AisensyWhatsAppProvider implements WhatsAppProvider {
  readonly name = "aisensy";

  async provisionNumber(_trainerId: string): Promise<ProvisionedNumber> {
    // TODO(CP2): call AiSensy number-provisioning API (Option A new / Option B port).
    notImplemented("provisionNumber");
  }

  async sendText(_params: SendTextParams): Promise<SendResult> {
    // TODO(CP2): POST text message via AiSensy messaging API.
    notImplemented("sendText");
  }

  async sendDocument(_params: SendMediaParams): Promise<SendResult> {
    // TODO(CP2): send document (PDF plan delivery) via AiSensy.
    notImplemented("sendDocument");
  }

  async sendImage(_params: SendMediaParams): Promise<SendResult> {
    // TODO(CP2): send image + caption via AiSensy.
    notImplemented("sendImage");
  }

  async sendAudio(_params: SendMediaParams): Promise<SendResult> {
    // TODO(CP2): send audio (voice note) via AiSensy.
    notImplemented("sendAudio");
  }

  async sendTemplate(_params: SendTemplateParams): Promise<SendResult> {
    // TODO(CP2): send approved template (outside-24h-window messaging).
    notImplemented("sendTemplate");
  }

  parseInboundWebhook(_payload: unknown): NormalizedInboundMessage[] {
    // TODO(CP3): translate AiSensy webhook payload → NormalizedInboundMessage[].
    notImplemented("parseInboundWebhook");
  }

  async getNumberQuality(_phoneNumber: string): Promise<NumberQuality> {
    // TODO(CP2): read quality rating from AiSensy dashboard API.
    notImplemented("getNumberQuality");
  }
}
