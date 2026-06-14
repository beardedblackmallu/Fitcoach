-- =====================================================================
-- FitCoach — Phase 2 CP1: Trainer onboarding wizard
-- Adds onboarding progress + profile/business/subscription columns to
-- trainers, and an `avatars` Storage bucket for profile photos.
--
-- Apply via Supabase dashboard SQL editor, or `supabase db push` once
-- the project is linked. Safe to re-run (IF NOT EXISTS guards).
-- =====================================================================

-- ── trainers: onboarding + profile/business/subscription ─────────────
ALTER TABLE trainers
  -- Resumable wizard cursor. New signups start at 'profile'; 'complete'
  -- means the wizard is finished and (app) routes unlock.
  ADD COLUMN IF NOT EXISTS onboarding_step text NOT NULL DEFAULT 'profile'
    CHECK (onboarding_step IN
      ('profile','whatsapp','business','tier','payment','confirm','complete')),

  -- Step 1 — profile photo (public URL in the `avatars` bucket)
  ADD COLUMN IF NOT EXISTS avatar_url text,

  -- Step 2 — WhatsApp number provisioning choice (UI only in CP1)
  ADD COLUMN IF NOT EXISTS whatsapp_choice text
    CHECK (whatsapp_choice IN ('new','migrate')),
  ADD COLUMN IF NOT EXISTS whatsapp_existing_number text,

  -- Step 3 — business details for later Razorpay KYC
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS gst_number text,
  ADD COLUMN IF NOT EXISTS business_address text,

  -- Step 4/5 — subscription tier + status (real billing is CP2)
  ADD COLUMN IF NOT EXISTS subscription_tier text
    CHECK (subscription_tier IN ('starter','growth','pro','scale')),
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none'
    CHECK (subscription_status IN ('none','pending','active','expired'));

-- ── Storage: avatars bucket (public read, owner-scoped writes) ────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Each trainer may only write within a folder named after their uid:
--   avatars/<auth.uid()>/<filename>
DROP POLICY IF EXISTS "avatars_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
