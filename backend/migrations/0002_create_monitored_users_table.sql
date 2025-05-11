-- Create monitored_users table for tracking suspicious activity
CREATE TABLE IF NOT EXISTS "monitored_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" text NOT NULL,
  "operation_count" integer NOT NULL,
  "time_period" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone,
  "resolved_by" uuid REFERENCES "users"("id"),
  "resolution_notes" text
);

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS "monitored_users_user_id_idx" ON "monitored_users" ("user_id");
CREATE INDEX IF NOT EXISTS "monitored_users_is_active_idx" ON "monitored_users" ("is_active");
CREATE INDEX IF NOT EXISTS "monitored_users_created_at_idx" ON "monitored_users" ("created_at"); 