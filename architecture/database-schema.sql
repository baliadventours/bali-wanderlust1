-- ==========================================
-- 1. EXTENSIONS & ENUMS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Definitions
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Booking & Payment Statuses
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tour Metadata
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. CORE UTILITY TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS currencies (
  code CHAR(3) PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  exchange_rate_to_usd DECIMAL(12, 6) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed currencies
INSERT INTO currencies (code, symbol, name, exchange_rate_to_usd) VALUES
('USD', '$', 'US Dollar', 1.0),
('EUR', '€', 'Euro', 0.92),
('GBP', '£', 'British Pound', 0.79)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 3. USER MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  phone TEXT,
  preferred_currency CHAR(3) DEFAULT 'USD' REFERENCES currencies(code),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 4. TOUR ARCHITECTURE
-- ==========================================

CREATE TABLE IF NOT EXISTS tour_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  description JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tour_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  location_data JSONB,
  description JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES tour_categories(id),
  tour_type_id UUID REFERENCES tour_types(id),
  destination_id UUID REFERENCES destinations(id),
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  summary JSONB,
  base_price_usd DECIMAL(12, 2) NOT NULL,
  duration_minutes INT NOT NULL,
  max_participants INT NOT NULL,
  difficulty difficulty_level DEFAULT 'beginner',
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  highlights JSONB DEFAULT '[]'::jsonb,
  inclusions JSONB DEFAULT '[]'::jsonb,
  exclusions JSONB DEFAULT '[]'::jsonb,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  location_name TEXT,
  image_url TEXT,
  UNIQUE(tour_id, day_number)
);

CREATE TABLE IF NOT EXISTS tour_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  title JSONB NOT NULL,
  description JSONB,
  unit_price_usd DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. PRICING & AVAILABILITY
-- ==========================================

CREATE TABLE IF NOT EXISTS seasonal_pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  multiplier DECIMAL(5, 2) DEFAULT 1.0,
  fixed_override_usd DECIMAL(12, 2),
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tour_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  available_spots INT NOT NULL,
  total_spots INT NOT NULL,
  price_override_usd DECIMAL(12, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. BOOKING & TRANSACTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  min_spend_usd DECIMAL(12, 2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  availability_id UUID NOT NULL REFERENCES tour_availability(id),
  status booking_status DEFAULT 'pending',
  total_amount_usd DECIMAL(12, 2) NOT NULL,
  currency_code CHAR(3) NOT NULL REFERENCES currencies(code),
  currency_amount DECIMAL(12, 2) NOT NULL,
  discount_code_id UUID REFERENCES discount_codes(id),
  notes TEXT,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS booking_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  passport_number TEXT,
  date_of_birth DATE,
  special_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES tour_addons(id),
  title JSONB NOT NULL,
  unit_price_usd DECIMAL(12, 2) NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. HELPER FUNCTIONS & RPC
-- ==========================================

-- Function to decrement available spots (Used by Stripe Webhook)
CREATE OR REPLACE FUNCTION decrement_available_spots(row_id UUID, count INT)
RETURNS void AS $$
BEGIN
  UPDATE tour_availability
  SET available_spots = available_spots - count
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DO $$ BEGIN
    CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_tours_modtime BEFORE UPDATE ON tours FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Handle Auth User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- 8. INDEXING
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_published ON tours(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_availability_tour_time ON tour_availability(tour_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);

-- ==========================================
-- 9. ENABLE RLS
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_availability ENABLE ROW LEVEL SECURITY;

-- Basic Policies
DO $$ BEGIN
    CREATE POLICY "Public profiles are viewable by owner" ON profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can view published tours" ON tours FOR SELECT USING (is_published = true AND deleted_at IS NULL);
EXCEPTION WHEN duplicate_object THEN null; END $$;
