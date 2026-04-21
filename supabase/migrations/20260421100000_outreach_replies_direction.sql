-- Add direction column to outreach_replies if not exists
ALTER TABLE outreach_replies
  ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'inbound'
    CHECK (direction IN ('inbound', 'outbound'));

-- Add ai_suggested_reply column if not exists (used by outreachInboundReply)
ALTER TABLE outreach_replies
  ADD COLUMN IF NOT EXISTS ai_suggested_reply text;
