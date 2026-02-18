
-- 1. EXTENSIONS & ENUMS (Consolidated)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  base_price_usd DECIMAL(12,2) NOT NULL,
  duration_minutes INT NOT NULL,
  max_participants INT NOT NULL,
  difficulty difficulty_level DEFAULT 'beginner',
  images TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  excerpt JSONB NOT NULL,
  content JSONB NOT NULL,
  featured_image TEXT,
  category TEXT DEFAULT 'Uncategorized',
  is_published BOOLEAN DEFAULT false,
  reading_time_minutes INT DEFAULT 5,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id),
  status booking_status DEFAULT 'pending',
  total_amount_usd DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORAGE SETUP (Manual step: Create bucket 'tour-images' in Supabase UI)
-- Policies for 'tour-images' bucket
-- Note: Storage policies are handled in the Supabase Storage UI, but logic is:
-- ALL access for authenticated users with role 'admin' or 'editor'

-- 4. RLS POLICIES (Hardened)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is Admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper Function: Check if user is Staff (Admin or Editor)
CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'));
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage roles" ON profiles FOR ALL USING (is_admin());

-- Tours Policies
CREATE POLICY "Published tours viewable by all" ON tours FOR SELECT USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "Staff manage tours" ON tours FOR ALL USING (is_staff());

-- Blog Policies
CREATE POLICY "Published blogs viewable by all" ON blog_posts FOR SELECT USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "Staff manage blogs" ON blog_posts FOR ALL USING (is_staff());

-- Bookings Policies
CREATE POLICY "Users view own bookings" ON bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Admins manage all bookings" ON bookings FOR ALL USING (is_admin());

-- 5. TRIGGERS
CREATE OR REPLACE FUNCTION handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_blogs_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
