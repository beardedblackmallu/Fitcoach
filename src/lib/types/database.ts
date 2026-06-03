// TypeScript types matching the Supabase Postgres schema.
// Field names are snake_case to match column names exactly.
// Add fields here as new columns are added to the DB.

export type DbClientStatus = "active" | "paused" | "expired";

export interface DbClient {
  id: string;
  trainer_id: string;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: "Male" | "Female" | "Prefer not to say" | null;
  height_cm: number | null;
  status: DbClientStatus;
  goal: string | null;
  weight_start_kg: number | null;
  weight_current_kg: number | null;
  weight_target_kg: number | null;
  joined_at: string;
  diet_preference: "Vegetarian" | "Non-vegetarian" | "Eggetarian" | "Vegan" | null;
  workout_preference: "Gym" | "Home" | "Hybrid" | null;
  whey_use: "Yes" | "No" | "Not sure" | null;
  allergies: string | null;
  injuries: string | null;
  medical_conditions: string | null;
  intake_notes: string | null;
  last_message_at: string | null;
  avatar_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPlanAssignment {
  id: string;
  plan_id: string;
  client_id: string;
  status: "active" | "completed" | "paused" | "cancelled";
  start_date: string;
  current_week: number | null;
  assigned_at: string;
  completed_at: string | null;
}

export interface DbPlan {
  id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  cycle_length_weeks: number;
  type: "template" | "custom";
  last_edited_at: string;
  archived_at: string | null;
  created_at: string;
}
