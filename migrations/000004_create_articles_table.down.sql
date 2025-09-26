-- Drop trigger first
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;

-- Drop indexes
DROP INDEX IF EXISTS idx_articles_category_published;
DROP INDEX IF EXISTS idx_articles_slug;
DROP INDEX IF EXISTS idx_articles_published_date;
DROP INDEX IF EXISTS idx_articles_category;
DROP INDEX IF EXISTS idx_articles_is_published;

-- Drop table
DROP TABLE IF EXISTS articles;