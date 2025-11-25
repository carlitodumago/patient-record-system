-- Update Notification table schema to support all required fields
-- Run this script in your Supabase SQL Editor

-- Add missing columns to Notification table if they don't exist
ALTER TABLE "Notification"
ADD COLUMN IF NOT EXISTS "Title" TEXT,
ADD COLUMN IF NOT EXISTS "Type" TEXT DEFAULT 'system_alert',
ADD COLUMN IF NOT EXISTS "Priority" TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS "Status" TEXT DEFAULT 'sent',
ADD COLUMN IF NOT EXISTS "ScheduledFor" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "SentAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "IsRead" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "ActionRequired" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "RelatedAppointmentID" INTEGER,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON "Notification"("UserID");
CREATE INDEX IF NOT EXISTS idx_notification_type ON "Notification"("Type");
CREATE INDEX IF NOT EXISTS idx_notification_status ON "Notification"("Status");
CREATE INDEX IF NOT EXISTS idx_notification_priority ON "Notification"("Priority");
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON "Notification"("CreatedAt");
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON "Notification"("IsRead");

-- Add comments for documentation
COMMENT ON COLUMN "Notification"."Title" IS 'Notification title/subject';
COMMENT ON COLUMN "Notification"."Type" IS 'Type of notification: appointment_reminder, system_alert, medical_record, account_update';
COMMENT ON COLUMN "Notification"."Priority" IS 'Priority level: low, normal, high';
COMMENT ON COLUMN "Notification"."Status" IS 'Status: sent, pending, failed';
COMMENT ON COLUMN "Notification"."ScheduledFor" IS 'Scheduled send time for future notifications';
COMMENT ON COLUMN "Notification"."SentAt" IS 'Actual send time';
COMMENT ON COLUMN "Notification"."IsRead" IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN "Notification"."ActionRequired" IS 'Whether the notification requires user action';
COMMENT ON COLUMN "Notification"."RelatedAppointmentID" IS 'Related appointment ID if applicable';

-- Update existing records to have proper default values
UPDATE "Notification"
SET
  "Title" = COALESCE("Title", 'Notification'),
  "Type" = COALESCE("Type", 'system_alert'),
  "Priority" = COALESCE("Priority", 'normal'),
  "Status" = COALESCE("Status", 'sent'),
  "IsRead" = COALESCE("IsRead", FALSE),
  "updated_at" = NOW()
WHERE "Title" IS NULL OR "Type" IS NULL OR "Priority" IS NULL OR "Status" IS NULL;