-- Add attribution columns for Google Ads offline conversion import
-- gclid = Google Click ID, fbclid = Facebook Click ID, landing_url = first page visited
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gclid TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_url TEXT;
