-- Fix: Exclude manually-created CRM leads from catchup bot scanner.
-- Manual leads (interaction_type = 'manual') should NOT receive WhatsApp bot messages.
-- Only form-submitted leads that missed botStartFlow should be caught up.

CREATE OR REPLACE FUNCTION scan_and_trigger_catchup_bot()
RETURNS TEXT AS $$
DECLARE
  lead_record RECORD;
  service_key TEXT;
  supabase_url TEXT;
  triggered_count INTEGER := 0;
BEGIN
  supabase_url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
  service_key := get_service_role_key();

  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not found in vault';
  END IF;

  FOR lead_record IN
    SELECT id, name, phone, source_page
    FROM leads
    WHERE flow_type IS NULL
      AND bot_current_step IS NULL
      AND phone IS NOT NULL
      AND phone != ''
      AND created_at >= NOW() - INTERVAL '2 hours'
      AND created_at <= NOW() - INTERVAL '30 seconds'
      AND source = 'sales_portal'
      AND interaction_type != 'manual'
    LIMIT 10
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/botStartFlow',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key,
        'apikey', service_key
      ),
      body := jsonb_build_object(
        'lead_id', lead_record.id,
        'lead_name', lead_record.name,
        'phone', lead_record.phone,
        'page_slug', COALESCE(lead_record.source_page, 'open-osek-patur')
      )
    );
    triggered_count := triggered_count + 1;
  END LOOP;

  RETURN 'Catchup bot triggered for ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
