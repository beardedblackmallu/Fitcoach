-- =====================================================================
-- FitCoach — Initial schema
-- Supabase Postgres (ap-south-1 / Mumbai)
-- =====================================================================
-- Fixes applied vs docs/schema.md:
--   1. business_phone made nullable (trainers don't have it at signup)
--   2. WITH CHECK added to every RLS policy (fixes INSERT isolation)
--   3. handle_new_trainer() trigger auto-creates trainer row on signup
--   4. updated_at trigger function shared across all relevant tables
-- =====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- TRAINERS
-- One row per coach. Linked 1:1 to auth.users.
-- =====================================================================
CREATE TABLE trainers (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT '',
  business_phone  text,                          -- nullable: filled in Settings after signup
  bio             text,
  specialties     text[] DEFAULT '{}',
  city            text,
  timezone        text NOT NULL DEFAULT 'Asia/Kolkata',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trainers_self" ON trainers
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Auto-create a trainer profile whenever a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_trainer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trainers (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_trainer();

-- =====================================================================
-- CLIENTS
-- =====================================================================
CREATE TABLE clients (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id           uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name                 text NOT NULL,
  phone                text NOT NULL,
  email                text,
  date_of_birth        date,
  gender               text CHECK (gender IN ('Male','Female','Prefer not to say')),
  height_cm            numeric(5,1),
  status               text NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','paused','expired')),
  goal                 text,
  weight_start_kg      numeric(5,1),
  weight_current_kg    numeric(5,1),
  weight_target_kg     numeric(5,1),
  joined_at            date NOT NULL DEFAULT current_date,
  diet_preference      text CHECK (diet_preference IN
                         ('Vegetarian','Non-vegetarian','Eggetarian','Vegan')),
  workout_preference   text CHECK (workout_preference IN ('Gym','Home','Hybrid')),
  whey_use             text CHECK (whey_use IN ('Yes','No','Not sure')),
  allergies            text,
  injuries             text,
  medical_conditions   text,
  intake_notes         text,
  last_message_at      timestamptz,
  avatar_color         text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, phone)
);

CREATE INDEX idx_clients_trainer_status ON clients(trainer_id, status);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_owned" ON clients
  FOR ALL
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

-- =====================================================================
-- PLANS
-- =====================================================================
CREATE TABLE plans (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id           uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name                 text NOT NULL,
  description          text,
  duration_weeks       int NOT NULL CHECK (duration_weeks BETWEEN 1 AND 52),
  cycle_length_weeks   int NOT NULL CHECK (cycle_length_weeks BETWEEN 1 AND 52),
  type                 text NOT NULL DEFAULT 'template'
                         CHECK (type IN ('template','custom')),
  last_edited_at       timestamptz NOT NULL DEFAULT now(),
  archived_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (cycle_length_weeks <= duration_weeks)
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_owned" ON plans
  FOR ALL
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

-- =====================================================================
-- PLAN ASSIGNMENTS
-- =====================================================================
CREATE TABLE plan_assignments (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id        uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  client_id      uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  start_date     date NOT NULL,
  status         text NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','completed','paused','cancelled')),
  current_week   int DEFAULT 1,
  assigned_at    timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz
);

CREATE INDEX idx_pa_client_status ON plan_assignments(client_id, status);
CREATE INDEX idx_pa_plan_status   ON plan_assignments(plan_id, status);

ALTER TABLE plan_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_assignments_via_client" ON plan_assignments
  FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()));

-- =====================================================================
-- EXERCISE LIBRARY
-- =====================================================================
CREATE TABLE exercise_library (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id   uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name         text NOT NULL,
  category     text NOT NULL CHECK (category IN ('push','pull','legs','core','cardio')),
  video_url    text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, name)
);

ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercise_library_owned" ON exercise_library
  FOR ALL
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

