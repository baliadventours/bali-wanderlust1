
-- ==========================================
-- 0. NUCLEAR RESET (Drops everything in public)
-- ==========================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all triggers in public schema
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON ' || quote_ident(r.event_object_table);
    END LOOP;

    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all functions in public schema
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as params 
        FROM pg_proc p 
        JOIN pg_namespace n ON n.oid = p.pronamespace 
        WHERE n.nspname = 'public'
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '(' || r.params || ') CASCADE';
    END LOOP;

    -- Drop all types (Enums) in public schema
    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. ENUMS
-- ==========================================
CREATE TYPE public.tour_status AS ENUM ('draft', 'published');
CREATE TYPE public.inclusion_type AS ENUM ('include', 'exclude');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- ==========================================
-- 3. CORE PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY, -- Removed FK to auth.users for pure seed capability, though in prod it should be linked
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. REFERENCE TABLES
-- ==========================================
CREATE TABLE public.tour_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tour_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL DEFAULT '{"en": ""}',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.destinations (
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

-- ==========================================
-- 5. TOURS TABLE
-- ==========================================
CREATE TABLE public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title JSONB NOT NULL DEFAULT '{"en": ""}',
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.tour_categories(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    tour_type_id UUID REFERENCES public.tour_types(id) ON DELETE SET NULL,
    description JSONB DEFAULT '{"en": ""}',
    important_info JSONB DEFAULT '{"en": ""}',
    booking_policy JSONB DEFAULT '{"en": ""}',
    base_price_usd DECIMAL(12,2) DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    max_participants INT DEFAULT 1,
    is_published BOOLEAN DEFAULT FALSE,
    status public.tour_status DEFAULT 'draft',
    difficulty public.difficulty_level DEFAULT 'beginner',
    images TEXT[] DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. RELATIONSHIPS & DYNAMIC CONTENT
-- ==========================================
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
    description TEXT,
    price_tiers JSONB DEFAULT '[]',
    base_price DECIMAL(12,2) DEFAULT 0,
    min_people INT DEFAULT 1,
    max_people INT NOT NULL DEFAULT 10
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
    type public.inclusion_type DEFAULT 'include'
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

-- ==========================================
-- 7. AVAILABILITY & ADDONS
-- ==========================================
CREATE TABLE public.tour_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    available_spots INT NOT NULL,
    total_spots INT NOT NULL,
    price_override_usd DECIMAL(12,2),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tour_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    title JSONB NOT NULL DEFAULT '{"en": ""}',
    description JSONB DEFAULT '{"en": ""}',
    unit_price_usd DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. BOOKINGS & DISCOUNTS
-- ==========================================
CREATE TABLE public.discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    availability_id UUID REFERENCES public.tour_availability(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    total_amount_usd DECIMAL(12,2) NOT NULL,
    currency_code TEXT DEFAULT 'USD',
    currency_amount DECIMAL(12,2),
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. BLOG SYSTEM
-- ==========================================
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL DEFAULT '{"en": ""}',
    excerpt JSONB DEFAULT '{"en": ""}',
    content JSONB DEFAULT '{"en": ""}',
    featured_image TEXT,
    category TEXT,
    reading_time_minutes INT DEFAULT 5,
    is_published BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 10. INQUIRIES & SUPPORT
-- ==========================================
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 11. RELATED TOURS
-- ==========================================
CREATE TABLE public.related_tours (
    tour_id UUID NOT NULL,
    related_tour_id UUID NOT NULL,
    PRIMARY KEY (tour_id, related_tour_id),
    CONSTRAINT related_tours_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE,
    CONSTRAINT related_tours_related_tour_id_fkey FOREIGN KEY (related_tour_id) REFERENCES public.tours(id) ON DELETE CASCADE
);

-- ==========================================
-- 12. SECURITY (Row Level Security)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- POLICIES
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public Read Tours" ON public.tours FOR SELECT USING (true);
CREATE POLICY "Public Read Availability" ON public.tour_availability FOR SELECT USING (true);
CREATE POLICY "Users Read Own Bookings" ON public.bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Public Read Blog" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.tour_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public Read Tour Types" ON public.tour_types FOR SELECT USING (true);

-- ==========================================
-- 14. MASSIVE SEED DATA INJECTION
-- ==========================================

-- A. Categories
INSERT INTO public.tour_categories (id, name, slug) VALUES
('11111111-1111-1111-1111-111111111111', 'Adventure', 'adventure'),
('22222222-2222-2222-2222-222222222222', 'Cultural', 'cultural'),
('33333333-3333-3333-3333-333333333333', 'Wellness', 'wellness'),
('44444444-4444-4444-4444-444444444444', 'Luxury', 'luxury'),
('55555555-5555-5555-5555-555555555555', 'Nature', 'nature');

-- B. Destinations
INSERT INTO public.destinations (id, name, slug) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"en": "Bali", "es": "Bali"}', 'bali'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"en": "Iceland", "es": "Islandia"}', 'iceland'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '{"en": "Japan", "es": "Japón"}', 'japan'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '{"en": "Italy", "es": "Italia"}', 'italy'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '{"en": "Peru", "es": "Perú"}', 'peru');

-- C. Tour Types
INSERT INTO public.tour_types (id, name, slug) VALUES
('91111111-1111-1111-1111-111111111111', '{"en": "Hiking", "es": "Senderismo"}', 'hiking'),
('92222222-2222-2222-2222-222222222222', '{"en": "Water Sports", "es": "Deportes Acuáticos"}', 'water-sports'),
('93333333-3333-3333-3333-333333333333', '{"en": "Foodie", "es": "Gastronomía"}', 'foodie'),
('94444444-4444-4444-4444-444444444444', '{"en": "Photography", "es": "Fotografía"}', 'photography'),
('95555555-5555-5555-5555-555555555555', '{"en": "Wellness", "es": "Bienestar"}', 'wellness');

-- D. Tour Facts
INSERT INTO public.tour_facts (id, name, icon) VALUES
('f1111111-1111-1111-1111-111111111111', 'Duration', 'clock'),
('f2222222-2222-2222-2222-222222222222', 'Difficulty', 'zap'),
('f3333333-3333-3333-3333-333333333333', 'Max Group', 'users'),
('f4444444-4444-4444-4444-444444444444', 'Transport', 'truck');

-- E. Profiles (20 Users)
INSERT INTO public.profiles (id, full_name, email, role, avatar_url) VALUES
('u0000000-0000-0000-0000-000000000001', 'Admin Chief', 'admin@admin.com', 'admin', 'https://i.pravatar.cc/150?u=admin'),
('u0000000-0000-0000-0000-000000000002', 'Alice Wonder', 'alice@example.com', 'customer', 'https://i.pravatar.cc/150?u=alice'),
('u0000000-0000-0000-0000-000000000003', 'Bob Builder', 'bob@example.com', 'customer', 'https://i.pravatar.cc/150?u=bob'),
('u0000000-0000-0000-0000-000000000004', 'Charlie Brown', 'charlie@example.com', 'customer', 'https://i.pravatar.cc/150?u=charlie'),
('u0000000-0000-0000-0000-000000000005', 'Diana Prince', 'diana@example.com', 'customer', 'https://i.pravatar.cc/150?u=diana'),
('u0000000-0000-0000-0000-000000000006', 'Ethan Hunt', 'ethan@example.com', 'customer', 'https://i.pravatar.cc/150?u=ethan'),
('u0000000-0000-0000-0000-000000000007', 'Fiona Apple', 'fiona@example.com', 'customer', 'https://i.pravatar.cc/150?u=fiona'),
('u0000000-0000-0000-0000-000000000008', 'George Miller', 'george@example.com', 'customer', 'https://i.pravatar.cc/150?u=george'),
('u0000000-0000-0000-0000-000000000009', 'Hannah Baker', 'hannah@example.com', 'customer', 'https://i.pravatar.cc/150?u=hannah'),
('u0000000-0000-0000-0000-000000000010', 'Ian Wright', 'ian@example.com', 'customer', 'https://i.pravatar.cc/150?u=ian'),
('u0000000-0000-0000-0000-000000000011', 'Jack Sparrow', 'jack@example.com', 'customer', 'https://i.pravatar.cc/150?u=jack'),
('u0000000-0000-0000-0000-000000000012', 'Kelly Clark', 'kelly@example.com', 'customer', 'https://i.pravatar.cc/150?u=kelly'),
('u0000000-0000-0000-0000-000000000013', 'Liam Neeson', 'liam@example.com', 'customer', 'https://i.pravatar.cc/150?u=liam'),
('u0000000-0000-0000-0000-000000000014', 'Mona Lisa', 'mona@example.com', 'customer', 'https://i.pravatar.cc/150?u=mona'),
('u0000000-0000-0000-0000-000000000015', 'Noah Ark', 'noah@example.com', 'customer', 'https://i.pravatar.cc/150?u=noah'),
('u0000000-0000-0000-0000-000000000016', 'Olivia Pope', 'olivia@example.com', 'customer', 'https://i.pravatar.cc/150?u=olivia'),
('u0000000-0000-0000-0000-000000000017', 'Paul Atreides', 'paul@example.com', 'customer', 'https://i.pravatar.cc/150?u=paul'),
('u0000000-0000-0000-0000-000000000018', 'Quinn Fabray', 'quinn@example.com', 'customer', 'https://i.pravatar.cc/150?u=quinn'),
('u0000000-0000-0000-0000-000000000019', 'Riley Reid', 'riley@example.com', 'customer', 'https://i.pravatar.cc/150?u=riley'),
('u0000000-0000-0000-0000-000000000020', 'Steve Jobs', 'steve@example.com', 'customer', 'https://i.pravatar.cc/150?u=steve');

-- F. Tours (20 Tours)
-- We use a loop for some, but defining the first few explicitly for accuracy
INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, status, is_published, difficulty, images) VALUES
('e0000000-0000-0000-0000-000000000001', '{"en": "Ubud Jungle & Sacred Monkey Forest"}', 'ubud-jungle-highlights', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '94444444-4444-4444-4444-444444444444', '{"en": "Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace and the spiritual Monkey Forest."}', 45, 480, 10, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&w=800"}'),
('e0000000-0000-0000-0000-000000000002', '{"en": "Mt Batur Active Volcano Sunrise Trek"}', 'mt-batur-sunrise', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '91111111-1111-1111-1111-111111111111', '{"en": "Hike to the summit of an active volcano and watch the sunrise from 1,717 meters above sea level."}', 65, 600, 15, 'published', TRUE, 'intermediate', '{"https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000003', '{"en": "Golden Circle & Blue Lagoon"}', 'iceland-golden-circle', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '94444444-4444-4444-4444-444444444444', '{"en": "Witness the power of nature at Geysir, Gullfoss waterfall, and relax in the geothermal waters."}', 180, 540, 20, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000004', '{"en": "Kyoto Temples & Tea Ceremony"}', 'kyoto-temples-tea', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '93333333-3333-3333-3333-333333333333', '{"en": "Immerse yourself in Zen culture with visits to the Golden Pavilion and a private tea ceremony."}', 120, 360, 8, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000005', '{"en": "Rome Colosseum Private Access"}', 'rome-colosseum-vip', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '94444444-4444-4444-4444-444444444444', '{"en": "Skip the lines and explore the underground chambers of the Colosseum with an archaeologist."}', 250, 240, 6, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000006', '{"en": "Machu Picchu Sunrise Expedition"}', 'machu-picchu-sunrise', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '91111111-1111-1111-1111-111111111111', '{"en": "The ultimate Inca trail experience culminating in a breathtaking sunrise over the lost city."}', 450, 2880, 12, 'published', TRUE, 'advanced', '{"https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000007', '{"en": "Tuscany Wine & Truffle Hunting"}', 'tuscany-wine-truffle', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '93333333-3333-3333-3333-333333333333', '{"en": "Join a local hunter and his dog to find black gold, followed by a 5-course wine pairing lunch."}', 195, 300, 10, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1543418219-44e30b057ebd?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000008', '{"en": "Tokyo Street Food Safari"}', 'tokyo-street-food', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '93333333-3333-3333-3333-333333333333', '{"en": "Navigate the neon alleys of Shinjuku and Sunamachi to taste the best yakitori, gyoza, and mochi."}', 85, 240, 12, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000009', '{"en": "Nusa Penida: Manta Ray Snorkel"}', 'nusa-penida-manta', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '92222222-2222-2222-2222-222222222222', '{"en": "Swim alongside majestic Manta Rays in the crystal clear waters off the coast of Bali."}', 75, 480, 15, 'published', TRUE, 'intermediate', '{"https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000010', '{"en": "Venice Gondola & Hidden Bacari"}', 'venice-gondola-food', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '93333333-3333-3333-3333-333333333333', '{"en": "Glide through the canals before hitting the local wine bars for Cicchetti and Prosecco."}', 110, 180, 6, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000011', '{"en": "Arctic Northern Lights Hunt"}', 'arctic-aurora-hunt', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '94444444-4444-4444-4444-444444444444', '{"en": "Join expert photographers to chase the Aurora Borealis in the Icelandic wilderness."}', 140, 240, 16, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1531366930499-41f695558bb2?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000012', '{"en": "Sacred Valley Zip Line & Yoga"}', 'sacred-valley-yoga', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '95555555-5555-5555-5555-555555555555', '{"en": "Find balance with high-altitude yoga and an adrenaline-pumping zipline over the Andean valley."}', 165, 480, 10, 'published', TRUE, 'intermediate', '{"https://images.unsplash.com/photo-1518005020250-675f210fe309?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000013', '{"en": "Amalfi Coast Scenic Drive & Lunch"}', 'amalfi-scenic-drive', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '94444444-4444-4444-4444-444444444444', '{"en": "Experience the most beautiful coastline in the world from a vintage Italian convertible."}', 350, 420, 2, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1533924736468-daee5293453b?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000014', '{"en": "Mount Fuji & Five Lakes Private Tour"}', 'mt-fuji-private', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '91111111-1111-1111-1111-111111111111', '{"en": "Travel in luxury to the base of Japan iconic peak and enjoy a boat cruise on Lake Ashi."}', 320, 600, 7, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1490806678282-4410583561a3?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000015', '{"en": "Ubud Art & Silversmithing Workshop"}', 'ubud-silver-workshop', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '94444444-4444-4444-4444-444444444444', '{"en": "Create your own unique sterling silver jewelry with guidance from a master Balinese silversmith."}', 55, 180, 5, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000016', '{"en": "Icelandic Horseback Riding & Thermal Springs"}', 'iceland-horse-spa', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '95555555-5555-5555-5555-555555555555', '{"en": "Ride the unique Icelandic horses through lava fields and finish with a soak in a secret hot spring."}', 155, 300, 10, 'published', TRUE, 'intermediate', '{"https://images.unsplash.com/photo-1504541891213-1b1dfdadb739?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000017', '{"en": "Colca Canyon: Andean Condor Spotting"}', 'colca-canyon-trek', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '91111111-1111-1111-1111-111111111111', '{"en": "Trek through one of the deepest canyons in the world and spot the giant Andean Condor in flight."}', 220, 1440, 15, 'published', TRUE, 'advanced', '{"https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000018', '{"en": "Tokyo Akihabara Electronics & Gaming Tour"}', 'tokyo-gaming-tour', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '94444444-4444-4444-4444-444444444444', '{"en": "Dive into the heart of Otaku culture with a local expert guide through neon-lit Akihabara."}', 70, 180, 10, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000019', '{"en": "Bali Sunrise Dolphin Cruise & Waterfall"}', 'bali-dolphin-waterfall', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '94444444-4444-4444-4444-444444444444', '{"en": "A magical sunrise boat ride in Lovina to see wild dolphins, followed by a hidden waterfall trek."}', 80, 600, 12, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1464037862834-ee5772642398?auto=format&w=800"}'),
('e0000000-0000-0000-0000-000000000020', '{"en": "Florence Renaissance Art & Food"}', 'florence-art-food', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '93333333-3333-3333-3333-333333333333', '{"en": "Walk the path of the Medici, see the Statue of David, and enjoy a traditional Bistecca alla Fiorentina."}', 175, 360, 10, 'published', TRUE, 'beginner', '{"https://images.unsplash.com/photo-1528114039593-4366cc08227d?auto=format&w=800"}');

-- G. Child Tables for Tours (Itineraries, Highlights, etc.)
DO $$
DECLARE
    t_id UUID;
BEGIN
    FOR t_id IN SELECT id FROM public.tours LOOP
        -- Highlights
        INSERT INTO public.tour_highlights (tour_id, content, sort_order) VALUES
        (t_id, 'Expert local English-speaking guide', 0),
        (t_id, 'All entrance fees and site taxes included', 1),
        (t_id, 'Small group size for personalized attention', 2),
        (t_id, 'High-quality equipment and safety gear', 3),
        (t_id, 'Authentic local lunch with vegetarian options', 4);

        -- Inclusions
        INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES
        (t_id, 'Pickup and drop-off from main hotels', 'include'),
        (t_id, 'Professional river/mountain guide', 'include'),
        (t_id, 'Insurance coverage', 'include'),
        (t_id, 'Gifts or personal souvenirs', 'exclude'),
        (t_id, 'Tips and gratuities for staff', 'exclude');

        -- FAQ
        INSERT INTO public.tour_faq (tour_id, question, answer) VALUES
        (t_id, 'What should I bring?', 'Comfortable shoes, sunscreen, and a reusable water bottle.'),
        (t_id, 'Is this suitable for children?', 'Most of our tours are family-friendly, but check the difficulty level.');

        -- Itinerary Day 1
        INSERT INTO public.tour_itineraries (tour_id, day_number, time_label, title, description) VALUES
        (t_id, 1, '08:30', '{"en": "Expedition Kick-off"}', '{"en": "Meet your guide and group at the designated starting point for a brief orientation."}');

        -- Pricing Packages
        INSERT INTO public.tour_pricing_packages (tour_id, package_name, description, base_price, max_people) VALUES
        (t_id, 'Standard Expedition', 'Complete tour experience with standard inclusions.', 100, 10),
        (t_id, 'Private VIP Package', 'Private guide and luxury transport for your group.', 500, 4);

        -- Fact Values
        INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES
        (t_id, 'f1111111-1111-1111-1111-111111111111', '8 Hours'),
        (t_id, 'f2222222-2222-2222-2222-222222222222', 'Intermediate'),
        (t_id, 'f3333333-3333-3333-3333-333333333333', '12 Max');

        -- Availability
        INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES
        (t_id, NOW() + INTERVAL '2 days', 10, 12),
        (t_id, NOW() + INTERVAL '5 days', 5, 12);
    END LOOP;
END $$;

-- H. Blog Posts (20 Posts)
INSERT INTO public.blog_posts (title, slug, excerpt, content, featured_image, category, is_published, reading_time_minutes) VALUES
('{"en": "10 Hidden Gems in Bali You Must Visit"}', 'bali-hidden-gems', '{"en": "Beyond Kuta and Seminyak lies a world of secret waterfalls and silent temples."}', '{"en": "Content goes here about Bali waterfalls."}', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&w=600', 'Guides', TRUE, 6),
('{"en": "Iceland Packing: Survive the Arctic"}', 'iceland-packing', '{"en": "The ultimate layer guide for staying warm while chasing glaciers."}', '{"en": "Icelandic weather is unpredictable..."}', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&w=600', 'Travel Tips', TRUE, 8),
('{"en": "How to Eat Like a Local in Tokyo"}', 'tokyo-foodie-guide', '{"en": "A guide to navigating ticket machines and finding the best back-alley ramen."}', '{"en": "Tokyo is a culinary wonderland..."}', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&w=600', 'Food', TRUE, 10),
('{"en": "The Spirit of Kyoto: Tea Ceremony 101"}', 'kyoto-tea-ceremony', '{"en": "Understanding the history and etiquette of the ancient matcha ritual."}', '{"en": "Kyoto is the cultural heart of Japan."}', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&w=600', 'Culture', TRUE, 5),
('{"en": "Machu Picchu: Sunrise vs Sunset"}', 'machu-picchu-timing', '{"en": "We compared the views to help you decide when to book your entry."}', '{"en": "Machu Picchu entry is now strictly timed."}', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&w=600', 'Guides', TRUE, 7),
('{"en": "Tuscany: The Best Time for Truffles"}', 'tuscany-truffle-season', '{"en": "A seasonal guide for mushroom lovers visiting the Italian countryside."}', '{"en": "Autumn in Italy means truffles..."}', 'https://images.unsplash.com/photo-1543418219-44e30b057ebd?auto=format&w=600', 'Food', TRUE, 4),
('{"en": "Capturing the Aurora: Camera Settings"}', 'aurora-photography-tips', '{"en": "How to get the perfect green glow without a $5k camera setup."}', '{"en": "Night photography is tricky..."}', 'https://images.unsplash.com/photo-1531366930499-41f695558bb2?auto=format&w=600', 'Photography', TRUE, 9),
('{"en": "Solo Travel in Peru: A Safety Guide"}', 'peru-solo-safety', '{"en": "Is Peru safe for solo female travelers? We answer your burning questions."}', '{"en": "Peru is a welcoming country..."}', 'https://images.unsplash.com/photo-1518005020250-675f210fe309?auto=format&w=600', 'Travel Tips', TRUE, 6),
('{"en": "Venice: Avoiding the Tourist Traps"}', 'venice-avoid-traps', '{"en": "How to see the Floating City without spending 20 Euro on a coffee."}', '{"en": "Venice is expensive but worth it..."}', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&w=600', 'Culture', TRUE, 11),
('{"en": "Bali Spirit: A Wellness Deep Dive"}', 'bali-wellness-retreats', '{"en": "The best yoga shalas and detoxification centers in Ubud."}', '{"en": "Bali is known as the Island of the Gods..."}', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&w=600', 'Wellness', TRUE, 8),
('{"en": "Rome: The Underground History"}', 'rome-underground-history', '{"en": "What lies beneath the cobblestones of the Eternal City."}', '{"en": "Rome has layers of history..."}', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&w=600', 'Culture', TRUE, 12),
('{"en": "Five Lakes: Best Views of Mt Fuji"}', 'mt-fuji-viewpoints', '{"en": "The most photogenic spots around Japans most iconic mountain."}', '{"en": "Mt Fuji is shy but beautiful..."}', 'https://images.unsplash.com/photo-1490806678282-4410583561a3?auto=format&w=600', 'Photography', TRUE, 6),
('{"en": "Icelandic Horses: The Friendly Gait"}', 'icelandic-horses-guide', '{"en": "Everything you need to know about the unique Tölt gait."}', '{"en": "The Icelandic horse is a small but sturdy breed..."}', 'https://images.unsplash.com/photo-1504541891213-1b1dfdadb739?auto=format&w=600', 'Adventure', TRUE, 5),
('{"en": "Sacred Valley: Ancient Wisdom"}', 'sacred-valley-history', '{"en": "Exploring the Inca archaeological sites around Cusco."}', '{"en": "The Sacred Valley was the heart of the empire..."}', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&w=600', 'Culture', TRUE, 10),
('{"en": "Akihabara: A Gamers Paradise"}', 'akihabara-gaming-guide', '{"en": "Where to find retro consoles and the latest VR tech in Tokyo."}', '{"en": "Akihabara is electric..."}', 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&w=600', 'Culture', TRUE, 7),
('{"en": "Lovina Dolphins: Ethical Watching"}', 'lovina-dolphins-ethics', '{"en": "How to ensure your sunrise boat trip supports conservation."}', '{"en": "Seeing wild dolphins is a dream..."}', 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&w=600', 'Wellness', TRUE, 5),
('{"en": "Florence: Michelangelo David Secrets"}', 'michelangelo-david-florence', '{"en": "The stories you wont hear on the standard museum tour."}', '{"en": "Michelangelo was a genius..."}', 'https://images.unsplash.com/photo-1528114039593-4366cc08227d?auto=format&w=600', 'Culture', TRUE, 9),
('{"en": "Amalfi Coast: Drive vs Ferry"}', 'amalfi-coast-transport', '{"en": "Pros and cons for navigating the winding coastal roads."}', '{"en": "The Amalfi drive is famous..."}', 'https://images.unsplash.com/photo-1533924736468-daee5293453b?auto=format&w=600', 'Travel Tips', TRUE, 6),
('{"en": "Bali Artisans: The Silver Secrets"}', 'bali-silver-artisans', '{"en": "Meeting the smiths who keep the Celuk tradition alive."}', '{"en": "Bali silver is renowned..."}', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&w=600', 'Culture', TRUE, 4),
('{"en": "Reykjavik Nightlife for Solo Travelers"}', 'reykjavik-nightlife-solo', '{"en": "The best bars to meet fellow travelers in the northernmost capital."}', '{"en": "Icelanders know how to party..."}', 'https://images.unsplash.com/photo-1531366930499-41f695558bb2?auto=format&w=600', 'Travel Tips', TRUE, 7);

-- I. Bookings (30 Dummy Bookings)
DO $$
DECLARE
    u_id UUID;
    a_id UUID;
    counter INT := 0;
BEGIN
    FOR u_id IN SELECT id FROM public.profiles WHERE role = 'customer' LIMIT 15 LOOP
        FOR a_id IN SELECT id FROM public.tour_availability LIMIT 2 LOOP
            IF counter < 30 THEN
                INSERT INTO public.bookings (customer_id, availability_id, status, total_amount_usd, currency_code, currency_amount) VALUES
                (u_id, a_id, (ARRAY['pending', 'confirmed', 'cancelled'])[floor(random() * 3 + 1)], floor(random() * 200 + 50), 'USD', 0);
                counter := counter + 1;
            END IF;
        END LOOP;
    END LOOP;
END $$;
