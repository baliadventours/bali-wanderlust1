
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
  highlights TEXT[] DEFAULT '{}',
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

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

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id),
  tour_id UUID REFERENCES tours(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HELPER FUNCTIONS
-- Use this to promote your user to admin: SELECT promote_to_admin('your-email@example.com');
CREATE OR REPLACE FUNCTION promote_to_admin(target_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET role = 'admin' 
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = target_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SEED CONTENT (Example Bali Rafting)
INSERT INTO destinations (slug, name) VALUES ('bali', '{"en": "Bali", "es": "Bali"}') ON CONFLICT DO NOTHING;
INSERT INTO tour_categories (slug, name) VALUES ('adventure', '{"en": "Adventure"}') ON CONFLICT DO NOTHING;
INSERT INTO tour_types (slug, name) VALUES ('rafting', '{"en": "Rafting"}') ON CONFLICT DO NOTHING;

DO $$
DECLARE
    d_bali UUID := (SELECT id FROM destinations WHERE slug = 'bali');
    c_adv UUID := (SELECT id FROM tour_categories WHERE slug = 'adventure');
    t_raf UUID := (SELECT id FROM tour_types WHERE slug = 'rafting');
    new_tour_id UUID;
BEGIN
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, avg_rating, review_count, highlights, inclusions, exclusions)
    VALUES (
      'ayung-rafting', d_bali, c_adv, t_raf, 
      '{"en": "White Water Rafting Ubud"}', 
      '{"en": "This white-water rafting adventure takes you on an exciting trip down Balis Ayung River. Experience the thrill of navigating rapids through lush jungle landscapes."}', 
      50, 300, 20, 'intermediate', 
      '{"https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}',
      true, 4.8, 109,
      '{"Safety briefing & expert guides", "Buffet lunch overlooking the valley", "Hotel pickup and drop-off included"}',
      '{"Rafting equipment", "River guide", "Buffet lunch", "Locker & Shower"}',
      '{"Souvenir photos", "Personal expenses"}'
    ) RETURNING id INTO new_tour_id;

    INSERT INTO tour_itineraries (tour_id, day_number, title, description)
    VALUES (new_tour_id, 1, '{"en": "Arrival & Prep"}', '{"en": "Check-in at the base camp and get fitted with safety gear."}');

    INSERT INTO tour_availability (tour_id, start_time, end_time, available_spots, total_spots)
    VALUES (new_tour_id, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 5 hours', 15, 20);
END $$;
