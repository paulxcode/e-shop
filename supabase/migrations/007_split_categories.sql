-- 007_split_categories.sql
-- Split broad categories into granular sub-categories under category_groups

-- Step 1: Insert new sub-categories linked to their parent groups
INSERT INTO categories (name, slug, image, group_id)
SELECT v.name, v.slug, v.image, cg.id
FROM (VALUES
  ('laptop-tablete-telefoane', 'Laptop', 'laptop', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Laptop'),
  ('laptop-tablete-telefoane', 'Tablete', 'tablete', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Tablete'),
  ('laptop-tablete-telefoane', 'Telefoane', 'telefoane', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Telefoane'),
  ('pc-periferice-software', 'PC-uri', 'pc-uri', 'https://placehold.co/400x300/DD700B/FCFBD8?text=PC-uri'),
  ('pc-periferice-software', 'Periferice', 'periferice', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Periferice'),
  ('pc-periferice-software', 'Software', 'software', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Software'),
  ('tv-audio-video-foto', 'TV', 'tv', 'https://placehold.co/400x300/DD700B/FCFBD8?text=TV'),
  ('tv-audio-video-foto', 'Audio-Video', 'audio-video', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Audio-Video'),
  ('tv-audio-video-foto', 'Foto', 'foto', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Foto'),
  ('electrocasnice-climatizare', 'Electrocasnice', 'electrocasnice', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Electrocasnice'),
  ('electrocasnice-climatizare', 'Climatizare', 'climatizare', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Climatizare'),
  ('gaming-carti-birotica', 'Gaming', 'gaming', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Gaming'),
  ('gaming-carti-birotica', 'Cărți', 'carti', 'https://placehold.co/400x300/DD700B/FCFBD8?text=C%C4%83r%C8%9Bi'),
  ('gaming-carti-birotica', 'Birotică', 'birotica', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Birotic%C4%83'),
  ('bacanie', 'Bacanie', 'bacanie', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Bacanie'),
  ('fashion', 'Fashion', 'fashion', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Fashion'),
  ('ingrijire-cosmetice', 'Îngrijire personală', 'ingrijire-personala', 'https://placehold.co/400x300/DD700B/FCFBD8?text=%C3%8Engrijire%20Personal%C4%83'),
  ('ingrijire-cosmetice', 'Cosmetice', 'cosmetice', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Cosmetice'),
  ('casa-gradina-bricolaj', 'Casă', 'casa', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Cas%C4%83'),
  ('casa-gradina-bricolaj', 'Grădină', 'gradina', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Gr%C4%83din%C4%83'),
  ('casa-gradina-bricolaj', 'Bricolaj', 'bricolaj', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Bricolaj'),
  ('sport-travel', 'Sport', 'sport', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Sport'),
  ('sport-travel', 'Travel', 'travel', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Travel'),
  ('auto-moto-rca', 'Auto', 'auto', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Auto'),
  ('auto-moto-rca', 'Moto', 'moto', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Moto'),
  ('auto-moto-rca', 'RCA', 'rca', 'https://placehold.co/400x300/DD700B/FCFBD8?text=RCA'),
  ('jucarii-copii-bebe', 'Jucării', 'jucarii', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Juc%C4%83rii'),
  ('jucarii-copii-bebe', 'Copii', 'copii', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Copii'),
  ('jucarii-copii-bebe', 'Bebe', 'bebe', 'https://placehold.co/400x300/DD700B/FCFBD8?text=Bebe')
) AS v(group_slug, name, slug, image)
JOIN category_groups cg ON cg.slug = v.group_slug
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Reassign products to sub-categories
-- Group 1 — Laptop, Tablete & Telefoane
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'laptop')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'laptop-tablete-telefoane')
  AND name ILIKE 'Laptop%';

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'tablete')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'laptop-tablete-telefoane')
  AND (name ILIKE 'Tablet%' OR name ILIKE 'E-Reader%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'telefoane')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'laptop-tablete-telefoane')
  AND category_id != (SELECT id FROM categories WHERE slug = 'telefoane');

-- Group 2 — PC, Periferice & Software
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'pc-uri')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'pc-periferice-software')
  AND name ILIKE 'PC %';

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'software')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'pc-periferice-software')
  AND (name ILIKE 'Microsoft%' OR name ILIKE 'Antivirus%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'periferice')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'pc-periferice-software')
  AND category_id != (SELECT id FROM categories WHERE slug = 'periferice');

-- Group 3 — TV, Audio-Video & Foto
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'tv')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'tv-audio-video-foto')
  AND name ILIKE 'Televizor%';

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'foto')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'tv-audio-video-foto')
  AND (name ILIKE 'Aparat foto%' OR name ILIKE 'Lentil%' OR name ILIKE 'Camera video%' OR name ILIKE 'Card memorie%' OR name ILIKE 'Trepied%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'audio-video')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'tv-audio-video-foto')
  AND category_id != (SELECT id FROM categories WHERE slug = 'audio-video');

-- Group 4 — Electrocasnice & Climatizare
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'climatizare')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'electrocasnice-climatizare')
  AND (name ILIKE 'Aer condi%' OR name ILIKE 'Purificator aer%' OR name ILIKE 'Dezumidificator%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'electrocasnice')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'electrocasnice-climatizare')
  AND category_id != (SELECT id FROM categories WHERE slug = 'electrocasnice');

-- Group 5 — Gaming, Cărți & Birotică
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'gaming')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'gaming-carti-birotica')
  AND (name ILIKE 'Consol%' OR name ILIKE 'Joc %' OR name ILIKE 'Tastatura gaming%' OR name ILIKE 'Mousepad gaming%' OR name ILIKE 'Scaun gaming%' OR name ILIKE 'Controller%' OR name ILIKE 'Nintendo%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'carti')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'gaming-carti-birotica')
  AND (name ILIKE 'Carte %' OR name ILIKE 'Set cărți%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'birotica')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'gaming-carti-birotica')
  AND category_id != (SELECT id FROM categories WHERE slug = 'birotica');

-- Group 6 — Bacanie (single sub-category, same slug)
-- No update needed — products already reference 'bacanie'

-- Group 7 — Fashion (single sub-category, same slug)
-- No update needed — products already reference 'fashion'

-- Group 8 — Îngrijire personală & Cosmetice
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'ingrijire-personala')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'ingrijire-cosmetice')
  AND (name ILIKE '%parfum%' OR name ILIKE 'Sampon%' OR name ILIKE 'Balsam%' OR name ILIKE 'Aparat epilat%' OR name ILIKE 'Periuza%' OR name ILIKE 'Aparat de ras%' OR name ILIKE 'Trimmer%' OR name ILIKE 'Set cadou%' OR name ILIKE 'Deodorant%' OR name ILIKE 'Gel dus%' OR name ILIKE 'Trusa manichiura%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'cosmetice')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'ingrijire-cosmetice')
  AND category_id != (SELECT id FROM categories WHERE slug = 'cosmetice');

-- Group 9 — Casă, Grădină & Bricolaj
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'gradina')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'casa-gradina-bricolaj')
  AND (name ILIKE 'Masă de grădină%' OR name ILIKE 'Sezlong%' OR name ILIKE 'Unelte grădinărit%' OR name ILIKE 'Masina de tuns iarba%' OR name ILIKE 'Furtun%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'bricolaj')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'casa-gradina-bricolaj')
  AND (name ILIKE 'Scule electrice%' OR name ILIKE 'Vopsea%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'casa')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'casa-gradina-bricolaj')
  AND category_id != (SELECT id FROM categories WHERE slug = 'casa');

-- Group 10 — Sport & Travel
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'travel')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'sport-travel')
  AND (name ILIKE 'Valiză%' OR name ILIKE 'Rucsac drumetie%' OR name ILIKE 'Husa telefon%' OR name ILIKE 'Set prosop%' OR name ILIKE 'Adaptor de călătorie%' OR name ILIKE 'Pahar termic%' OR name ILIKE 'Saltea camping%' OR name ILIKE 'Set cani camping%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'sport')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'sport-travel')
  AND category_id != (SELECT id FROM categories WHERE slug = 'sport');

-- Group 11 — Auto, Moto & RCA
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'moto')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'auto-moto-rca')
  AND (name ILIKE 'Casca moto%' OR name ILIKE 'Manusi moto%' OR name ILIKE 'Geaca moto%' OR name ILIKE 'Topcase%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'rca')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'auto-moto-rca')
  AND (name ILIKE 'Kit prim ajutor%' OR name ILIKE 'Triunghi%' OR name ILIKE 'Stingator%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'auto')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'auto-moto-rca')
  AND category_id != (SELECT id FROM categories WHERE slug = 'auto');

-- Group 12 — Jucării, Copii & Bebe
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'copii')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'jucarii-copii-bebe')
  AND (name ILIKE 'Cărucior%' OR name ILIKE 'Scaunel auto%' OR name ILIKE 'Pătuț%' OR name ILIKE 'Mobilă bebe%' OR name ILIKE 'Set hăinuțe%' OR name ILIKE 'Jucărie sonoră%' OR name ILIKE 'Set cărți educaționale%' OR name ILIKE 'Trotinetă copii%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'bebe')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'jucarii-copii-bebe')
  AND (name ILIKE 'Set creioane%');

UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = 'jucarii')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'jucarii-copii-bebe')
  AND category_id != (SELECT id FROM categories WHERE slug = 'jucarii');

-- Step 3: Delete old broad categories
DELETE FROM categories WHERE slug IN (
  'laptop-tablete-telefoane',
  'pc-periferice-software',
  'tv-audio-video-foto',
  'electrocasnice-climatizare',
  'gaming-carti-birotica',
  'bacanie',
  'fashion',
  'ingrijire-cosmetice',
  'casa-gradina-bricolaj',
  'sport-travel',
  'auto-moto-rca',
  'jucarii-copii-bebe'
);

-- Step 4: Enable RLS and add read policy for category_groups
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'category_groups'
    AND policyname = 'category_groups_read_public'
  ) THEN
    CREATE POLICY "category_groups_read_public"
    ON category_groups
    FOR SELECT
    USING (true);
  END IF;
END $$;