-- =====================================================================
-- PLAN EXERCISES
-- =====================================================================
CREATE TABLE plan_exercises (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id               uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  cycle_number          int NOT NULL,
  week_number           int NOT NULL,
  day_key               text NOT NULL CHECK (day_key IN
                          ('mon','tue','wed','thu','fri','sat','sun')),
  library_exercise_id   uuid REFERENCES exercise_library(id) ON DELETE SET NULL,
  exercise_name         text NOT NULL,
  sets_reps             text,
  notes                 text,
  order_index           int NOT NULL DEFAULT 0,
  is_rest_day           bool NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pe_grid ON plan_exercises(plan_id, cycle_number, week_number, day_key, order_index);

ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_exercises_via_plan" ON plan_exercises
  FOR ALL
  USING (plan_id IN (SELECT id FROM plans WHERE trainer_id = auth.uid()))
  WITH CHECK (plan_id IN (SELECT id FROM plans WHERE trainer_id = auth.uid()));

-- =====================================================================
-- NUTRITION
-- =====================================================================
CREATE TABLE nutrition_plans (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id        uuid NOT NULL UNIQUE REFERENCES plans(id) ON DELETE CASCADE,
  calories       int NOT NULL DEFAULT 0,
  protein_g      int NOT NULL DEFAULT 0,
  carbs_g        int NOT NULL DEFAULT 0,
  fats_g         int NOT NULL DEFAULT 0,
  coach_notes    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_plans_via_plan" ON nutrition_plans
  FOR ALL
  USING (plan_id IN (SELECT id FROM plans WHERE trainer_id = auth.uid()))
  WITH CHECK (plan_id IN (SELECT id FROM plans WHERE trainer_id = auth.uid()));

CREATE TABLE nutrition_meals (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutrition_plan_id   uuid NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  name                text NOT NULL,
  notes               text,
  order_index         int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nutrition_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_meals_via_plan" ON nutrition_meals
  FOR ALL
  USING (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ))
  WITH CHECK (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ));

CREATE TABLE nutrition_meal_variants (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id       uuid NOT NULL REFERENCES nutrition_meals(id) ON DELETE CASCADE,
  label         text NOT NULL,
  order_index   int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nutrition_meal_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_meal_variants_via_plan" ON nutrition_meal_variants
  FOR ALL
  USING (meal_id IN (
    SELECT nm.id FROM nutrition_meals nm
    JOIN nutrition_plans np ON np.id = nm.nutrition_plan_id
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ))
  WITH CHECK (meal_id IN (
    SELECT nm.id FROM nutrition_meals nm
    JOIN nutrition_plans np ON np.id = nm.nutrition_plan_id
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ));

CREATE TABLE nutrition_foods (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id   uuid NOT NULL REFERENCES nutrition_meal_variants(id) ON DELETE CASCADE,
  name         text NOT NULL,
  quantity     text,
  calories     int NOT NULL DEFAULT 0,
  protein_g    int NOT NULL DEFAULT 0,
  carbs_g      int NOT NULL DEFAULT 0,
  fats_g       int NOT NULL DEFAULT 0,
  fiber_g      int NOT NULL DEFAULT 0,
  order_index  int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nutrition_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_foods_via_plan" ON nutrition_foods
  FOR ALL
  USING (variant_id IN (
    SELECT nmv.id FROM nutrition_meal_variants nmv
    JOIN nutrition_meals nm ON nm.id = nmv.meal_id
    JOIN nutrition_plans np ON np.id = nm.nutrition_plan_id
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ))
  WITH CHECK (variant_id IN (
    SELECT nmv.id FROM nutrition_meal_variants nmv
    JOIN nutrition_meals nm ON nm.id = nmv.meal_id
    JOIN nutrition_plans np ON np.id = nm.nutrition_plan_id
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ));

CREATE TABLE hunger_substitutions (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutrition_plan_id   uuid NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  text                text NOT NULL,
  order_index         int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hunger_substitutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hunger_substitutions_via_plan" ON hunger_substitutions
  FOR ALL
  USING (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ))
  WITH CHECK (nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  ));

-- =====================================================================
-- CONVERSATIONS + MESSAGES
-- =====================================================================
CREATE TABLE conversations (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id                uuid NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  last_message_at          timestamptz,
  last_message_preview     text,
  last_message_from_bot    bool DEFAULT false,
  unread_count             int NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_via_client" ON conversations
  FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()));

CREATE TABLE messages (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id          uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type              text NOT NULL CHECK (sender_type IN
                             ('bot','trainer','client','system')),
  kind                     text NOT NULL CHECK (kind IN
                             ('text','voice','image','document')),
  text                     text,
  voice_url                text,
  voice_length_seconds     int,
  image_url                text,
  document_url             text,
  document_name            text,
  document_size_bytes      int,
  document_kind            text CHECK (document_kind IN
                             ('workout','nutrition','other')),
  document_pages           int,
  whatsapp_message_id      text,
  sent_at                  timestamptz NOT NULL DEFAULT now(),
  delivered_at             timestamptz,
  read_at                  timestamptz
);

CREATE INDEX idx_messages_thread ON messages(conversation_id, sent_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_via_client" ON messages
  FOR ALL
  USING (conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  ))
  WITH CHECK (conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  ));

