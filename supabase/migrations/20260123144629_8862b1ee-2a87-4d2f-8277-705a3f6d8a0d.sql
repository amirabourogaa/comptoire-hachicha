-- Note: JWT expiry time is configured at the project level in Supabase settings
-- This migration adds a comment for documentation purposes
-- The actual JWT expiry configuration needs to be set via Supabase dashboard or API

-- For reference: To set 48-hour session duration:
-- 1. Go to Authentication > Settings in the dashboard
-- 2. Set "JWT Expiry Limit" to 172800 (48 hours in seconds)

COMMENT ON SCHEMA public IS 'Admin session configured for 48-hour duration. Configure JWT expiry in Auth settings.';