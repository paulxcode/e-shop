-- 1. User Favorites
CREATE TABLE user_favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select_own" ON user_favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "favorites_insert_own" ON user_favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "favorites_delete_own" ON user_favorites FOR DELETE USING (user_id = auth.uid());

-- 2. Shared Wishlists
CREATE TABLE shared_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shared_wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared_wishlists_select_own" ON shared_wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "shared_wishlists_insert_own" ON shared_wishlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "shared_wishlists_select_public" ON shared_wishlists FOR SELECT USING (true);

-- 3. Review Votes
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (review_id, user_id)
);

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_votes_select_public" ON review_votes FOR SELECT USING (true);
CREATE POLICY "review_votes_insert_own" ON review_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "review_votes_update_own" ON review_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "review_votes_delete_own" ON review_votes FOR DELETE USING (user_id = auth.uid());

-- 4. Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_insert" ON analytics_events FOR INSERT WITH CHECK (true);
