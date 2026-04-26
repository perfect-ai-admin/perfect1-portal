-- Gmail Inbox Poller — cron job every 2 minutes
-- Requires: pg_cron and pg_net extensions enabled in Supabase dashboard

-- Remove existing job if any
SELECT cron.unschedule('gmail-inbox-poller')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gmail-inbox-poller');

-- Schedule gmail poller every 2 minutes
SELECT cron.schedule(
  'gmail-inbox-poller',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co/functions/v1/gmailInboxPoller',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njc0NjMsImV4cCI6MjA5MDQ0MzQ2M30.NceenXJ43_B3NN9MVz4b5wR4t1Si0hRfYedfmtoujXQ"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
