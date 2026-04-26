-- Add new platforms to platform_connections table
-- Extends the platform constraint to include: linkedin, pinterest, google_business, telegram, x, threads, snapchat, reddit

ALTER TABLE platform_connections DROP CONSTRAINT IF EXISTS platform_connections_platform_check;

ALTER TABLE platform_connections ADD CONSTRAINT platform_connections_platform_check
  CHECK (platform IN (
    'facebook',
    'instagram',
    'tiktok',
    'youtube',
    'linkedin',
    'pinterest',
    'google_business',
    'telegram',
    'x',
    'threads',
    'whatsapp',
    'snapchat',
    'reddit'
  ));

-- Add index on platform column for better query performance
CREATE INDEX IF NOT EXISTS idx_platform_connections_platform ON platform_connections(platform);
