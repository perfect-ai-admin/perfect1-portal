-- ============================================================
-- Outreach: pg_cron jobs for sending + followup
-- 2026-04-24
-- ============================================================

-- Remove existing outreach cron jobs (idempotent)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname IN (
  'outreach-send-approved',
  'outreach-schedule-queued',
  'outreach-followup-dispatch'
);

-- 1. Send approved messages — runs every hour Mon-Fri 09:00-17:00 Israel (06:00-14:00 UTC)
--    Cron: every hour at :05 minutes, UTC 06-14, Mon-Fri
SELECT cron.schedule(
  'outreach-send-approved',
  '5 6-14 * * 1-5',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/outreachMessages',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := '{"action":"send_approved"}'::jsonb
  );
  $$
);

-- 2. Schedule queued → approved — runs once at 05:30 UTC (08:30 Israel) daily
--    Picks up any new queued messages and assigns scheduled_for dates
SELECT cron.schedule(
  'outreach-schedule-queued',
  '30 5 * * 1-5',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/outreachMessages',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := '{"action":"schedule_queued"}'::jsonb
  );
  $$
);

-- 3. Followup dispatch — runs once at 06:00 UTC (09:00 Israel) daily Mon-Fri
SELECT cron.schedule(
  'outreach-followup-dispatch',
  '0 6 * * 1-5',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/outreachFollowupDispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := '{}'::jsonb
  );
  $$
);
