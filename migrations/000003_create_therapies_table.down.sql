DROP TRIGGER IF EXISTS update_therapies_updated_at ON therapies;
DROP INDEX IF EXISTS idx_therapies_created_at;
DROP INDEX IF EXISTS idx_therapies_is_active;
DROP TABLE IF EXISTS therapies;