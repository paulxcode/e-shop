CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_read_public" ON reviews FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND user_id = auth.uid()
);

CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE USING (
  user_id = auth.uid()
);

CREATE POLICY "reviews_delete_admin" ON reviews FOR DELETE USING (
  public.is_admin()
);
