// WhatsApp provider factory (Phase 3 CP1).
//
// The ONLY entry point the rest of the app uses. Import getWhatsAppProvider()
// (and the normalized types, re-exported below) — never an adapter directly.
//
// Adapter selection is driven by the WHATSAPP_PROVIDER env var, default "mock".
//
// NOTE on env scope: WHATSAPP_PROVIDER is a bare (non-NEXT_PUBLIC_) var, so it
// only resolves server-side (Supabase Edge Functions / webhook handlers, where
// live sending will live from CP2). In the static-exported Capacitor client
// bundle it is undefined and this falls back to "mock" — which is exactly the
// intended CP1 behavior. If client-side provider switching is ever needed, add
// a NEXT_PUBLIC_WHATSAPP_PROVIDER and read it here too.

import type { WhatsAppProvider } from "@/lib/whatsapp/provider";
import { MockWhatsAppProvider } from "@/lib/whatsapp/adapters/mock";
import { AisensyWhatsAppProvider } from "@/lib/whatsapp/adapters/aisensy";

let instance: WhatsAppProvider | null = null;

export function getWhatsAppProvider(): WhatsAppProvider {
  if (instance) return instance;

  const choice = (process.env.WHATSAPP_PROVIDER ?? "mock").toLowerCase();
  switch (choice) {
    case "aisensy":
      instance = new AisensyWhatsAppProvider();
      break;
    case "mock":
    default:
      instance = new MockWhatsAppProvider();
      break;
  }
  return instance;
}

// Re-export the normalized types so call sites import everything from one place.
export * from "@/lib/whatsapp/provider";
