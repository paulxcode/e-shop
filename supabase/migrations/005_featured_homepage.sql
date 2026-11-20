ALTER TABLE categories
ADD COLUMN IF NOT EXISTS featured_home boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_categories_featured_home
ON categories(featured_home);
