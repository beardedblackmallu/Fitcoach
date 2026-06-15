// Billing helpers (Phase 2 CP2).
// Razorpay ORDERS flow (Subscriptions is gated on the account — see the spec).
// The create-order Edge Function holds the secret; this only calls it with the
// trainer's JWT, then opens the native Razorpay checkout.

import { Checkout } from "capacitor-razorpay";
import { createClient } from "@/lib/supabase/client";

export interface Tier {
  key: string;
  name: string;
  price: number;   // ₹ per month
  clients: number; // client cap
  popular?: boolean;
}

export const TIERS: Tier[] = [
  { key: "starter", name: "Starter", price: 999, clients: 10 },
  { key: "growth", name: "Growth", price: 1999, clients: 30, popular: true },
  { key: "pro", name: "Pro", price: 2999, clients: 50 },
  { key: "scale", name: "Scale", price: 4999, clients: 100 },
];

export const tierByKey = (key: string | null | undefined) =>
  TIERS.find((t) => t.key === key);

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// Full Razorpay checkout options. The plugin's published d.ts only declares
// key+amount, but the native SDK consumes the rest — so we cast the call.
interface RazorpayOptions {
  key: string;
  amount: string;
  order_id: string;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

export interface CheckoutResult {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Creates the order server-side, then opens native checkout. Resolves with the
// Razorpay response on success; throws on failure/cancel. Subscription
// activation is authoritative via the razorpay-webhook (not this return value).
export async function startCheckout(
  tier: string,
  prefill: { name?: string; email?: string },
): Promise<CheckoutResult> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("You're not signed in.");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ tier }),
    },
  );
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Could not start payment (${res.status})`);
  }
  const order: CreateOrderResponse = await res.json();

  const options: RazorpayOptions = {
    key: order.keyId,
    amount: String(order.amount),
    order_id: order.orderId,
    currency: order.currency,
    name: "FitCoach",
    description: `${tierByKey(tier)?.name ?? "Subscription"} plan`,
    prefill: { name: prefill.name, email: prefill.email },
    theme: { color: "#FF6400" },
  };

  const open = Checkout.open as unknown as (
    o: RazorpayOptions,
  ) => Promise<unknown>;

  // The promise RESOLVING means payment succeeded (it rejects on cancel/fail).
  // The response shape varies by platform: sometimes { response: "<json>" },
  // sometimes { response: {...} }, sometimes the fields directly. The webhook
  // is authoritative for activation, so never throw on parsing here.
  const raw = await open(options);
  const inner = (raw as { response?: unknown })?.response ?? raw;
  if (typeof inner === "string") {
    try { return JSON.parse(inner) as CheckoutResult; } catch { return {}; }
  }
  if (inner && typeof inner === "object") return inner as CheckoutResult;
  return {};
}
