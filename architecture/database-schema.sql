
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
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
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

-- Explicitly Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- POLICIES
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users Insert Own Profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public Read Tours" ON public.tours FOR SELECT USING (true);
CREATE POLICY "Admin Manage Tours" ON public.tours FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public Read Availability" ON public.tour_availability FOR SELECT USING (true);
CREATE POLICY "Admin Manage Availability" ON public.tour_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users Read Own Bookings" ON public.bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Admin Manage Bookings" ON public.bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public Read Blog" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.tour_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public Read Tour Types" ON public.tour_types FOR SELECT USING (true);

-- ==========================================
-- 13. AUTH TRIGGER (Auto-Grant Admin)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Traveler'), 
    new.email, 
    'admin' -- ALL USERS ARE ADMINS FOR DEVELOPMENT
  )
  ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    full_name = EXCLUDED.full_name, 
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 14. SEED DATA (THE GOLDEN PACK)
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
('cccccccc-cccc-cccc-cccc-cccccccccccc', '{"en": "Japan", "es": "Japón"}', 'japan');

-- C. Tour Types (Fixed: Replaced invalid 't' prefix with valid hex '9')
INSERT INTO public.tour_types (id, name, slug) VALUES
('91111111-1111-1111-1111-111111111111', '{"en": "Hiking", "es": "Senderismo"}', 'hiking'),
('92222222-2222-2222-2222-222222222222', '{"en": "Water Sports", "es": "Deportes Acuáticos"}', 'water-sports'),
('93333333-3333-3333-3333-333333333333', '{"en": "Foodie", "es": "Gastronomía"}', 'foodie');

-- D. Tour Facts
INSERT INTO public.tour_facts (id, name, icon) VALUES
('f1111111-1111-1111-1111-111111111111', 'Duration', 'clock'),
('f2222222-2222-2222-2222-222222222222', 'Difficulty', 'zap'),
('f3333333-3333-3333-3333-333333333333', 'Max Group', 'users');

-- E. Premium Tour 1: Ubud Jungle
INSERT INTO public.tours (id, title, slug, category_id, destination_id, description, base_price_usd, duration_minutes, max_participants, status, is_published, difficulty, images) VALUES
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 
 '{"en": "Ubud Jungle & Sacred Monkey Forest", "es": "Selva de Ubud y Bosque Sagrado"}', 
 'ubud-jungle-highlights', 
 '22222222-2222-2222-2222-222222222222', 
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 '{"en": "Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace and the spiritual Monkey Forest.", "es": "Explora el exuberante corazón de Bali con una visita a la terraza de arroz de Tegalalang."}', 
 45.00, 480, 10, 'published', TRUE, 'beginner', 
 '{"https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200"}');

INSERT INTO public.tour_itineraries (tour_id, day_number, title, description, time_label) VALUES
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 1, '{"en": "Morning Pick-up"}', '{"en": "Our guide will meet you at your hotel."}', '08:00'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 1, '{"en": "Rice Terrace Walk"}', '{"en": "Wander through the iconic Tegalalang terraces."}', '10:00'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 1, '{"en": "Lunch with a View"}', '{"en": "Enjoy Balinese cuisine overlooking the jungle."}', '13:00');

INSERT INTO public.tour_pricing_packages (tour_id, package_name, description, base_price, max_people) VALUES
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'Standard Day Pass', 'Full access to all listed sites and lunch.', 45.00, 10);

-- F. Premium Tour 2: Mt Batur
INSERT INTO public.tours (id, title, slug, category_id, destination_id, description, base_price_usd, duration_minutes, max_participants, status, is_published, difficulty, images) VALUES
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 
 '{"en": "Mount Batur Active Volcano Sunrise Trek", "es": "Caminata al Amanecer Monte Batur"}', 
 'mt-batur-sunrise', 
 '11111111-1111-1111-1111-111111111111', 
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 '{"en": "Hike to the summit of an active volcano and watch the sunrise from 1,717 meters above sea level.", "es": "Camina hasta la cima de un volcán activo y observa el amanecer."}', 
 65.00, 600, 15, 'published', TRUE, 'intermediate', 
 '{"https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=1200"}');

INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', NOW() + INTERVAL '2 days', 10, 10),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', NOW() + INTERVAL '5 days', 8, 10),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', NOW() + INTERVAL '3 days', 15, 15);

-- G. Blog Posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, featured_image, category, is_published) VALUES
('{"en": "Packing for Iceland: The Ultimate Guide"}', 'packing-for-iceland', '{"en": "Don’t let the cold ruin your trip."}', '{"en": "Layers are everything in the land of fire and ice."}', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800', 'Guides', TRUE);
