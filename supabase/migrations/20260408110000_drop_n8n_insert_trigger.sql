-- Migration: drop_n8n_insert_trigger
-- Date: 2026-04-08
-- סיבה: Edge Function submitLeadToN8N שולחת webhook ישירות ל-n8n בכל INSERT.
-- ה-DB trigger trg_notify_n8n_new_lead יוצר כפילות הודעות WhatsApp.
-- ה-UPDATE trigger (trg_notify_n8n_lead_change) נשאר — הוא מטפל בשינויי סטטוס בלבד.

-- Rollback:
-- CREATE TRIGGER trg_notify_n8n_new_lead
--   AFTER INSERT ON leads
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_n8n_new_lead();

DROP TRIGGER IF EXISTS trg_notify_n8n_new_lead ON leads;
