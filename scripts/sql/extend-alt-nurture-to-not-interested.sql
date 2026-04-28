-- Extend alt-services nurture to also trigger on 'not_interested' (not just
-- 'nurture_alt'). Operator no longer has to remember to pick the special
-- stage — every "no thanks" lead gets the 4-step alt nurture by default.
--
-- The existing 'stop_on_not_interested' rule still runs (priority 10)
-- and clears any active follow_up_nurture sequence + sets
-- followup_paused=true. This new rule fires after (priority 50) and
-- starts the alt sequence + sets followup_paused=false. Both run on the
-- same status_change event because executeRule reads the lead snapshot
-- once at dispatch time.

INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
) VALUES (
  'alt_nurture_init_from_not_interested',
  'Alt-services nurture — also start sequence when status changes to not_interested',
  'status_change',
  '{"to_status":"not_interested"}'::jsonb,
  '[]'::jsonb,
  'update_lead',
  '{
    "patch": {
      "followup_sequence_name": "alt_nurture",
      "followup_sequence_step": 1,
      "next_followup_date": "+7d",
      "followup_paused": false,
      "do_not_contact": false
    }
  }'::jsonb,
  0, 1, 60, true
) ON CONFLICT (name) DO UPDATE SET
  trigger_config = EXCLUDED.trigger_config,
  action_config = EXCLUDED.action_config,
  is_active = true;
