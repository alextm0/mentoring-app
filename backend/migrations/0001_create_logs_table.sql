-- Create logs table for user activity monitoring
CREATE TABLE IF NOT EXISTS "logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "details" text,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS "logs_user_id_idx" ON "logs" ("user_id");
CREATE INDEX IF NOT EXISTS "logs_entity_type_entity_id_idx" ON "logs" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "logs_created_at_idx" ON "logs" ("created_at"); 