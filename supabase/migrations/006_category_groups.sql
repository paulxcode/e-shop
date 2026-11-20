CREATE TABLE IF NOT EXISTS category_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO category_groups (name, slug)
VALUES
  ('Laptop, Tablete & Telefoane', 'laptop-tablete-telefoane'),
  ('PC, Periferice & Software', 'pc-periferice-software'),
  ('TV, Audio-Video & Foto', 'tv-audio-video-foto'),
  ('Electrocasnice & Climatizare', 'electrocasnice-climatizare'),
  ('Gaming, Cărți & Birotică', 'gaming-carti-birotica'),
  ('Bacanie', 'bacanie'),
  ('Fashion', 'fashion'),
  ('Îngrijire personală & Cosmetice', 'ingrijire-cosmetice'),
  ('Casă, Grădină & Bricolaj', 'casa-gradina-bricolaj'),
  ('Sport & Travel', 'sport-travel'),
  ('Auto, Moto & RCA', 'auto-moto-rca'),
  ('Jucării, Copii & Bebe', 'jucarii-copii-bebe')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES category_groups(id) ON DELETE SET NULL;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES category_groups(id) ON DELETE SET NULL;

UPDATE categories c
SET group_id = cg.id
FROM category_groups cg
WHERE c.group_id IS NULL
  AND c.slug = cg.slug;

UPDATE products p
SET group_id = c.group_id
FROM categories c
WHERE p.category_id = c.id
  AND p.group_id IS NULL;

CREATE OR REPLACE FUNCTION sync_product_group_from_category()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.category_id IS NULL THEN
    NEW.group_id := NULL;
  ELSE
    SELECT group_id INTO NEW.group_id
    FROM categories
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_product_group_from_category ON products;
CREATE TRIGGER trg_sync_product_group_from_category
BEFORE INSERT OR UPDATE OF category_id
ON products
FOR EACH ROW
EXECUTE FUNCTION sync_product_group_from_category();

CREATE INDEX IF NOT EXISTS idx_categories_group_id ON categories(group_id);
CREATE INDEX IF NOT EXISTS idx_products_group_id ON products(group_id);
