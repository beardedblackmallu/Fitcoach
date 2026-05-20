# FitCoach — Database schema

Designed for **Supabase (managed Postgres)**. Could equally run on plain Postgres anywhere, but Supabase gives you Auth, Storage, and Row Level Security out of the box, which match this app's needs precisely.

This document covers:
1. The big picture (what tables exist and how they relate)
2. Each table's purpose, columns, and indexes
3. Row Level Security model (so trainer A can never read trainer B's data)
4. A complete SQL migration in the appendix

> If you're using this to brief an engineer: hand them this file plus `PRD.md`. They have what they need to scope the build.

---

## 1. Big picture

```
auth.users (Supabase managed)
    │
    ├─► trainers           (one-to-one with auth.users)
    │       │
    │       ├─► clients              (the trainer's roster)
    │       │       │
    │       │       ├─► conversations  ──► messages         ──► escalations
    │       │       ├─► plan_assignments ◄── plans
    │       │       ├─► check_ins
    │       │       ├─► workout_logs
    │       │       ├─► food_logs
    │       │       ├─► payments
    │       │       └─► call_logs
    │       │
    │       ├─► plans
    │       │       │
    │       │       ├─► plan_exercises   (cycle/week/day grid)
    │       │       ├─► nutrition_plans  (1:1 with plan)
    │       │       │       │
    │       │       │       ├─► nutrition_meals
    │       │       │       │       │
    │       │       │       │       └─► nutrition_meal_variants
    │       │       │       │               │
    │       │       │       │               └─► nutrition_foods
    │       │       │       │
    │       │       │       └─► hunger_substitutions
    │       │
    │       ├─► exercise_library  (per-trainer exercises + video URLs)
    │       │
    │       └─► notifications
```

Everything cascades from `trainers`. Every row in every table either belongs directly to a trainer or to one of their clients/plans. This makes Row Level Security clean — `trainer_id = auth.uid()` is the universal filter.

---

## 2. Tables

### `trainers`

The platform's primary account. One row per signed-up coach.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | References `auth.users.id` (Supabase auth) |
| `name` | text | "Sandeep Kumar" |
| `business_phone` | text | The WhatsApp Business number, e.g. `+91 98765 12345` |
| `bio` | text | Public bio shown on intake / onboarding |
| `specialties` | text[] | E.g. `{"strength","fat loss"}` |
| `city` | text | "Bengaluru" |
| `timezone` | text | IANA, e.g. `Asia/Kolkata` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `clients`

The trainer's roster. Clients don't have logins — they're identified by their WhatsApp phone number.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `trainer_id` | uuid FK → trainers | The owning coach |
| `name` | text | Full name |
| `phone` | text | E.164 format. Unique within trainer. The lookup key for inbound WhatsApp messages |
| `email` | text | Optional |
| `date_of_birth` | date | Optional |
| `gender` | text | 'Male' / 'Female' / 'Prefer not to say' |
| `height_cm` | numeric(5,1) | |
| `status` | text | 'active' / 'paused' / 'expired' |
| `goal` | text | Free text |
| `weight_start_kg` | numeric(5,1) | |
| `weight_current_kg` | numeric(5,1) | Updated by daily check-ins |
| `weight_target_kg` | numeric(5,1) | |
| `joined_at` | date | |
| `diet_preference` | text | 'Vegetarian' / 'Non-vegetarian' / 'Eggetarian' / 'Vegan' |
| `workout_preference` | text | 'Gym' / 'Home' / 'Hybrid' |
| `whey_use` | text | 'Yes' / 'No' / 'Not sure' |
| `allergies` | text | Intake form free text |
| `injuries` | text | Intake form free text |
| `medical_conditions` | text | Intake form free text |
| `intake_notes` | text | Anything else |
| `last_message_at` | timestamptz | Updated on every inbound/outbound message. Drives "last active Xh ago" |
| `avatar_color` | text | Tailwind class, e.g. `bg-rose-500`. Computed on creation. |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Indexes**
- `(trainer_id, status)` — for client list filtering
- `(trainer_id, phone)` UNIQUE — for webhook lookups + dedup

### `plans`

A trainer's workout + nutrition plan. Either a reusable template or a one-off custom plan for one client.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `trainer_id` | uuid FK → trainers | |
| `name` | text | "12-Week Transformation" |
| `description` | text | Optional |
| `duration_weeks` | int | E.g. 12 |
| `cycle_length_weeks` | int | E.g. 4 |
| `type` | text | 'template' / 'custom' |
| `last_edited_at` | timestamptz | |
| `archived_at` | timestamptz | Soft delete |
| `created_at` | timestamptz | |

**Computed**
- `cycles` is derived: `CEIL(duration_weeks / cycle_length_weeks)` — never stored, always computed.

### `plan_assignments`

Many-to-many join between `plans` and `clients`. A client can be on multiple plans over time; a plan can have many clients.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `plan_id` | uuid FK → plans | |
| `client_id` | uuid FK → clients | |
| `start_date` | date | Defaults to next Monday at creation |
| `status` | text | 'active' / 'completed' / 'paused' / 'cancelled' |
| `current_week` | int | Computed from start_date + today, but cached for speed |
| `assigned_at` | timestamptz | |
| `completed_at` | timestamptz | Nullable |

**Indexes**
- `(client_id, status)` — for the "Week 3 of X" badge lookup
- `(plan_id, status)`

### `plan_exercises`

Each exercise instance in the workout grid. Cycle × Week × Day positions an exercise.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `plan_id` | uuid FK → plans | |
| `cycle_number` | int | 1-N |
| `week_number` | int | 1-N within cycle |
| `day_key` | text | 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' |
| `library_exercise_id` | uuid FK → exercise_library | Nullable — the link back to the library row (where the video lives) |
| `exercise_name` | text | Denormalized for read speed; can be edited per-instance without breaking the library link |
| `sets_reps` | text | "4×8 @ 80kg" — kept as free text for trainer flexibility |
| `notes` | text | Form cues |
| `order_index` | int | Position within the day |
| `is_rest_day` | bool | If true, the row represents a rest day marker rather than an exercise |
| `created_at` | timestamptz | |

**Indexes**
- `(plan_id, cycle_number, week_number, day_key, order_index)` — covers all grid reads

### `exercise_library`

Per-trainer exercise catalog. The library is the source of truth for form videos — adding a video here applies to every plan that uses this exercise.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `trainer_id` | uuid FK → trainers | |
| `name` | text | "Squat" |
| `category` | text | 'push' / 'pull' / 'legs' / 'core' / 'cardio' |
| `video_url` | text | Nullable. YouTube only (validated app-side) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Indexes**
- `(trainer_id, name)` UNIQUE

### `nutrition_plans`

One per `plan`. Macros + meals live here.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `plan_id` | uuid FK → plans, UNIQUE | One-to-one with plan |
| `calories` | int | |
| `protein_g` | int | |
| `carbs_g` | int | |
| `fats_g` | int | |
| `coach_notes` | text | "Use only 1-1.5 tsp oil per meal..." |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `nutrition_meals`

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `nutrition_plan_id` | uuid FK | |
| `name` | text | "Meal 1 — Breakfast" |
| `notes` | text | Optional. "e.g., 30 min before workout" |
| `order_index` | int | |
| `created_at` | timestamptz | |

### `nutrition_meal_variants`

A meal has 1+ variants. The first is "Primary option"; trainer can add "Alternative 1 (OR)", "Alternative 2 (OR)", etc.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `meal_id` | uuid FK | |
| `label` | text | "Primary option" or "Alternative N (OR)" |
| `order_index` | int | 0 = primary |
| `created_at` | timestamptz | |

### `nutrition_foods`

One row per food item in a variant.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `variant_id` | uuid FK | |
| `name` | text | "Idly" |
| `quantity` | text | "2 pieces" |
| `calories` | int | |
| `protein_g` | int | |
| `carbs_g` | int | |
| `fats_g` | int | |
| `fiber_g` | int | |
| `order_index` | int | |
| `created_at` | timestamptz | |

### `hunger_substitutions`

Free-text bullet list per nutrition plan.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `nutrition_plan_id` | uuid FK | |
| `text` | text | "1 protein bar" |
| `order_index` | int | |
| `created_at` | timestamptz | |

### `conversations`

One per client. Aggregates messages for display and tracks last activity / unread count.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK → clients, UNIQUE | |
| `last_message_at` | timestamptz | |
| `last_message_preview` | text | Truncated. Drives the list left-pane preview |
| `last_message_from_bot` | bool | For the bot icon on the list row |
| `unread_count` | int | Reset to 0 when trainer opens the thread |
| `created_at` | timestamptz | |

### `messages`

Every bot, trainer, client, system, and document message ever exchanged.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `conversation_id` | uuid FK | |
| `sender_type` | text | 'bot' / 'trainer' / 'client' / 'system' |
| `kind` | text | 'text' / 'voice' / 'image' / 'document' |
| `text` | text | Nullable, used for text/system and as caption for image |
| `voice_url` | text | Supabase Storage URL |
| `voice_length_seconds` | int | |
| `image_url` | text | Supabase Storage URL |
| `document_url` | text | Supabase Storage URL |
| `document_name` | text | Display filename |
| `document_size_bytes` | int | |
| `document_kind` | text | 'workout' / 'nutrition' / 'other' |
| `document_pages` | int | For the PDF metadata line |
| `whatsapp_message_id` | text | Returned by AiSensy. Used for delivery + read receipts |
| `sent_at` | timestamptz | |
| `delivered_at` | timestamptz | Nullable. Updated by WhatsApp webhook |
| `read_at` | timestamptz | Nullable. Updated by WhatsApp webhook |

**Indexes**
- `(conversation_id, sent_at DESC)` — for thread reads

### `escalations`

Bot-triggered handoffs to the trainer.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `conversation_id` | uuid FK | |
| `triggered_by_message_id` | uuid FK → messages | The client message that triggered the escalation |
| `category` | text | 'medical' / 'off_topic' / 'compliance' / 'other' |
| `reason_badge` | text | "Medical concern detected" |
| `why_escalated` | text | Long-form explanation |
| `status` | text | 'open' / 'resolved' / 'dismissed' |
| `resolved_at` | timestamptz | Nullable |
| `created_at` | timestamptz | |

**Indexes**
- `(conversation_id, status)` — for Inbox queries

### `escalation_suggested_replies`

Pre-generated reply options shown under each escalation.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `escalation_id` | uuid FK | |
| `text` | text | The proposed reply |
| `order_index` | int | |
| `created_at` | timestamptz | |

### `check_ins`

Daily morning check-in data submitted by the client.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK | |
| `for_date` | date | The day the check-in is for |
| `weight_kg` | numeric(5,1) | |
| `sleep_hours` | numeric(3,1) | |
| `energy_1_10` | int | |
| `notes` | text | |
| `logged_at` | timestamptz | |

**Indexes**
- `(client_id, for_date DESC)` UNIQUE

### `workout_logs`

When a client logs a workout via WhatsApp.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK | |
| `plan_exercise_id` | uuid FK → plan_exercises | Nullable (may not match if client did something off-plan) |
| `exercise_name` | text | Denormalized |
| `sets_reps_done` | text | What they actually completed |
| `logged_at` | timestamptz | |

### `food_logs`

When a client sends a meal photo or describes a meal.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK | |
| `meal_label` | text | "Lunch" — inferred or explicit |
| `parsed_foods` | jsonb | `[{name, quantity, calories, protein_g, ...}]` |
| `total_calories` | int | |
| `total_protein_g` | int | |
| `total_carbs_g` | int | |
| `total_fats_g` | int | |
| `photo_url` | text | Supabase Storage URL |
| `logged_at` | timestamptz | |

### `payments`

Razorpay-backed records.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK | |
| `plan_assignment_id` | uuid FK → plan_assignments | Nullable |
| `amount_inr` | int | In paise (Indian smallest unit) to avoid float math |
| `status` | text | 'pending' / 'paid' / 'failed' / 'refunded' |
| `method` | text | 'upi' / 'card' / 'netbanking' / 'wallet' |
| `razorpay_order_id` | text | |
| `razorpay_payment_id` | text | Nullable |
| `due_date` | date | |
| `paid_at` | timestamptz | Nullable |
| `created_at` | timestamptz | |

### `call_logs`

When the trainer uses Tap-to-call. Just a record of intent — actual calls happen on the trainer's personal phone.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `conversation_id` | uuid FK | |
| `trainer_id` | uuid FK | |
| `client_id` | uuid FK | |
| `called_at` | timestamptz | |

### `notifications`

For the bell-dropdown stream. Generated by triggers / cron / webhook handlers.

| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `trainer_id` | uuid FK | |
| `type` | text | 'escalation' / 'activity' / 'payment' / 'warning' |
| `text` | text | "Anita Desai needs attention — mentioned knee pain" |
| `href` | text | "/inbox" |
| `read_at` | timestamptz | Nullable |
| `created_at` | timestamptz | |

**Indexes**
- `(trainer_id, created_at DESC) WHERE read_at IS NULL` — partial index for badge count

---

## 3. Row Level Security

Supabase ships with RLS. Every table needs a policy. The pattern:

```sql
-- Every table that has trainer_id directly
CREATE POLICY "trainers see their own" ON <table>
  FOR ALL USING (trainer_id = auth.uid());

-- For tables that hang off clients (messages, escalations, etc.)
CREATE POLICY "trainers see via client ownership" ON conversations
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE trainer_id = auth.uid()
    )
  );
```

Apply this to every table. The result: even if your API has a bug, Postgres physically refuses to return another trainer's data. Crucial for trust.

---

## 4. Storage buckets

Supabase Storage. Three buckets:

- **`voice-notes/`** — `{trainer_id}/{conversation_id}/{message_id}.ogg`
- **`food-photos/`** — `{trainer_id}/{client_id}/{message_id}.jpg`
- **`plan-pdfs/`** — `{trainer_id}/{plan_id}/{workout|nutrition}-v{N}.pdf`

Each bucket has RLS policies matching the table they reference.

---

## 5. Real-time subscriptions

Supabase provides Postgres LISTEN/NOTIFY out of the box. Subscribe the dashboard to:

- `messages` filtered by trainer → new client messages appear in Conversations live
- `escalations` filtered by trainer → new escalations push into the Inbox + Dashboard live
- `notifications` filtered by trainer → bell badge increments live

No polling needed.

---

## 6. Migration sequence

When you implement this, do it in this order to minimize rework:

1. `trainers` + auth.users link
2. `clients` (the rest of the app reads from this)
3. `conversations` + `messages` (so the WhatsApp webhook has somewhere to write)
4. `exercise_library`
5. `plans` + `plan_assignments` + `plan_exercises`
6. `nutrition_plans` + `nutrition_meals` + `nutrition_meal_variants` + `nutrition_foods` + `hunger_substitutions`
7. `escalations` + `escalation_suggested_replies`
8. `check_ins`, `workout_logs`, `food_logs`
9. `payments` (Razorpay integration is its own project)
10. `call_logs`, `notifications`

You can hook up the dashboard to tables 1-3 in week one and start dogfooding with real data while the rest is built.

---

## Appendix — Full SQL migration

```sql
-- =====================================================================
-- FitCoach schema — Supabase Postgres
-- =====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----- TRAINERS -----
CREATE TABLE trainers (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  business_phone  text NOT NULL,
  bio             text,
  specialties     text[] DEFAULT '{}',
  city            text,
  timezone        text NOT NULL DEFAULT 'Asia/Kolkata',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self" ON trainers FOR ALL USING (id = auth.uid());

-- ----- CLIENTS -----
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
CREATE POLICY "owned" ON clients FOR ALL USING (trainer_id = auth.uid());

-- ----- PLANS -----
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
CREATE POLICY "owned" ON plans FOR ALL USING (trainer_id = auth.uid());

-- ----- PLAN ASSIGNMENTS -----
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
CREATE POLICY "via client" ON plan_assignments FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid())
);

-- ----- EXERCISE LIBRARY -----
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
CREATE POLICY "owned" ON exercise_library FOR ALL USING (trainer_id = auth.uid());

-- ----- PLAN EXERCISES -----
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
CREATE POLICY "via plan" ON plan_exercises FOR ALL USING (
  plan_id IN (SELECT id FROM plans WHERE trainer_id = auth.uid())
);

-- ----- NUTRITION -----
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
CREATE POLICY "via plan" ON nutrition_plans FOR ALL USING (
  plan_id IN (SELECT id FROM plans WHERE trainer_id = auth.uid())
);

CREATE TABLE nutrition_meals (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutrition_plan_id   uuid NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  name                text NOT NULL,
  notes               text,
  order_index         int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE nutrition_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via plan" ON nutrition_meals FOR ALL USING (
  nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  )
);

CREATE TABLE nutrition_meal_variants (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id       uuid NOT NULL REFERENCES nutrition_meals(id) ON DELETE CASCADE,
  label         text NOT NULL,
  order_index   int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE nutrition_meal_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via plan" ON nutrition_meal_variants FOR ALL USING (
  meal_id IN (
    SELECT nm.id FROM nutrition_meals nm
    JOIN nutrition_plans np ON np.id = nm.nutrition_plan_id
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  )
);

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
CREATE POLICY "via plan" ON nutrition_foods FOR ALL USING (
  variant_id IN (
    SELECT nmv.id FROM nutrition_meal_variants nmv
    JOIN nutrition_meals nm ON nm.id = nmv.meal_id
    JOIN nutrition_plans np ON np.id = nm.nutrition_plan_id
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  )
);

CREATE TABLE hunger_substitutions (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutrition_plan_id   uuid NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  text                text NOT NULL,
  order_index         int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE hunger_substitutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via plan" ON hunger_substitutions FOR ALL USING (
  nutrition_plan_id IN (
    SELECT np.id FROM nutrition_plans np
    JOIN plans p ON p.id = np.plan_id
    WHERE p.trainer_id = auth.uid()
  )
);

-- ----- CONVERSATIONS + MESSAGES -----
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
CREATE POLICY "via client" ON conversations FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid())
);

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
CREATE POLICY "via conv" ON messages FOR ALL USING (
  conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  )
);

-- ----- ESCALATIONS -----
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
CREATE POLICY "via conv" ON escalations FOR ALL USING (
  conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  )
);

CREATE TABLE escalation_suggested_replies (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  escalation_id   uuid NOT NULL REFERENCES escalations(id) ON DELETE CASCADE,
  text            text NOT NULL,
  order_index     int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE escalation_suggested_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via esc" ON escalation_suggested_replies FOR ALL USING (
  escalation_id IN (
    SELECT e.id FROM escalations e
    JOIN conversations c ON c.id = e.conversation_id
    JOIN clients cl ON cl.id = c.client_id
    WHERE cl.trainer_id = auth.uid()
  )
);

-- ----- LOGS -----
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
CREATE POLICY "via client" ON check_ins FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid())
);

CREATE TABLE workout_logs (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_exercise_id    uuid REFERENCES plan_exercises(id) ON DELETE SET NULL,
  exercise_name       text NOT NULL,
  sets_reps_done      text,
  logged_at           timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via client" ON workout_logs FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid())
);

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
CREATE POLICY "via client" ON food_logs FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid())
);

-- ----- PAYMENTS -----
CREATE TABLE payments (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id                uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_assignment_id       uuid REFERENCES plan_assignments(id) ON DELETE SET NULL,
  amount_inr               int NOT NULL, -- in paise
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
CREATE POLICY "via client" ON payments FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE trainer_id = auth.uid())
);

-- ----- CALL LOGS, NOTIFICATIONS -----
CREATE TABLE call_logs (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  trainer_id        uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id         uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  called_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owned" ON call_logs FOR ALL USING (trainer_id = auth.uid());

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
CREATE POLICY "owned" ON notifications FOR ALL USING (trainer_id = auth.uid());

-- ----- UPDATED_AT TRIGGERS -----
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trainers_touch BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER clients_touch BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER exercise_library_touch BEFORE UPDATE ON exercise_library
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER nutrition_plans_touch BEFORE UPDATE ON nutrition_plans
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
```
