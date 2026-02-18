
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
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

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA
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
    -- Seeding White Water Rafting Ubud
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, avg_rating, review_count, highlights, inclusions, exclusions)
    VALUES (
      'ayung-rafting', d_bali, c_adv, t_raf, 
      '{"en": "White Water Rafting Ubud"}', 
      '{"en": "This white-water rafting adventure takes you on an exciting trip down Balis Ayung River. This activity comes with a tasty lunch and all the safety gear you need."}', 
      50, 300, 20, 'intermediate', 
      '{"https://images.unsplash.com/photo-1530122622335-d40394391ea5", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2", "https://images.unsplash.com/photo-1537996194471-e657df975ab4"}',
      true, 4.8, 109,
      '{"Have a safe time rafting with the help of a trained guide.", "Take advantage of the free lunch spread.", "Get round-trip transfers from your Ubud hotel."}',
      '{"Safety-approved Rafting equipment", "Professional River Guide", "Meal (Lunch Box)", "Insurance Coverage"}',
      '{"Souvenir photos", "Soft Drink"}'
    ) RETURNING id INTO new_tour_id;

    INSERT INTO tour_itineraries (tour_id, day_number, title, description)
    VALUES 
    (new_tour_id, 1, '{"en": "Bali Bintang Rafting"}', '{"en": "Experience the thrill of Bali Bintang Rafting in Ubud! Navigate a 14km stretch of the Ayung River with 28 exciting class II-III rapids."}');

    INSERT INTO tour_availability (tour_id, start_time, end_time, available_spots, total_spots)
    VALUES (new_tour_id, '2025-02-19 09:00:00+00', '2025-02-19 14:00:00+00', 12, 20);
END $$;
