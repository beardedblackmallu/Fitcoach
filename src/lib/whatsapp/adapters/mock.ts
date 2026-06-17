// Mock WhatsApp adapter (Phase 3 CP1).
//
// Logs every call and returns fake success. No network, no BSP. This is the
// default provider (WHATSAPP_PROVIDER unset or "mock") and the test target for
// every non-[LIVE-ONLY] Phase 3 test.

import type {
  WhatsAppProvider,
  ProvisionedNumber,
  NumberQuality,
  SendResult,
  SendTextParams,
  SendMediaParams,
  SendTemplateParams,
  NormalizedInboundMessage,
  InboundMessageType,
} from "@/lib/whatsapp/provider";

const TAG = "[whatsapp:mock]";

function fakeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  readonly name = "mock";

  async provisionNumber(trainerId: string): Promise<ProvisionedNumber> {
    console.log(`${TAG} provisionNumber`, { trainerId });
    return {
      trainerId,
      phoneNumber: "+91 80000 00000",
      displayName: "Coach Demo Fitness",
      state: "active",
      providerRef: fakeId("num"),
    };
  }

  async sendText(params: SendTextParams): Promise<SendResult> {
    console.log(`${TAG} sendText`, {
      from: params.from,
      to: params.to,
      text: params.text,
    });
    return { providerMessageId: fakeId("msg"), status: "sent" };
  }

  async sendDocument(params: SendMediaParams): Promise<SendResult> {
    console.log(`${TAG} sendDocument`, {
      from: params.from,
      to: params.to,
      mediaUrl: params.mediaUrl,
      filename: params.filename,
    });
    return { providerMessageId: fakeId("msg"), status: "sent" };
  }

  async sendImage(params: SendMediaParams): Promise<SendResult> {
    console.log(`${TAG} sendImage`, {
      from: params.from,
      to: params.to,
      mediaUrl: params.mediaUrl,
      caption: params.caption,
    });
    return { providerMessageId: fakeId("msg"), status: "sent" };
  }

  async sendAudio(params: SendMediaParams): Promise<SendResult> {
    console.log(`${TAG} sendAudio`, {
      from: params.from,
      to: params.to,
      mediaUrl: params.mediaUrl,
    });
    return { providerMessageId: fakeId("msg"), status: "sent" };
  }

  async sendTemplate(params: SendTemplateParams): Promise<SendResult> {
    console.log(`${TAG} sendTemplate`, {
      from: params.from,
      to: params.to,
      templateName: params.templateName,
      languageCode: params.languageCode,
      variables: params.variables,
    });
    return { providerMessageId: fakeId("msg"), status: "sent" };
  }

  // Accepts a lenient local-test shape: { from, to, text?, type?, mediaUrl? }.
  // Anything without from+to (e.g. a status event) normalizes to [].
  parseInboundWebhook(payload: unknown): NormalizedInboundMessage[] {
    const p = (payload ?? {}) as {
      from?: string;
      to?: string;
      text?: string;
      type?: InboundMessageType;
      mediaUrl?: string;
      mimeType?: string;
    };

    if (!p.from || !p.to) {
      console.log(`${TAG} parseInboundWebhook — no recognizable message`);
      return [];
    }

    const message: NormalizedInboundMessage = {
      providerMessageId: fakeId("in"),
      from: p.from,
      to: p.to,
      type: p.type ?? "text",
      text: p.text ?? null,
      mediaUrl: p.mediaUrl ?? null,
      mimeType: p.mimeType ?? null,
      timestamp: new Date().toISOString(),
      raw: payload,
    };
    console.log(`${TAG} parseInboundWebhook`, {
      from: message.from,
      to: message.to,
      type: message.type,
    });
    return [message];
  }

  async getNumberQuality(phoneNumber: string): Promise<NumberQuality> {
    console.log(`${TAG} getNumberQuality`, { phoneNumber });
    return { rating: "green", messagingLimitTier: "TIER_1K", canSend: true };
  }
}
