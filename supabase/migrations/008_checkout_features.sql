-- 1. Shipping methods
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  estimated_days_min INT DEFAULT 2,
  estimated_days_max INT DEFAULT 5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO shipping_methods (name, description, price, estimated_days_min, estimated_days_max) VALUES
  ('Standard', 'Livrare la domiciliu în 2-5 zile lucrătoare', 15.00, 2, 5),
  ('Express', 'Livrare în 1-2 zile lucrătoare', 35.00, 1, 2),
  ('Ridicare personală', 'Ridici comanda din magazinul nostru', 0.00, 0, 0);

-- 2. Supported locations
CREATE TABLE supported_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county TEXT NOT NULL,
  city TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  UNIQUE(county, city)
);

INSERT INTO supported_locations (county, city) VALUES
  ('Alba', 'Alba Iulia'), ('Alba', 'Sebeș'), ('Alba', 'Aiud'),
  ('Arad', 'Arad'), ('Arad', 'Ineu'),
  ('Argeș', 'Pitești'), ('Argeș', 'Câmpulung'),
  ('Bacău', 'Bacău'), ('Bacău', 'Onești'), ('Bacău', 'Moinești'),
  ('Bihor', 'Oradea'), ('Bihor', 'Salonta'),
  ('Bistrița-Năsăud', 'Bistrița'),
  ('Botoșani', 'Botoșani'), ('Botoșani', 'Dorohoi'),
  ('Brașov', 'Brașov'), ('Brașov', 'Săcele'), ('Brașov', 'Făgăraș'),
  ('Brăila', 'Brăila'),
  ('București', 'București'),
  ('Buzău', 'Buzău'), ('Buzău', 'Râmnicu Sărat'),
  ('Caraș-Severin', 'Reșița'), ('Caraș-Severin', 'Caransebeș'),
  ('Călărași', 'Călărași'), ('Călărași', 'Oltenița'),
  ('Cluj', 'Cluj-Napoca'), ('Cluj', 'Turda'), ('Cluj', 'Dej'),
  ('Constanța', 'Constanța'), ('Constanța', 'Mangalia'), ('Constanța', 'Medgidia'),
  ('Covasna', 'Sfântu Gheorghe'),
  ('Dâmbovița', 'Târgoviște'), ('Dâmbovița', 'Moreni'),
  ('Dolj', 'Craiova'), ('Dolj', 'Calafat'),
  ('Galați', 'Galați'), ('Galați', 'Tecuci'),
  ('Giurgiu', 'Giurgiu'),
  ('Gorj', 'Târgu Jiu'), ('Gorj', 'Motru'),
  ('Harghita', 'Miercurea Ciuc'), ('Harghita', 'Odorheiu Secuiesc'),
  ('Hunedoara', 'Deva'), ('Hunedoara', 'Hunedoara'), ('Hunedoara', 'Petroșani'),
  ('Ialomița', 'Slobozia'),
  ('Iași', 'Iași'), ('Iași', 'Podu Iloaiei'),
  ('Ilfov', 'Buftea'), ('Ilfov', 'Voluntari'),
  ('Maramureș', 'Baia Mare'), ('Maramureș', 'Sighetu Marmației'),
  ('Mehedinți', 'Drobeta-Turnu Severin'), ('Mehedinți', 'Orșova'),
  ('Mureș', 'Târgu Mureș'), ('Mureș', 'Sighișoara'),
  ('Neamț', 'Piatra Neamț'), ('Neamț', 'Roman'),
  ('Olt', 'Slatina'), ('Olt', 'Caracal'),
  ('Prahova', 'Ploiești'), ('Prahova', 'Câmpina'), ('Prahova', 'Brazi'),
  ('Satu Mare', 'Satu Mare'), ('Satu Mare', 'Carei'),
  ('Sălaj', 'Zalău'),
  ('Sibiu', 'Sibiu'), ('Sibiu', 'Mediaș'),
  ('Suceava', 'Suceava'), ('Suceava', 'Rădăuți'), ('Suceava', 'Fălticeni'),
  ('Teleorman', 'Alexandria'), ('Teleorman', 'Roșiorii de Vede'),
  ('Timiș', 'Timișoara'), ('Timiș', 'Lugoj'),
  ('Tulcea', 'Tulcea'),
  ('Vâlcea', 'Râmnicu Vâlcea'), ('Vâlcea', 'Drăgășani'),
  ('Vaslui', 'Vaslui'), ('Vaslui', 'Bârlad'),
  ('Vrancea', 'Focșani'), ('Vrancea', 'Adjud');

-- 3. Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'product')),
  applies_to_id UUID,
  single_use_per_user BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Coupon usage tracking
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Orders table additions
ALTER TABLE orders ADD COLUMN shipping_method_id UUID REFERENCES shipping_methods(id);
ALTER TABLE orders ADD COLUMN shipping_price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN discount NUMERIC(10,2) DEFAULT 0;

-- 6. RLS
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipping_methods_read_public" ON shipping_methods FOR SELECT USING (true);
CREATE POLICY "shipping_methods_write_admin" ON shipping_methods FOR ALL USING (public.is_admin());

ALTER TABLE supported_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supported_locations_read_public" ON supported_locations FOR SELECT USING (true);
CREATE POLICY "supported_locations_write_admin" ON supported_locations FOR ALL USING (public.is_admin());

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_read_admin" ON coupons FOR SELECT USING (public.is_admin());
CREATE POLICY "coupons_write_admin" ON coupons FOR ALL USING (public.is_admin());

ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupon_usage_read_admin" ON coupon_usage FOR SELECT USING (public.is_admin());
CREATE POLICY "coupon_usage_read_own" ON coupon_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "coupon_usage_insert" ON coupon_usage FOR INSERT WITH CHECK (user_id = auth.uid());
