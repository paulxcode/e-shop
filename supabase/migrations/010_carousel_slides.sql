-- 1. Carousel Slides
CREATE TABLE carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT,
  link_type TEXT NOT NULL CHECK (link_type IN ('category', 'product', 'custom')),
  link_value TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carousel_select_public"
  ON carousel_slides FOR SELECT
  USING (true);

CREATE POLICY "carousel_insert_admin"
  ON carousel_slides FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "carousel_update_admin"
  ON carousel_slides FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "carousel_delete_admin"
  ON carousel_slides FOR DELETE
  USING (auth.role() = 'authenticated');
