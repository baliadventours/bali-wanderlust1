
-- CLEAN SLATE: DROPPING EVERYTHING TO FIX SCHEMA MISMATCH
DROP TABLE IF EXISTS public.related_tours CASCADE;
DROP TABLE IF EXISTS public.tour_reviews CASCADE;
DROP TABLE IF EXISTS public.tour_faq CASCADE;
DROP TABLE IF EXISTS public.tour_inclusions CASCADE;
DROP TABLE IF EXISTS public.tour_itineraries CASCADE;
DROP TABLE IF EXISTS public.tour_pricing_packages CASCADE;
DROP TABLE IF EXISTS public.tour_highlights CASCADE;
DROP TABLE IF EXISTS public.tour_gallery CASCADE;
DROP TABLE IF EXISTS public.tour_fact_values CASCADE;
DROP TABLE IF EXISTS public.tours CASCADE;
DROP TABLE IF EXISTS public.tour_facts CASCADE;
DROP TABLE IF EXISTS public.destinations CASCADE;
DROP TABLE IF EXISTS public.tour_categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS tour_status CASCADE;
DROP TYPE IF EXISTS inclusion_type CASCADE;

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE tour_status AS ENUM ('draft', 'published');
CREATE TYPE inclusion_type AS ENUM ('include', 'exclude');

-- 2. USER PROFILES (Essential for Auth & RLS)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer', -- 'admin', 'editor', 'customer'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REFERENCE TABLES
CREATE TABLE public.tour_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tour_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CORE TOUR TABLE
CREATE TABLE public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title JSONB NOT NULL DEFAULT '{"en": ""}',
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.tour_categories(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    description JSONB DEFAULT '{"en": ""}',
    important_info JSONB DEFAULT '{"en": ""}',
    booking_policy JSONB DEFAULT '{"en": ""}',
    status tour_status DEFAULT 'draft',
    base_price_usd DECIMAL(12,2) DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    max_participants INT DEFAULT 1,
    is_published BOOLEAN DEFAULT FALSE,
    difficulty TEXT DEFAULT 'beginner',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHILD TABLES
CREATE TABLE public.tour_fact_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES public.tour_facts(id) ON DELETE CASCADE,
    value TEXT NOT NULL
);

CREATE TABLE public.tour_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE public.tour_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE public.tour_pricing_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    min_people INT DEFAULT 1,
    max_people INT NOT NULL
);

CREATE TABLE public.tour_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    day_number INT,
    time_label TEXT,
    title JSONB NOT NULL DEFAULT '{"en": ""}',
    description JSONB DEFAULT '{"en": ""}',
    image_url TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE public.tour_inclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type inclusion_type DEFAULT 'include'
);

CREATE TABLE public.tour_faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

CREATE TABLE public.tour_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.related_tours (
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    related_tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    PRIMARY KEY (tour_id, related_tour_id)
);

-- 6. SECURITY
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Tours" ON public.tours FOR SELECT USING (status = 'published');
CREATE POLICY "Admin Manage Tours" ON public.tours FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Note: We enable full access for testing, you can tighten these later.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Profiles Read" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- TRIGGER TO SYNC AUTH.USERS TO PUBLIC.PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
