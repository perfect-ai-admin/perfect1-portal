-- QA: full Tranzila → fulfillment chain status
SELECT 'CRON: ' || jobname AS check_name,
       CASE WHEN active THEN '✅ ' || schedule ELSE '❌ INACTIVE' END AS status
FROM cron.job
WHERE jobname IN ('followup_abandoned_checkout', 'followup_link_clicked_no_pay',
                  'followup_post_payment_onboarding', 'catchup_bot', 'followup-tick')
UNION ALL
SELECT 'IPN_KEY config',
  CASE WHEN EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name='tranzila_ipn_key')
       THEN '✅ in vault' ELSE '⚠️ check Edge Function secrets' END
UNION ALL
SELECT 'Payments completed (30d)',
  COUNT(*)::text FROM payments WHERE status='completed' AND created_at >= NOW() - INTERVAL '30 days'
UNION ALL
SELECT '  └── linked to a lead',
  COALESCE(SUM(CASE WHEN lead_id IS NOT NULL THEN 1 ELSE 0 END)::text || ' / ' || COUNT(*)::text, '0/0')
  FROM payments WHERE status='completed' AND created_at >= NOW() - INTERVAL '30 days'
UNION ALL
SELECT 'Pending payments now', COUNT(*)::text FROM payments WHERE status='pending'
UNION ALL
SELECT 'Failed payments (24h)', COUNT(*)::text FROM payments WHERE status='failed' AND created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
-- Verify post-payment WhatsApp messages were sent for recent successful payments
SELECT 'Post-payment WhatsApp (7d)',
  (SELECT COUNT(*)::text FROM whatsapp_messages w
   WHERE w.direction='outbound'
     AND w.raw_payload->>'source' = 'fulfillPayment'
     AND w.created_at >= NOW() - INTERVAL '7 days')
UNION ALL
SELECT 'Post-payment Tasks created (7d)',
  (SELECT COUNT(*)::text FROM tasks WHERE task_type='post_purchase_followup' AND created_at >= NOW() - INTERVAL '7 days');
