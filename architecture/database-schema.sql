
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

-- ==========================================
-- 3. DETERMINISTIC DATA SEEDING (BALI FOCUS)
-- ==========================================
-- Namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

-- A. Reference Data
INSERT INTO public.tour_categories (id, name, slug) VALUES
('c1000000-0000-0000-0000-000000000001', 'Adventure', 'adventure'),
('c1000000-0000-0000-0000-000000000002', 'Cultural', 'cultural'),
('c1000000-0000-0000-0000-000000000003', 'Wellness', 'wellness');

INSERT INTO public.destinations (id, name, slug) VALUES
('d1000000-0000-0000-0000-000000000001', '{"en": "Bali"}', 'bali'),
('d1000000-0000-0000-0000-000000000002', '{"en": "Iceland"}', 'iceland');

INSERT INTO public.tour_types (id, name, slug) VALUES
('71000000-0000-0000-0000-000000000001', '{"en": "Hiking"}', 'hiking'),
('71000000-0000-0000-0000-000000000002', '{"en": "Water Sports"}', 'water-sports'),
('71000000-0000-0000-0000-000000000003', '{"en": "Spiritual"}', 'spiritual');

-- B. 10 High-Quality Bali Tours
DO $$
DECLARE
    ns UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    t_id UUID;
BEGIN
    -- Tour 1: Ubud Jungle
    t_id := uuid_generate_v5(ns, 'tour_bali_1');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Ubud Jungle & Sacred Monkey Forest"}', 'ubud-jungle-highlights', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000003', '{"en": "Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace and the spiritual monkey forest."}', 45.00, 480, 12, 'beginner', ARRAY['https://images.unsplash.com/photo-1554443651-7871b058d867?w=800']);
    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES (t_id, 1, '{"en": "Monkey Forest Exploration"}', '{"en": "Walk through the sacred forest and meet the local long-tailed macaques."}');
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '2 days', 12, 12);

    -- Tour 2: Mt Batur
    t_id := uuid_generate_v5(ns, 'tour_bali_2');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Mount Batur Active Volcano Sunrise Trek"}', 'mt-batur-sunrise', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', '{"en": "Hike to the summit of an active volcano in the early hours to witness the most spectacular sunrise in Bali."}', 65.00, 600, 15, 'intermediate', ARRAY['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800']);
    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES (t_id, 1, '{"en": "The Summit Reach"}', '{"en": "Reach the peak just as the sky begins to turn orange."}');
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '3 days', 15, 15);

    -- Tour 3: Nusa Penida
    t_id := uuid_generate_v5(ns, 'tour_bali_3');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Nusa Penida: Kelingking & Crystal Bay"}', 'nusa-penida-best', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000002', '{"en": "The ultimate day trip to the most famous coastline in the world featuring Kelingking Cliff."}', 85.00, 720, 8, 'intermediate', ARRAY['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '4 days', 8, 8);

    -- Tour 4: Uluwatu
    t_id := uuid_generate_v5(ns, 'tour_bali_4');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Uluwatu Temple Sunset & Fire Dance"}', 'uluwatu-kecak', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000003', '{"en": "A dramatic performance on a cliff edge overlooking the Indian Ocean as the sun sets."}', 35.00, 300, 20, 'beginner', ARRAY['https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '5 days', 20, 20);

    -- Tour 5: Lempuyang
    t_id := uuid_generate_v5(ns, 'tour_bali_5');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Lempuyang Temple: Gate of Heaven"}', 'gate-of-heaven', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000003', '{"en": "Get the iconic photo between the Hindu gates with the mighty Mount Agung in the background."}', 55.00, 600, 10, 'beginner', ARRAY['https://images.unsplash.com/photo-1537953391648-762d01df3c14?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '6 days', 10, 10);

    -- Tour 6: Ayung Rafting
    t_id := uuid_generate_v5(ns, 'tour_bali_6');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Ayung River White Water Rafting"}', 'ayung-rafting', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000002', '{"en": "Paddle through wild rapids and past hidden waterfalls in the Ayung River valley."}', 50.00, 240, 30, 'intermediate', ARRAY['https://images.unsplash.com/photo-1530122622335-d40394391ea5?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '7 days', 30, 30);

    -- Tour 7: Spiritual Blessing
    t_id := uuid_generate_v5(ns, 'tour_bali_7');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Spiritual Holy Water Temple Blessing"}', 'tirta-empul-blessing', 'c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000003', '{"en": "Participate in a traditional purification ritual at Tirta Empul."}', 40.00, 360, 6, 'beginner', ARRAY['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '8 days', 6, 6);

    -- Tour 8: Tanah Lot
    t_id := uuid_generate_v5(ns, 'tour_bali_8');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Tanah Lot Temple Sunset Expedition"}', 'tanah-lot-sunset', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000003', '{"en": "Visit the temple on the sea, one of Balis most iconic spiritual locations."}', 30.00, 300, 15, 'beginner', ARRAY['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '9 days', 15, 15);

    -- Tour 9: Dolphin Watching
    t_id := uuid_generate_v5(ns, 'tour_bali_9');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Lovina Dolphin Watching & Snorkeling"}', 'lovina-dolphins', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000002', '{"en": "A sunrise boat trip to see wild dolphins in their natural habitat."}', 45.00, 480, 12, 'beginner', ARRAY['https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '10 days', 12, 12);

    -- Tour 10: Cooking Class
    t_id := uuid_generate_v5(ns, 'tour_bali_10');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Ubud Traditional Cooking Class"}', 'balinese-cooking', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000003', '{"en": "Learn the secrets of Balinese spices in a local family compound."}', 45.00, 240, 15, 'beginner', ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800']);
    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES (t_id, CURRENT_DATE + interval '11 days', 15, 15);
END $$;

-- C. Administrators
INSERT INTO public.profiles (id, full_name, email, role, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@admin.com', 'admin', 'https://i.pravatar.cc/150?u=admin');

-- D. Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Tours" ON public.tours FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
