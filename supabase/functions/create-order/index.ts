// FitCoach — create-order Edge Function (Phase 2 CP2)
//
// Creates a Razorpay Order for the chosen subscription tier and returns the
// order to the app so it can open checkout. The Razorpay SECRET lives only
// here (Supabase secret), never in the app bundle.
//
// Billing model: Orders API (one-time per cycle) — Razorpay Subscriptions is
// gated on the account (see docs/specs/in-progress/phase-2-onboarding-billing.md).
//
// Secrets required (supabase secrets set ...):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// Auto-injected by Supabase: SUPABASE_URL, SUPABASE_ANON_KEY,
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";

// Tier → amount in paise (₹999 = 99900). Mirrors the onboarding tier cards.
const TIER_AMOUNTS: Record<string, number> = {
  starter: 99900,
  growth: 199900,
  pro: 299900,
  scale: 499900,
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { tier } = await req.json();
    const amount = TIER_AMOUNTS[tier];
    if (!amount) return json({ error: "Invalid tier" }, 400);

    // Authenticate the calling trainer from their JWT.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    // Create the Razorpay order (secret-side).
    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `${tier}_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { trainer_id: user.id, tier },
      }),
    });
    const order = await rzpRes.json();
    if (!rzpRes.ok) return json({ error: "Razorpay order failed", detail: order }, 502);

    // Record the pending order on the trainer (service role bypasses RLS).
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await admin
      .from("trainers")
      .update({
        subscription_tier: tier,
        subscription_status: "pending",
        razorpay_order_id: order.id,
      })
      .eq("id", user.id);

    // keyId is public (rzp_test_…) — safe to return for opening checkout.
    return json({ orderId: order.id, amount, currency: "INR", keyId });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
