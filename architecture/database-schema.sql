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

    -- Drop all functions in public schema (Corrected for PG versions where proargtypes is used)
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
    price_tiers JSONB DEFAULT '[]', -- [{people: 1, price: 100}, {people: 2, price: 50}]
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
-- 11. RELATED TOURS (Ambiguity Resolved)
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

-- POLICIES
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

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
    'admin' -- Granting admin automatically for initial setup
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
-- 14. SEED DATA (10 Specific Bali Tours)
-- ==========================================

-- Categories
INSERT INTO public.tour_categories (id, name, slug) VALUES
('11111111-1111-1111-1111-111111111111', 'Adventure', 'adventure'),
('22222222-2222-2222-2222-222222222222', 'Cultural', 'cultural'),
('33333333-3333-3333-3333-333333333333', 'Wellness', 'wellness'),
('44444444-4444-4444-4444-444444444444', 'Luxury', 'luxury'),
('55555555-5555-5555-5555-555555555555', 'Nature', 'nature');

-- Destinations (Only Bali)
INSERT INTO public.destinations (id, name, slug) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"en": "Bali"}', 'bali');

-- Tour Types
INSERT INTO public.tour_types (id, name, slug) VALUES
('00000000-0000-0000-0000-000000000001', '{"en": "Hiking"}', 'hiking'),
('00000000-0000-0000-0000-000000000002', '{"en": "Water Sports"}', 'water-sports'),
('00000000-0000-0000-0000-000000000003', '{"en": "Foodie"}', 'foodie'),
('00000000-0000-0000-0000-000000000004', '{"en": "Photography"}', 'photography'),
('00000000-0000-0000-0000-000000000005', '{"en": "Spiritual"}', 'spiritual');

