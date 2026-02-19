
-- ==========================================
-- 0. NUCLEAR RESET (Drops everything in public)
-- ==========================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON ' || quote_ident(r.event_object_table);
    END LOOP;

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as params FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '(' || r.params || ') CASCADE';
    END LOOP;

    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- ==========================================
-- 1. EXTENSIONS & TYPES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE public.tour_status AS ENUM ('draft', 'published');
CREATE TYPE public.inclusion_type AS ENUM ('include', 'exclude');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- ==========================================
-- 2. CORE TABLES
-- ==========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tour_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL DEFAULT '{"en": ""}',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tour_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL DEFAULT '{"en": ""}',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tour_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title JSONB NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.tour_categories(id),
    destination_id UUID REFERENCES public.destinations(id),
    tour_type_id UUID REFERENCES public.tour_types(id),
    description JSONB,
    important_info JSONB,
    booking_policy JSONB,
    base_price_usd DECIMAL(12,2),
    duration_minutes INT,
    max_participants INT,
    difficulty public.difficulty_level DEFAULT 'beginner',
    status public.tour_status DEFAULT 'published',
    is_published BOOLEAN DEFAULT TRUE,
    images TEXT[] DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE TABLE public.tour_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    day_number INT,
    time_label TEXT,
    title JSONB,
    description JSONB,
    image_url TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE public.tour_inclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type public.inclusion_type DEFAULT 'include'
);

CREATE TABLE public.tour_faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

CREATE TABLE public.tour_pricing_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    description TEXT,
    price_tiers JSONB DEFAULT '[]',
    base_price DECIMAL(12,2),
    min_people INT DEFAULT 1,
    max_people INT DEFAULT 12
);

CREATE TABLE public.tour_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    available_spots INT NOT NULL,
    total_spots INT NOT NULL,
    price_override_usd DECIMAL(12,2),
    status TEXT DEFAULT 'active'
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    availability_id UUID REFERENCES public.tour_availability(id),
    status TEXT DEFAULT 'confirmed',
    total_amount_usd DECIMAL(12,2) NOT NULL,
    currency_code TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL,
    excerpt JSONB,
    content JSONB,
    featured_image TEXT,
    category TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tour_fact_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES public.tour_facts(id) ON DELETE CASCADE,
    value TEXT NOT NULL
);

-- ==========================================
-- 3. AUTH TRIGGER (Automatically syncs profiles)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN new.email = 'admin@admin.com' THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. DETERMINISTIC DATA SEEDING
-- ==========================================
-- Using fixed namespaces for deterministic UUID generation
-- Namespace for Users: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' (standard DNS namespace)
-- Using uuid_generate_v5 to ensure ID consistency across runs

-- A. Reference Data (Fixed IDs)
INSERT INTO public.tour_categories (id, name, slug) VALUES
('c1000000-0000-0000-0000-000000000001', 'Adventure', 'adventure'),
('c1000000-0000-0000-0000-000000000002', 'Cultural', 'cultural'),
('c1000000-0000-0000-0000-000000000003', 'Wellness', 'wellness');

INSERT INTO public.destinations (id, name, slug) VALUES
('d1000000-0000-0000-0000-000000000001', '{"en": "Bali"}', 'bali'),
('d1000000-0000-0000-0000-000000000002', '{"en": "Iceland"}', 'iceland'),
('d1000000-0000-0000-0000-000000000003', '{"en": "Japan"}', 'japan'),
('d1000000-0000-0000-0000-000000000004', '{"en": "Italy"}', 'italy'),
('d1000000-0000-0000-0000-000000000005', '{"en": "Egypt"}', 'egypt');

INSERT INTO public.tour_types (id, name, slug) VALUES
('71000000-0000-0000-0000-000000000001', '{"en": "Hiking"}', 'hiking'),
('71000000-0000-0000-0000-000000000002', '{"en": "Foodie"}', 'foodie'),
('71000000-0000-0000-0000-000000000003', '{"en": "Photography"}', 'photography');

INSERT INTO public.tour_facts (id, name, icon) VALUES
('f1000000-0000-0000-0000-000000000001', 'Duration', 'clock'),
('f1000000-0000-0000-0000-000000000002', 'Difficulty', 'zap');

-- B. 2 Deterministic Administrators
INSERT INTO public.profiles (id, full_name, email, role, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@admin.com', 'admin', 'https://i.pravatar.cc/150?u=admin'),
('00000000-0000-0000-0000-000000000002', 'Operations Lead', 'ops@toursphere.com', 'admin', 'https://i.pravatar.cc/150?u=ops');

-- C. 20 Deterministic Customers
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 
    uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'customer_' || i), 
    'Customer ' || i, 
    'user' || i || '@example.com', 
    'customer'
