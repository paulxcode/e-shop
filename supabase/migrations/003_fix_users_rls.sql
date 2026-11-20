-- Permite utilizatorilor autentificați să-și creeze propriul profil
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());