-- =====================================================================
-- ESCALATIONS
-- =====================================================================
CREATE TABLE escalations (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id          uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  triggered_by_message_id  uuid REFERENCES messages(id) ON DELETE SET NULL,
  category                 text NOT NULL CHECK (category IN
                             ('medical','off_topic','compliance','other')),
  reason_badge             text NOT NULL,
  why_escalated            text NOT NULL,
  status                   text NOT NULL DEFAULT 'open'
                             CHECK (status IN ('open','resolved','dismissed')),
  resolved_at              timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_esc_open ON escalations(conversation_id, status)
  WHERE status = 'open';

ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "escalations_via_client" ON escalations
  FOR ALL
  USING (conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  ))
  WITH CHECK (conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  ));

CREATE TABLE escalation_suggested_replies (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  escalation_id   uuid NOT NULL REFERENCES escalations(id) ON DELETE CASCADE,
  text            text NOT NULL,
  order_index     int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE escalation_suggested_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "escalation_replies_via_client" ON escalation_suggested_replies
  FOR ALL
  USING (escalation_id IN (
    SELECT e.id FROM escalations e
    JOIN conversations c ON c.id = e.conversation_id
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  ))
  WITH CHECK (escalation_id IN (
    SELECT e.id FROM escalations e
    JOIN conversations c ON c.id = e.conversation_id
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  ));

-- =====================================================================
-- LOGS
-- =====================================================================
CREATE TABLE check_ins (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  for_date      date NOT NULL,
  weight_kg     numeric(5,1),
  sleep_hours   numeric(3,1),
  energy_1_10   int CHECK (energy_1_10 BETWEEN 1 AND 10),
  notes         text,
  logged_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, for_date)
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "check_ins_via_client" ON check_ins
  FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()));

CREATE TABLE workout_logs (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_exercise_id    uuid REFERENCES plan_exercises(id) ON DELETE SET NULL,
  exercise_name       text NOT NULL,
  sets_reps_done      text,
  logged_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_logs_via_client" ON workout_logs
  FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()));

CREATE TABLE food_logs (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  meal_label          text,
  parsed_foods        jsonb DEFAULT '[]'::jsonb,
  total_calories      int,
  total_protein_g     int,
  total_carbs_g       int,
  total_fats_g        int,
  photo_url           text,
  logged_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_logs_via_client" ON food_logs
  FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()));

-- =====================================================================
-- PAYMENTS
-- =====================================================================
CREATE TABLE payments (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id                uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_assignment_id       uuid REFERENCES plan_assignments(id) ON DELETE SET NULL,
  amount_inr               int NOT NULL,
  status                   text NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','paid','failed','refunded')),
  method                   text CHECK (method IN ('upi','card','netbanking','wallet')),
  razorpay_order_id        text,
  razorpay_payment_id      text,
  due_date                 date,
  paid_at                  timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_via_client" ON payments
  FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid()));

-- =====================================================================
-- CALL LOGS
-- =====================================================================
CREATE TABLE call_logs (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  trainer_id        uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id         uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  called_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_logs_owned" ON call_logs
  FOR ALL
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

-- =====================================================================
-- NOTIFICATIONS
-- =====================================================================
CREATE TABLE notifications (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id     uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  type           text NOT NULL CHECK (type IN
                   ('escalation','activity','payment','warning')),
  text           text NOT NULL,
  href           text,
  read_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_unread ON notifications(trainer_id, created_at DESC)
  WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_owned" ON notifications
  FOR ALL
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

-- =====================================================================
-- UPDATED_AT TRIGGER
-- =====================================================================
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trainers_touch
  BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER clients_touch
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER exercise_library_touch
  BEFORE UPDATE ON exercise_library
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER nutrition_plans_touch
  BEFORE UPDATE ON nutrition_plans
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
