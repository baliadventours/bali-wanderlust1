
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS (Safe creation)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'editor', 'customer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
    END IF;
END $$;

-- 2. CORE TABLES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  image_url TEXT,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tour_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS tour_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  destination_id UUID REFERENCES destinations(id),
  category_id UUID REFERENCES tour_categories(id),
  tour_type_id UUID REFERENCES tour_types(id),
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  summary JSONB,
  base_price_usd DECIMAL(12,2) NOT NULL,
  duration_minutes INT NOT NULL,
  max_participants INT NOT NULL,
  difficulty difficulty_level DEFAULT 'beginner',
  images TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  avg_rating DECIMAL(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Ensure columns exist if table was already created in an earlier step
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tours' AND column_name='avg_rating') THEN
        ALTER TABLE tours ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 5.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tours' AND column_name='review_count') THEN
        ALTER TABLE tours ADD COLUMN review_count INT DEFAULT 0;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS tour_itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  location_name TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS tour_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  available_spots INT NOT NULL,
  total_spots INT NOT NULL,
  price_override_usd DECIMAL(12,2),
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS seasonal_pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  multiplier DECIMAL(4,2) DEFAULT 1.0,
  fixed_override_usd DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tour_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  title JSONB NOT NULL,
  description JSONB,
  unit_price_usd DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id),
  availability_id UUID REFERENCES tour_availability(id),
  status booking_status DEFAULT 'pending',
  total_amount_usd DECIMAL(12,2) NOT NULL,
  currency_code TEXT DEFAULT 'USD',
  currency_amount DECIMAL(12,2),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id),
  tour_id UUID REFERENCES tours(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone.') THEN
        CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile.') THEN
        CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 4. TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED DATA (BALI 20 TOURS)
INSERT INTO destinations (slug, name, image_url) VALUES
('bali', '{"en": "Bali", "es": "Bali"}', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;

INSERT INTO tour_categories (slug, name) VALUES
('adventure', '{"en": "Adventure", "es": "Aventura"}'),
('cultural', '{"en": "Cultural", "es": "Cultural"}'),
('wellness', '{"en": "Wellness", "es": "Bienestar"}'),
('luxury', '{"en": "Luxury", "es": "Lujo"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tour_types (slug, name) VALUES
('hiking', '{"en": "Hiking", "es": "Senderismo"}'),
('water-sports', '{"en": "Water Sports", "es": "Deportes Acuáticos"}'),
('photography', '{"en": "Photography", "es": "Fotografía"}'),
('spiritual', '{"en": "Spiritual", "es": "Espiritual"}'),
('foodie', '{"en": "Foodie", "es": "Gastronomía"}')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
    dest_bali UUID := (SELECT id FROM destinations WHERE slug = 'bali');
    cat_adv UUID := (SELECT id FROM tour_categories WHERE slug = 'adventure');
    cat_cul UUID := (SELECT id FROM tour_categories WHERE slug = 'cultural');
    cat_wel UUID := (SELECT id FROM tour_categories WHERE slug = 'wellness');
    cat_lux UUID := (SELECT id FROM tour_categories WHERE slug = 'luxury');
    typ_hik UUID := (SELECT id FROM tour_types WHERE slug = 'hiking');
    typ_wat UUID := (SELECT id FROM tour_types WHERE slug = 'water-sports');
    typ_pho UUID := (SELECT id FROM tour_types WHERE slug = 'photography');
    typ_spi UUID := (SELECT id FROM tour_types WHERE slug = 'spiritual');
    typ_foo UUID := (SELECT id FROM tour_types WHERE slug = 'foodie');
BEGIN
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES 
    ('ubud-jungle-highlights', dest_bali, cat_cul, typ_pho, '{"en": "Ubud Jungle & Sacred Monkey Forest"}', '{"en": "Explore the lush heart of Bali."}', 45, 480, 10, 'beginner', '{"https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=800"}', true, true, 4.9, 1205),
    ('mt-batur-sunrise', dest_bali, cat_adv, typ_hik, '{"en": "Mount Batur Sunrise Trek"}', '{"en": "Hike an active volcano."}', 65, 600, 15, 'intermediate', '{"https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800"}', true, true, 4.8, 850),
    ('nusa-penida-best', dest_bali, cat_adv, typ_pho, '{"en": "Nusa Penida Day Trip"}', '{"en": "Most famous coastline."}', 85, 720, 8, 'intermediate', '{"https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800"}', true, true, 4.9, 2100),
    ('uluwatu-sunset', dest_bali, cat_cul, typ_spi, '{"en": "Uluwatu Sunset & Fire Dance"}', '{"en": "Dramatic cliff performance."}', 35, 300, 20, 'beginner', '{"https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?auto=format&fit=crop&q=80&w=800"}', true, false, 4.7, 540),
    ('gate-of-heaven', dest_bali, cat_cul, typ_pho, '{"en": "Lempuyang Gate of Heaven"}', '{"en": "Iconic photo spot."}', 55, 600, 10, 'beginner', '{"https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=800"}', true, false, 4.5, 980),
    ('tirta-empul-blessing', dest_bali, cat_wel, typ_spi, '{"en": "Holy Water Blessing"}', '{"en": "Traditional ritual."}', 40, 360, 6, 'beginner', '{"https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800"}', true, false, 4.9, 320),
    ('ayung-rafting', dest_bali, cat_adv, typ_wat, '{"en": "Ayung White Water Rafting"}', '{"en": "Wild rapids in Ubud."}', 50, 240, 30, 'intermediate', '{"https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=800"}', true, false, 4.6, 1100),
    ('tanah-lot-sunset', dest_bali, cat_cul, typ_pho, '{"en": "Tanah Lot Sunset"}', '{"en": "Temple on the sea."}', 30, 300, 15, 'beginner', '{"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800"}', true, false, 4.7, 720),
    ('lovina-dolphins', dest_bali, cat_adv, typ_wat, '{"en": "Lovina Dolphin Tour"}', '{"en": "Wild dolphins at sunrise."}', 45, 480, 12, 'beginner', '{"https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800"}', true, false, 4.4, 430),
    ('cave-dinner', dest_bali, cat_lux, typ_spi, '{"en": "Romantic Cave Dinner"}', '{"en": "Private luxury dining."}', 450, 180, 2, 'beginner', '{"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"}', true, false, 5.0, 15),
    ('breakfast-orangutan', dest_bali, cat_cul, typ_foo, '{"en": "Breakfast with Orangutans"}', '{"en": "Dine with kings of the jungle."}', 75, 180, 20, 'beginner', '{"https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800"}', true, false, 4.8, 210),
    ('canggu-surf', dest_bali, cat_adv, typ_wat, '{"en": "Canggu Surf Lesson"}', '{"en": "Master the waves."}', 40, 120, 4, 'beginner', '{"https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800"}', true, false, 4.9, 89),
    ('sekumpul-trek', dest_bali, cat_adv, typ_hik, '{"en": "Sekumpul Waterfall Trek"}', '{"en": "Balis tallest waterfall."}', 60, 480, 8, 'advanced', '{"https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800"}', true, false, 4.9, 156),
    ('seminyak-food', dest_bali, cat_cul, typ_foo, '{"en": "Seminyak Night Market"}', '{"en": "Local food tour."}', 35, 180, 12, 'beginner', '{"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"}', true, false, 4.7, 67),
    ('sidemen-valley', dest_bali, cat_wel, typ_hik, '{"en": "Sidemen Valley Trek"}', '{"en": "Untouched rice terraces."}', 40, 300, 10, 'intermediate', '{"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800"}', true, false, 4.9, 34),
    ('cooking-class', dest_bali, cat_cul, typ_foo, '{"en": "Ubud Cooking Class"}', '{"en": "Balinese spices secrets."}', 45, 240, 15, 'beginner', '{"https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"}', true, false, 5.0, 128),
    ('atv-adventure', dest_bali, cat_adv, typ_wat, '{"en": "Bali ATV Quad Bike"}', '{"en": "Jungles and mud."}', 55, 180, 20, 'intermediate', '{"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}', true, false, 4.6, 88),
    ('jatiluwih-cycling', dest_bali, cat_adv, typ_hik, '{"en": "Jatiluwih UNESCO Cycling"}', '{"en": "Spectacular scenery."}', 65, 240, 10, 'beginner', '{"https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=800"}', true, false, 4.9, 56),
    ('menjangan-snorkel', dest_bali, cat_adv, typ_wat, '{"en": "Menjangan Snorkeling"}', '{"en": "Best marine life."}', 95, 600, 8, 'beginner', '{"https://images.unsplash.com/photo-1544551763-47a15950c57f?auto=format&fit=crop&q=80&w=800"}', true, false, 4.8, 22),
    ('heli-tour', dest_bali, cat_lux, typ_pho, '{"en": "Helicopter Coastline Flight"}', '{"en": "Aerial views of Uluwatu."}', 550, 20, 4, 'beginner', '{"https://images.unsplash.com/photo-1464037862834-ee5772642398?auto=format&fit=crop&q=80&w=800"}', true, true, 5.0, 8)
    ON CONFLICT (slug) DO NOTHING;
END $$;
