-- =============================================================
-- Add card info columns to subscriptions
-- Card number is NEVER stored — only last 4 digits, brand, and Tranzila token.
-- IDEMPOTENT.
-- =============================================================
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS card_last4 varchar(4);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS card_brand varchar(20);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tranzila_token text;
