-- Categorii
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Produse
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 0,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Utilizatori
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comenzi
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total NUMERIC(10,2) NOT NULL,
  shipping_address JSONB DEFAULT '{}',
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Iteme comandă
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL
);

-- Functie admin check (SECURITY DEFINER evita recursiunea RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS: categorii
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_read_public" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_write_admin" ON categories FOR ALL USING (public.is_admin());

-- RLS: produse
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_read_public" ON products FOR SELECT USING (true);
CREATE POLICY "products_write_admin" ON products FOR ALL USING (public.is_admin());

-- RLS: users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_read_admin" ON users FOR SELECT USING (public.is_admin());
CREATE POLICY "users_write_own" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_write_admin" ON users FOR ALL USING (public.is_admin());
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- RLS: comenzi
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_read_own" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_read_admin" ON orders FOR SELECT USING (public.is_admin());
CREATE POLICY "orders_write_own" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_write_admin" ON orders FOR UPDATE USING (public.is_admin());

-- RLS: order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_read_own" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "order_items_read_admin" ON order_items FOR SELECT USING (public.is_admin());
CREATE POLICY "order_items_write" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Trigger: actualizare updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