-- Tour Facts
INSERT INTO public.tour_facts (id, name, icon) VALUES
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'Duration', 'clock'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Difficulty', 'zap'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'Group Size', 'users'),
('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'Languages', 'globe');

-- Tours & Related Data (Using hex-compatible UUID prefixes)
DO $$
DECLARE
    bali_dest UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    adv_cat UUID := '11111111-1111-1111-1111-111111111111';
    cul_cat UUID := '22222222-2222-2222-2222-222222222222';
    wel_cat UUID := '33333333-3333-3333-3333-333333333333';
    lux_cat UUID := '44444444-4444-4444-4444-444444444444';
    nat_cat UUID := '55555555-5555-5555-5555-555555555555';
    
    t1_id UUID := 'b1000000-0000-0000-0000-000000000001';
    t2_id UUID := 'b1000000-0000-0000-0000-000000000002';
    t3_id UUID := 'b1000000-0000-0000-0000-000000000003';
    t4_id UUID := 'b1000000-0000-0000-0000-000000000004';
    t5_id UUID := 'b1000000-0000-0000-0000-000000000005';
    t6_id UUID := 'b1000000-0000-0000-0000-000000000006';
    t7_id UUID := 'b1000000-0000-0000-0000-000000000007';
    t8_id UUID := 'b1000000-0000-0000-0000-000000000008';
    t9_id UUID := 'b1000000-0000-0000-0000-000000000009';
    t10_id UUID := 'b1000000-0000-0000-0000-000000000010';
BEGIN
    -- Tour 1: Ubud Jungle Highlights
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t1_id, '{"en": "Ubud Jungle & Sacred Monkey Forest"}', 'ubud-jungle-highlights', cul_cat, bali_dest, '00000000-0000-0000-0000-000000000005', '{"en": "Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace and the Sacred Monkey Forest Sanctuary."}', 45.00, 480, 10, TRUE, 'published', 'beginner', '{"https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=800"}');
    
    -- Tour 2: Mt Batur Sunrise
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t2_id, '{"en": "Mount Batur Active Volcano Sunrise Trek"}', 'mt-batur-sunrise', adv_cat, bali_dest, '00000000-0000-0000-0000-000000000001', '{"en": "Hike to the summit of an active volcano and watch the sunrise over Bali while eating eggs cooked in volcanic steam."}', 65.00, 600, 15, TRUE, 'published', 'intermediate', '{"https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800"}');
    
    -- Tour 3: Nusa Penida Best
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t3_id, '{"en": "Nusa Penida: Kelingking & Crystal Bay"}', 'nusa-penida-best', adv_cat, bali_dest, '00000000-0000-0000-0000-000000000004', '{"en": "The ultimate day trip to the most famous coastline in the world. Includes speedboat and private driver."}', 85.00, 720, 8, TRUE, 'published', 'intermediate', '{"https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800"}');

    -- Tour 4: Uluwatu Kecak
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t4_id, '{"en": "Uluwatu Temple Sunset & Fire Dance"}', 'uluwatu-kecak-dance', cul_cat, bali_dest, '00000000-0000-0000-0000-000000000005', '{"en": "A dramatic performance on a cliff edge overlooking the Indian Ocean at sunset."}', 35.00, 300, 20, TRUE, 'published', 'beginner', '{"https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?auto=format&fit=crop&q=80&w=800"}');

    -- Tour 5: Lempuyang Gate of Heaven
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t5_id, '{"en": "Lempuyang Temple: Gate of Heaven Photo Tour"}', 'lempuyang-gate-of-heaven', cul_cat, bali_dest, '00000000-0000-0000-0000-000000000004', '{"en": "Capture the iconic photo between the Hindu gates with the majestic Mount Agung in the background."}', 55.00, 600, 10, TRUE, 'published', 'beginner', '{"https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=800"}');

    -- Tour 6: Ayung Rafting
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t6_id, '{"en": "Ayung River White Water Rafting"}', 'ayung-river-rafting', adv_cat, bali_dest, '00000000-0000-0000-0000-000000000002', '{"en": "Paddle through wild rapids and past hidden waterfalls in Bali finest river rafting experience."}', 50.00, 240, 30, TRUE, 'published', 'intermediate', '{"https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=800"}');

    -- Tour 7: Tirta Empul Blessing
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t7_id, '{"en": "Spiritual Holy Water Temple Blessing"}', 'tirta-empul-blessing', wel_cat, bali_dest, '00000000-0000-0000-0000-000000000005', '{"en": "Participate in a traditional purification ritual at the sacred springs of Tirta Empul temple."}', 40.00, 360, 6, TRUE, 'published', 'beginner', '{"https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800"}');

    -- Tour 8: Tanah Lot Sunset
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t8_id, '{"en": "Tanah Lot Temple Sunset Expedition"}', 'tanah-lot-sunset', cul_cat, bali_dest, '00000000-0000-0000-0000-000000000004', '{"en": "Visit the temple on the sea, one of Bali most iconic landmarks, perfectly timed for the sunset."}', 30.00, 300, 15, TRUE, 'published', 'beginner', '{"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800"}');

    -- Tour 9: Seminyak Food Tour
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t9_id, '{"en": "Seminyak Night Market & Foodie Tour"}', 'seminyak-food-tour', cul_cat, bali_dest, '00000000-0000-0000-0000-000000000003', '{"en": "Eat like a local in the heart of Seminyak. Sample satay, suckling pig, and exotic tropical fruits."}', 35.00, 180, 12, TRUE, 'published', 'beginner', '{"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"}');

    -- Tour 10: Jatiluwih E-Bike
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, is_published, status, difficulty, images) VALUES
    (t10_id, '{"en": "Jatiluwih UNESCO Rice Terrace E-Bike Tour"}', 'jatiluwih-cycling', nat_cat, bali_dest, '00000000-0000-0000-0000-000000000001', '{"en": "Ride an electric bike through the spectacular UNESCO protected rice terraces of central Bali."}', 65.00, 240, 10, TRUE, 'published', 'beginner', '{"https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=800"}');

    -- Sync Highlights for all tours
    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t1_id, 'Visit Sacred Monkey Forest'), (t1_id, 'Rice Terrace Views'), (t1_id, 'Traditional Lunch Included'),
    (t2_id, 'Volcano Summit Sunrise'), (t2_id, 'Volcanic Steam Breakfast'), (t2_id, 'Lake Batur Views'),
    (t3_id, 'Kelingking "T-Rex" Beach'), (t3_id, 'Angel Billabong & Broken Beach'), (t3_id, 'Snorkeling at Crystal Bay'),
    (t4_id, 'Clifftop Temple View'), (t4_id, 'Traditional Kecak Performance'), (t4_id, 'Indian Ocean Sunset'),
    (t5_id, 'Mount Agung Backdrop'), (t5_id, 'Mirror Effect Photography'), (t5_id, 'Water Palace Visit'),
    (t6_id, 'Grade II & III Rapids'), (t6_id, 'Waterfall Swim Break'), (t6_id, 'Valley Forest Scenery'),
    (t7_id, 'Traditional Melukat Ritual'), (t7_id, 'Temple History Lesson'), (t7_id, 'Canang Sari Making'),
    (t8_id, 'Offshore Temple Photo'), (t8_id, 'Breathtaking Sunset'), (t8_id, 'Coastal Cliff Walk'),
    (t9_id, 'Hidden Alleyway Eats'), (t9_id, 'Local Nasi Campur'), (t9_id, 'Balinese Coffee Tasting'),
    (t10_id, 'Sustainable Tourism Walk'), (t10_id, 'UNESCO Heritage Sites'), (t10_id, 'Effortless E-Biking');

    -- Pricing Packages with Tiers
    INSERT INTO public.tour_pricing_packages (tour_id, package_name, description, price_tiers) VALUES 
    (t1_id, 'Standard Group', 'Join a shared expedition', '[{"people": 1, "price": 45}, {"people": 4, "price": 40}]'),
    (t2_id, 'Private Trek', 'Personal guide for your group', '[{"people": 1, "price": 120}, {"people": 2, "price": 65}, {"people": 4, "price": 50}]'),
    (t3_id, 'Nusa Day Trip', 'Complete island transfer', '[{"people": 1, "price": 85}, {"people": 3, "price": 75}]'),
    (t4_id, 'Evening Special', 'Dance & Dinner combo', '[{"people": 1, "price": 35}]'),
    (t5_id, 'VIP Photo Tour', 'Includes photographer service', '[{"people": 1, "price": 95}, {"people": 2, "price": 55}]'),
    (t6_id, 'Rafting Plus', 'Includes lunch & shower', '[{"people": 1, "price": 50}, {"people": 5, "price": 45}]'),
    (t7_id, 'Soul Cleansing', 'Guided spiritual ritual', '[{"people": 1, "price": 40}]'),
    (t8_id, 'Sunset Coastal', 'Entry & Transport included', '[{"people": 1, "price": 30}]'),
    (t9_id, 'Foodie Feast', 'Includes 8 tastings', '[{"people": 1, "price": 35}]'),
    (t10_id, 'Nature Cycle', 'E-bike rental included', '[{"people": 1, "price": 65}]');

    -- Itineraries
    INSERT INTO public.tour_itineraries (tour_id, day_number, time_label, title, description) VALUES
    (t1_id, 1, '09:00 AM', '{"en": "Monkey Forest"}', '{"en": "Enter the sacred sanctuary and meet the long-tailed macaques."}'),
    (t1_id, 1, '12:00 PM', '{"en": "Organic Lunch"}', '{"en": "Healthy meal with a view of the emerald rice terraces."}'),
    (t2_id, 1, '03:30 AM', '{"en": "Base Camp"}', '{"en": "Begin the ascent in the dark with professional headlights."}'),
    (t2_id, 1, '06:15 AM', '{"en": "Sunrise Summit"}', '{"en": "Enjoy breakfast while the sun rises over Mount Agung."}');

    -- Fact values
    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES
    (t1_id, 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '8 Hours'),
    (t2_id, 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '10 Hours'),
    (t1_id, 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Easy'),
    (t2_id, 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Challenging');

END $$;
