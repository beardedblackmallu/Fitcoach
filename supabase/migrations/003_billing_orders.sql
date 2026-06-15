-- =====================================================================
-- FitCoach — Phase 2 CP2: Billing (Razorpay Orders API)
-- Subscriptions/Recurring is gated on the account, so we model billing as
-- a one-time Order per cycle. razorpay_subscription_id is kept (nullable)
-- for the future upgrade to native auto-recurring once Razorpay enables it.
-- payment_provider is forward-looking for international (e.g. Stripe) later.
--
-- Apply via Supabase dashboard SQL editor. Safe to re-run.
-- =====================================================================

ALTER TABLE trainers
  -- Which gateway billed this trainer (India = razorpay; future intl = stripe)
  ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'razorpay'
    CHECK (payment_provider IN ('razorpay', 'stripe')),

  -- Razorpay Orders flow
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,

  -- Reserved for the native-subscriptions upgrade (currently unused)
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id text,

  -- Renewal cursor — when the current paid period ends. Dashboard checks this
  -- on load; past it → subscription_status flips to 'expired' → /billing.
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- subscription_tier / subscription_status already exist from migration 002:
--   subscription_tier   ∈ (starter, growth, pro, scale)
--   subscription_status ∈ (none, pending, active, expired)
-- On a captured payment: status → 'active', current_period_end → now + 1 month.