FROM generate_series(1, 20) AS i;

-- D. 20 Deterministic Tours
DO $$
DECLARE
    cat_id UUID := 'c1000000-0000-0000-0000-000000000001';
    dest_id UUID := 'd1000000-0000-0000-0000-000000000001';
    type_id UUID := '71000000-0000-0000-0000-000000000001';
    t_id UUID;
    i INT;
    t_avail_id UUID;
BEGIN
    FOR i IN 1..20 LOOP
        t_id := uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'tour_' || i);
        
        IF i > 4 THEN dest_id := 'd1000000-0000-0000-0000-000000000002'; END IF;
        IF i > 8 THEN dest_id := 'd1000000-0000-0000-0000-000000000003'; END IF;
        IF i > 12 THEN dest_id := 'd1000000-0000-0000-0000-000000000004'; END IF;
        IF i > 16 THEN dest_id := 'd1000000-0000-0000-0000-000000000005'; END IF;

        INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
        VALUES (
            t_id, 
            jsonb_build_object('en', 'Premium Expedition #' || i), 
            'expedition-slug-' || i,
            cat_id, dest_id, type_id,
            jsonb_build_object('en', 'This is a premium high-quality expedition designed for travelers who want the best experience in destination #' || i),
            50 + (i * 10),
            240 + (i * 30),
            12,
            CASE 
              WHEN i % 3 = 0 THEN 'beginner'::difficulty_level
              WHEN i % 3 = 1 THEN 'intermediate'::difficulty_level
              ELSE 'advanced'::difficulty_level
            END,
            ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800']
        );

        INSERT INTO public.tour_gallery (tour_id, image_url) VALUES (t_id, 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800');
        INSERT INTO public.tour_highlights (tour_id, content) VALUES (t_id, 'Visit exclusive hidden locations'), (t_id, 'Luxury private transportation');
        INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
        (t_id, 1, '{"en": "The Arrival"}', '{"en": "Check into your luxury lodge and meet your guides."}'),
        (t_id, 2, '{"en": "Summit Day"}', '{"en": "Trek to the highest point for sunrise views."}');
        INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES (t_id, 'Gourmet Lunch', 'include'), (t_id, 'Alcoholic Drinks', 'exclude');
        INSERT INTO public.tour_faq (tour_id, question, answer) VALUES (t_id, 'What is the weather like?', 'Expect mild temperatures during the day.');
        INSERT INTO public.tour_pricing_packages (tour_id, package_name, price_tiers, base_price) VALUES (
            t_id, 'Standard Group', 
            '[{"people": 1, "price": 150}, {"people": 4, "price": 120}, {"people": 8, "price": 95}]',
            150
        );
        
        -- Availability (Fixed ID for bookings consistency)
        t_avail_id := uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'tour_availability_' || i);
        INSERT INTO public.tour_availability (id, tour_id, start_time, available_spots, total_spots) VALUES
        (t_avail_id, t_id, (CURRENT_DATE + (i || ' days')::interval)::timestamptz, 12, 12);
    END LOOP;
END $$;

-- E. 10 Deterministic Blog Posts
INSERT INTO public.blog_posts (id, slug, title, excerpt, content, featured_image, category, author_id)
SELECT 
    uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'blog_post_' || i),
    'journal-post-' || i,
    jsonb_build_object('en', 'Secrets of Travel #' || i),
    jsonb_build_object('en', 'Discover the hidden secrets and local favorites that tourists often miss in this definitive guide.'),
    jsonb_build_object('en', '<h1>The Ultimate Guide to Slow Travel</h1><p>Travel is not just about ticking boxes. It is about the smell of the morning air, the sound of the local dialect, and the taste of authentic food. In this article, we dive deep into how you can transform your next trip into a soul-stirring journey...</p><p>We spent 3 months living with locals to bring you these exclusive tips...</p>'),
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    'Travel Guides',
    '00000000-0000-0000-0000-000000000001'
FROM generate_series(1, 10) AS i;

-- F. 30 Deterministic Bookings
INSERT INTO public.bookings (id, customer_id, availability_id, total_amount_usd)
SELECT 
    uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'booking_' || i),
    (SELECT id FROM public.profiles WHERE role = 'customer' ORDER BY email OFFSET (i % 20) LIMIT 1),
    (SELECT id FROM public.tour_availability ORDER BY start_time OFFSET (i % 20) LIMIT 1),
    250.00
FROM generate_series(1, 30) AS i;

-- ==========================================
-- 5. SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Tours" ON public.tours FOR SELECT USING (true);
CREATE POLICY "Public Read Blog" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admin All Profiles" ON public.profiles TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users Read Own Bookings" ON public.bookings FOR SELECT USING (customer_id = auth.uid());

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
