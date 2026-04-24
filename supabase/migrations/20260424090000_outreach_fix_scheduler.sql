-- ============================================================
-- Outreach: Fix scheduler bug + update subject lines + cancel competitors
-- 2026-04-24
-- ============================================================

-- 1. Add scheduled_for column to outreach_messages (if missing)
ALTER TABLE outreach_messages
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- 2. Update subject lines — anti-spam
-- outreach_email_templates uses `type` column: 'initial','followup','barter','paid_link','link_exchange'
-- followup_1 and followup_2 both have type='followup', so update by name pattern
UPDATE outreach_email_templates
SET
  subject_template = CASE
    WHEN type = 'initial'                                   THEN 'שאלה קצרה על האתר {{domain}}'
    WHEN type = 'followup' AND name ILIKE '%1%'             THEN 'בהמשך למייל הקודם'
    WHEN type = 'followup' AND name ILIKE '%2%'             THEN 'עדכון אחרון'
    WHEN type = 'followup'                                  THEN 'בהמשך למייל הקודם'
    ELSE subject_template
  END,
  updated_at = NOW()
WHERE is_active = true;

-- 3. Cancel queued messages to competitor niches (accounting/bookkeeping)
UPDATE outreach_messages om
SET status = 'cancelled', updated_at = NOW()
WHERE om.status = 'queued'
  AND om.website_id IN (
    SELECT id FROM outreach_websites
    WHERE niche ILIKE ANY(ARRAY[
      '%רואה חשבון%',
      '%רו"ח%',
      '%accountant%',
      '%accounting%',
      '%bookkeeping%',
      '%הנהלת חשבונות%',
      '%רואי חשבון%'
    ])
  );

-- 4. Schedule the remaining 204 queued messages:
--    Distribute them starting tomorrow, 12/day, 09:00-15:00 Israel (06:00-12:00 UTC)
--    Using row_number() to assign slots
DO $$
DECLARE
  v_campaign_id UUID;
  v_daily_limit INT := 12;
  v_base_date DATE := CURRENT_DATE + INTERVAL '1 day';
  v_rec RECORD;
  v_row_num INT := 0;
  v_day_offset INT;
  v_minute_offset INT;
  v_scheduled TIMESTAMPTZ;
BEGIN
  -- Get the active campaign (assume one campaign for now)
  SELECT id INTO v_campaign_id
  FROM outreach_campaigns
  WHERE status = 'active'
  LIMIT 1;

  IF v_campaign_id IS NULL THEN
    RAISE NOTICE 'No active campaign found — skipping schedule_queued migration';
    RETURN;
  END IF;

  FOR v_rec IN
    SELECT id
    FROM outreach_messages
    WHERE campaign_id = v_campaign_id
      AND status = 'queued'
      AND scheduled_for IS NULL
    ORDER BY created_at ASC
  LOOP
    v_day_offset    := v_row_num / v_daily_limit;           -- which day (0-based)
    v_minute_offset := (v_row_num % v_daily_limit) * 35;    -- 35 min apart within the day

    -- 06:00 UTC = 09:00 Israel + offset
    v_scheduled := (v_base_date + v_day_offset * INTERVAL '1 day')::TIMESTAMPTZ
                   + INTERVAL '6 hours'
                   + (v_minute_offset || ' minutes')::INTERVAL;

    UPDATE outreach_messages
    SET
      scheduled_for = v_scheduled,
      status        = 'approved',
      updated_at    = NOW()
    WHERE id = v_rec.id;

    v_row_num := v_row_num + 1;
  END LOOP;

  RAISE NOTICE 'Scheduled % queued messages starting %', v_row_num, v_base_date;
END $$;

-- 5. Verify: show summary
SELECT
  status,
  COUNT(*) AS cnt,
  MIN(scheduled_for) AS earliest,
  MAX(scheduled_for) AS latest
FROM outreach_messages
GROUP BY status
ORDER BY cnt DESC;
