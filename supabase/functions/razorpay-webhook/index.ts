// FitCoach — razorpay-webhook Edge Function (Phase 2 CP2)
//
// Razorpay calls this on payment events. It verifies the signature, then on a
// captured payment flips the trainer's subscription to active and sets the
// renewal date. This is the source of truth for billing state.
//
// Secrets required (supabase secrets set ...):
//   RAZORPAY_WEBHOOK_SECRET   (the secret you set when adding the webhook in
//                              the Razorpay dashboard)
// Auto-injected: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Configure in Razorpay: Settings → Webhooks → add this function's URL,
// subscribe to `payment.captured` (and optionally `order.paid`), set the
// same secret.

import { createClient } from "jsr:@supabase/supabase-js@2";

async function hmacSha256Hex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time-ish compare to avoid leaking via early return.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await req.text(); // raw body — signature is over the exact bytes
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

  const expected = await hmacSha256Hex(secret, body);
  if (!safeEqual(expected, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id ?? event.payload?.order?.entity?.id;
    const paymentId = payment?.id ?? null;

    if (orderId) {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1); // one paid month

      await admin
        .from("trainers")
        .update({
          subscription_status: "active",
          razorpay_payment_id: paymentId,
          current_period_end: periodEnd.toISOString(),
        })
        .eq("razorpay_order_id", orderId);
    }
  }

  // Always 200 on a verified event so Razorpay doesn't retry endlessly.
  return new Response("ok", { status: 200 });
});
