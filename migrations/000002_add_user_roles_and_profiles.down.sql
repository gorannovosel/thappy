-- Drop triggers
DROP TRIGGER IF EXISTS update_therapist_profiles_updated_at ON therapist_profiles;
DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON client_profiles;

-- Drop indexes
DROP INDEX IF EXISTS idx_therapist_profiles_name;
DROP INDEX IF EXISTS idx_therapist_profiles_specializations;
DROP INDEX IF EXISTS idx_therapist_profiles_accepting;
DROP INDEX IF EXISTS idx_therapist_profiles_license;

DROP INDEX IF EXISTS idx_client_profiles_name;
DROP INDEX IF EXISTS idx_client_profiles_user_id;
DROP INDEX IF EXISTS idx_client_profiles_therapist_id;

-- Drop tables
DROP TABLE IF EXISTS therapist_profiles;
DROP TABLE IF EXISTS client_profiles;

-- Drop user table indexes
DROP INDEX IF EXISTS idx_users_role_active;
DROP INDEX IF EXISTS idx_users_active;
DROP INDEX IF EXISTS idx_users_role;

-- Remove columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS is_active;
ALTER TABLE users DROP COLUMN IF EXISTS role;