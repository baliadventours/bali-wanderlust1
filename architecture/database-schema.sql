
-- UNCOMMENT THESE LINES IF YOU WANT TO RESET YOUR DATABASE COMPLETELY:
-- DROP TABLE IF EXISTS public.related_tours CASCADE;
-- DROP TABLE IF EXISTS public.tour_reviews CASCADE;
-- DROP TABLE IF EXISTS public.tour_faq CASCADE;
-- DROP TABLE IF EXISTS public.tour_inclusions CASCADE;
-- DROP TABLE IF EXISTS public.tour_itineraries CASCADE;
-- DROP TABLE IF EXISTS public.seasonal_pricing CASCADE;
-- DROP TABLE IF EXISTS public.tour_pricing_packages CASCADE;
-- DROP TABLE IF EXISTS public.tour_highlights CASCADE;
-- DROP TABLE IF EXISTS public.tour_gallery CASCADE;
-- DROP TABLE IF EXISTS public.tour_fact_values CASCADE;
-- DROP TABLE IF EXISTS public.tours CASCADE;
-- DROP TABLE IF EXISTS public.tour_facts CASCADE;
-- DROP TABLE IF EXISTS public.destinations CASCADE;
-- DROP TABLE IF EXISTS public.tour_categories CASCADE;
-- DROP TYPE IF EXISTS tour_status;
-- DROP TYPE IF EXISTS inclusion_type;

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tour_status') THEN
        CREATE TYPE tour_status AS ENUM ('draft', 'published');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inclusion_type') THEN
        CREATE TYPE inclusion_type AS ENUM ('include', 'exclude');
    END IF;
END $$;

-- 2. REFERENCE TABLES
CREATE TABLE IF NOT EXISTS public.tour_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tour_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CORE TOUR TABLE
CREATE TABLE IF NOT EXISTS public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title JSONB NOT NULL, -- Changed to JSONB for multi-lang
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.tour_categories(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    description JSONB,
    important_info JSONB,
    booking_policy JSONB,
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

-- 4. RELATIONSHIPS
CREATE TABLE IF NOT EXISTS public.tour_fact_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES public.tour_facts(id) ON DELETE CASCADE,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tour_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.tour_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.tour_pricing_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    min_people INT DEFAULT 1,
    max_people INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tour_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    day_number INT,
    time_label TEXT,
    title JSONB NOT NULL,
    description JSONB,
    image_url TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.tour_inclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type inclusion_type DEFAULT 'include'
);

CREATE TABLE IF NOT EXISTS public.tour_faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tour_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.related_tours (
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    related_tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    PRIMARY KEY (tour_id, related_tour_id)
);

-- 5. RLS POLICIES
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.tours;
CREATE POLICY "Public Read" ON public.tours FOR SELECT USING (status = 'published');

-- Note: Ensure you have a 'profiles' table with 'role' column for these to work
-- Or simplify policies for dev:
-- CREATE POLICY "Allow All" ON public.tours FOR ALL USING (TRUE);
