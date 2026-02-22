
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

CREATE TABLE public.tour_fact_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES public.tour_facts(id) ON DELETE CASCADE,
    value TEXT NOT NULL
);

-- ==========================================
-- 3. CLEAN REFERENCE DATA SEEDING
-- ==========================================

-- A. Reference Data (Deterministic valid UUIDs)
INSERT INTO public.tour_categories (id, name, slug) VALUES
('01000000-0000-0000-0000-000000000001', 'Adventure', 'adventure'),
('01000000-0000-0000-0000-000000000002', 'Cultural', 'cultural'),
('01000000-0000-0000-0000-000000000003', 'Wellness', 'wellness');

INSERT INTO public.destinations (id, name, slug) VALUES
('02000000-0000-0000-0000-000000000001', '{"en": "Bali"}', 'bali');

INSERT INTO public.tour_types (id, name, slug) VALUES
('03000000-0000-0000-0000-000000000001', '{"en": "Hiking"}', 'hiking'),
('03000000-0000-0000-0000-000000000002', '{"en": "Water Sports"}', 'water-sports'),
('03000000-0000-0000-0000-000000000003', '{"en": "Photography"}', 'photography'),
('03000000-0000-0000-0000-000000000004', '{"en": "Spiritual"}', 'spiritual'),
('03000000-0000-0000-0000-000000000005', '{"en": "Foodie"}', 'foodie');

INSERT INTO public.tour_facts (id, name, icon) VALUES
('04000000-0000-0000-0000-000000000001', 'Duration', 'clock'),
('04000000-0000-0000-0000-000000000002', 'Group Size', 'users'),
('04000000-0000-0000-0000-000000000003', 'Language', 'globe');

-- B. 10 Detailed Bali Tours
DO $$
DECLARE
    ns UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    t_id UUID;
    cat_adv UUID := '01000000-0000-0000-0000-000000000001';
    cat_cul UUID := '01000000-0000-0000-0000-000000000002';
    cat_wel UUID := '01000000-0000-0000-0000-000000000003';
    dest_bali UUID := '02000000-0000-0000-0000-000000000001';
BEGIN
    -- TOUR 1: Mt Batur (FULL DATASET)
    t_id := uuid_generate_v5(ns, 'tour_bali_1');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images, important_info, booking_policy)
    VALUES (t_id, '{"en": "Mount Batur Active Volcano Sunrise Trek"}', 'mt-batur-sunrise', cat_adv, dest_bali, '03000000-0000-0000-0000-000000000001', 
    '{"en": "An unforgettable early morning hike to the summit of Mount Batur, an active volcano with breathtaking views. Witness a celestial sunrise above the clouds."}', 65.00, 600, 15, 'intermediate', 
    ARRAY['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=1200', 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200'],
    '{"en": "Bring a warm jacket as it is cold at the summit. Minimum age 12 years old recommended."}',
    '{"en": "Full refund if weather conditions make the trek unsafe as determined by our guides."}');

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "02:00 AM - Pickup"}', '{"en": "Early morning pickup from your accommodation via private transport."}'),
    (t_id, 2, '{"en": "03:30 AM - Base Camp"}', '{"en": "Safety briefing and distribution of flashlights and hiking sticks."}'),
    (t_id, 3, '{"en": "06:00 AM - The Summit Reach"}', '{"en": "Reach the peak at 1,717 meters just in time for the sunrise."}'),
    (t_id, 4, '{"en": "07:30 AM - Volcanic Breakfast"}', '{"en": "Enjoy eggs and bananas cooked by volcanic steam."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Celestial sunrise views over Mt Agung and Mt Rinjani'), 
    (t_id, 'Breakfast cooked with real volcanic steam'), 
    (t_id, 'Licensed professional local hiking guides');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Hotel pickup and drop-off', 'include'), 
    (t_id, 'English speaking guide', 'include'), 
    (t_id, 'Flashlight and hiking stick', 'include'),
    (t_id, 'Bottled water and breakfast', 'include');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Is it difficult?', 'It is a moderate hike. Most people with basic fitness can complete it in 2 hours.'),
    (t_id, 'Will I see lava?', 'No, Mt Batur is active but there are no visible lava flows currently.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '3 days', 15, 15);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '10 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 15 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 2: Ubud Jungle
    t_id := uuid_generate_v5(ns, 'tour_bali_2');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Ubud Jungle & Sacred Monkey Forest"}', 'ubud-jungle-highlights', cat_cul, dest_bali, '03000000-0000-0000-0000-000000000004', 
    '{"en": "Explore the lush heart of Bali with visits to the Tegalalang Rice Terrace and the spiritual monkey forest."}', 45.00, 480, 10, 'beginner', 
    ARRAY['https://images.unsplash.com/photo-1554443651-7871b058d867?w=1200']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "08:00 AM - Hotel Pickup"}', '{"en": "Pickup from your hotel in South Bali or Ubud."}'),
    (t_id, 2, '{"en": "09:30 AM - Sacred Monkey Forest"}', '{"en": "Explore the sanctuary and interact with the playful macaques."}'),
    (t_id, 3, '{"en": "11:30 AM - Tegalalang Rice Terrace"}', '{"en": "Walk through the iconic terraced landscapes."}'),
    (t_id, 4, '{"en": "01:00 PM - Local Lunch"}', '{"en": "Enjoy an authentic Balinese lunch overlooking the jungle."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Interact with hundreds of monkeys in their natural habitat'), 
    (t_id, 'Walk through the UNESCO-listed Tegalalang Rice Terraces'), 
    (t_id, 'Learn about Balinese culture and Hinduism');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Hotel pickup and drop-off', 'include'), 
    (t_id, 'English speaking guide', 'include'), 
    (t_id, 'Entrance fees to Monkey Forest and Rice Terraces', 'include'),
    (t_id, 'Lunch', 'exclude');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Are the monkeys aggressive?', 'They can be cheeky. Follow the guides instructions and do not bring loose food or shiny objects.'),
    (t_id, 'Is there a lot of walking?', 'Yes, expect moderate walking on uneven terrain and stairs.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '2 days', 10, 10);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '8 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 10 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 3: Nusa Penida
    t_id := uuid_generate_v5(ns, 'tour_bali_3');
    INSERT INTO public.tours (id, title, slug, category_id, destination_id, tour_type_id, description, base_price_usd, duration_minutes, max_participants, difficulty, images)
    VALUES (t_id, '{"en": "Nusa Penida: Kelingking & Crystal Bay"}', 'nusa-penida-best', cat_adv, dest_bali, '03000000-0000-0000-0000-000000000003', 
    '{"en": "Journey across the sea to see Balis most iconic coastline."}', 85.00, 720, 8, 'intermediate', 
    ARRAY['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "06:30 AM - Sanur Harbor"}', '{"en": "Meet at the harbor for the fast boat to Nusa Penida."}'),
    (t_id, 2, '{"en": "08:30 AM - Kelingking Beach"}', '{"en": "Arrive at the famous T-Rex shaped cliff."}'),
    (t_id, 3, '{"en": "11:00 AM - Angel''s Billabong"}', '{"en": "Visit the natural infinity pool."}'),
    (t_id, 4, '{"en": "01:00 PM - Crystal Bay"}', '{"en": "Relax, swim, and snorkel in the clear waters."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'See the famous T-Rex cliff at Kelingking Beach'), 
    (t_id, 'Swim in the crystal clear waters of Crystal Bay'), 
    (t_id, 'Fast boat ride across the Badung Strait');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Fast boat tickets (return)', 'include'), 
    (t_id, 'Private car on the island', 'include'), 
    (t_id, 'Snorkeling equipment', 'include'),
    (t_id, 'Lunch', 'include');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Can we hike down to Kelingking Beach?', 'The hike down is very steep and dangerous. We recommend viewing from the top, but you can hike down at your own risk if time permits.'),
    (t_id, 'Is the boat ride rough?', 'It can be bumpy depending on the weather. If you get seasick, please take medication beforehand.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '5 days', 8, 8);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '12 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 8 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 4: Uluwatu
    t_id := uuid_generate_v5(ns, 'tour_bali_4');
    INSERT INTO public.tours (id, title, slug, description, base_price_usd, images) VALUES (t_id, '{"en": "Uluwatu Temple Sunset"}', 'uluwatu-sunset', '{"en": "Dramatic performance on a cliff."}', 35.00, ARRAY['https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?w=800']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "03:30 PM - Hotel Pickup"}', '{"en": "Afternoon pickup to head to the southern peninsula."}'),
    (t_id, 2, '{"en": "05:00 PM - Uluwatu Temple"}', '{"en": "Explore the ancient temple perched on a 70-meter cliff."}'),
    (t_id, 3, '{"en": "06:00 PM - Kecak Fire Dance"}', '{"en": "Watch the mesmerizing traditional dance as the sun sets."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Stunning cliffside ocean views'), 
    (t_id, 'Traditional Kecak Fire Dance performance'), 
    (t_id, 'Encounter the resident monkeys');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Hotel pickup and drop-off', 'include'), 
    (t_id, 'Temple entrance fee', 'include'), 
    (t_id, 'Kecak dance ticket', 'include');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'What should I wear?', 'Please wear clothing that covers your knees and shoulders out of respect for the temple. Sarongs are provided if needed.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '1 day', 20, 20);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '5 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 20 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 5: Lempuyang
    t_id := uuid_generate_v5(ns, 'tour_bali_5');
    INSERT INTO public.tours (id, title, slug, description, base_price_usd, images) VALUES (t_id, '{"en": "Lempuyang Gate of Heaven"}', 'gate-of-heaven', '{"en": "The iconic photo spot."}', 55.00, ARRAY['https://images.unsplash.com/photo-1537953391648-762d01df3c14?w=800']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "05:00 AM - Early Pickup"}', '{"en": "Early start to beat the crowds and get the best light."}'),
    (t_id, 2, '{"en": "07:30 AM - Gates of Heaven"}', '{"en": "Arrive at Lempuyang Temple and take the iconic photo."}'),
    (t_id, 3, '{"en": "10:30 AM - Tirta Gangga"}', '{"en": "Visit the beautiful royal water garden."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Iconic photo at the Gates of Heaven with Mt Agung backdrop'), 
    (t_id, 'Explore the intricate Tirta Gangga water palace');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Private transportation', 'include'), 
    (t_id, 'All entrance fees', 'include'), 
    (t_id, 'English speaking driver/guide', 'include');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Is there a long wait for the photo?', 'Yes, the queue for the photo can be 1-3 hours depending on the time of day, which is why we start early.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '4 days', 6, 6);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '10 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 6 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 6: Ayung Rafting
    t_id := uuid_generate_v5(ns, 'tour_bali_6');
    INSERT INTO public.tours (id, title, slug, description, base_price_usd, images) VALUES (t_id, '{"en": "Ayung White Water Rafting"}', 'ayung-rafting', '{"en": "Paddle through the wild."}', 50.00, ARRAY['https://images.unsplash.com/photo-1530122622335-d40394391ea5?w=800']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "08:00 AM - Pickup"}', '{"en": "Transfer to the rafting starting point."}'),
    (t_id, 2, '{"en": "09:30 AM - Safety Briefing"}', '{"en": "Get equipped and learn the safety commands."}'),
    (t_id, 3, '{"en": "10:00 AM - Rafting Adventure"}', '{"en": "Navigate the rapids of the Ayung River for 2 hours."}'),
    (t_id, 4, '{"en": "12:30 PM - Buffet Lunch"}', '{"en": "Enjoy a well-deserved lunch after the activity."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Thrilling class II and III rapids'), 
    (t_id, 'Stunning jungle scenery and hidden waterfalls'), 
    (t_id, 'Professional river guides');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Rafting equipment and safety gear', 'include'), 
    (t_id, 'Buffet lunch', 'include'), 
    (t_id, 'Insurance coverage', 'include'),
    (t_id, 'Photos and videos', 'exclude');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Do I need rafting experience?', 'No prior experience is necessary. The rapids are suitable for beginners.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '2 days', 24, 24);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '6 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 24 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 7: Spiritual Blessing
    t_id := uuid_generate_v5(ns, 'tour_bali_7');
    INSERT INTO public.tours (id, title, slug, description, base_price_usd, images) VALUES (t_id, '{"en": "Spiritual Holy Water Blessing"}', 'tirta-empul', '{"en": "Soul cleansing ritual."}', 40.00, ARRAY['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "08:30 AM - Pickup"}', '{"en": "Morning pickup to head to Tampaksiring."}'),
    (t_id, 2, '{"en": "10:00 AM - Tirta Empul Temple"}', '{"en": "Learn about the temple''s history and prepare for the ritual."}'),
    (t_id, 3, '{"en": "10:30 AM - Melukat Ritual"}', '{"en": "Participate in the traditional purification bathing ritual."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Authentic Balinese purification ritual (Melukat)'), 
    (t_id, 'Visit the 10th-century Tirta Empul water temple');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Temple entrance fee', 'include'), 
    (t_id, 'Offerings for the ritual', 'include'), 
    (t_id, 'Use of traditional sarong', 'include');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'What should I bring?', 'Bring a change of clothes and a towel, as you will get fully wet during the ritual.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '6 days', 12, 12);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '4 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 12 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 8: Tanah Lot
    t_id := uuid_generate_v5(ns, 'tour_bali_8');
    INSERT INTO public.tours (id, title, slug, description, base_price_usd, images) VALUES (t_id, '{"en": "Tanah Lot Temple Sunset"}', 'tanah-lot', '{"en": "Iconic sea temple."}', 30.00, ARRAY['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "03:00 PM - Pickup"}', '{"en": "Afternoon pickup to head to the west coast."}'),
    (t_id, 2, '{"en": "04:30 PM - Taman Ayun Temple"}', '{"en": "Optional stop at the beautiful royal family temple."}'),
    (t_id, 3, '{"en": "05:30 PM - Tanah Lot"}', '{"en": "Arrive at the sea temple and find a spot for sunset."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Spectacular sunset views over the Indian Ocean'), 
    (t_id, 'See the temple perched on a rock formation in the sea');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Transportation', 'include'), 
    (t_id, 'Entrance fees', 'include');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Can we enter the temple?', 'Non-Hindus cannot enter the main temple grounds, but you can walk around the base at low tide.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '1 day', 15, 15);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '5 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 15 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 9: Dolphin Watching
    t_id := uuid_generate_v5(ns, 'tour_bali_9');
    INSERT INTO public.tours (id, title, slug, description, base_price_usd, images) VALUES (t_id, '{"en": "Lovina Dolphin Watching"}', 'lovina-dolphins', '{"en": "Sunrise boat trip."}', 45.00, ARRAY['https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "03:00 AM - Early Pickup"}', '{"en": "Very early departure for the drive to North Bali."}'),
    (t_id, 2, '{"en": "05:30 AM - Boat Departure"}', '{"en": "Board a traditional outrigger boat."}'),
    (t_id, 3, '{"en": "06:00 AM - Sunrise & Dolphins"}', '{"en": "Watch the sunrise and look for pods of wild dolphins."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Watch wild dolphins in their natural habitat'), 
    (t_id, 'Beautiful sunrise over the calm northern sea');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Boat rental', 'include'), 
    (t_id, 'Life jackets', 'include'), 
    (t_id, 'Breakfast', 'exclude');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Are sightings guaranteed?', 'While sightings are very common (90%+ chance), they are wild animals so we cannot 100% guarantee it.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '3 days', 10, 10);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '6 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 10 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

    -- TOUR 10: Cooking Class
    t_id := uuid_generate_v5(ns, 'tour_bali_10');
    INSERT INTO public.tours (id, title, slug, description, base_price_usd, images) VALUES (t_id, '{"en": "Balinese Cooking Class"}', 'ubud-cooking', '{"en": "Master Balinese spices."}', 45.00, ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800']);

    INSERT INTO public.tour_itineraries (tour_id, day_number, title, description) VALUES 
    (t_id, 1, '{"en": "08:00 AM - Local Market"}', '{"en": "Visit a traditional market to learn about local ingredients."}'),
    (t_id, 2, '{"en": "09:30 AM - Cooking Prep"}', '{"en": "Arrive at the traditional compound and prepare the spices."}'),
    (t_id, 3, '{"en": "10:30 AM - Cooking Session"}', '{"en": "Cook 5 traditional Balinese dishes under expert guidance."}'),
    (t_id, 4, '{"en": "01:00 PM - Lunch"}', '{"en": "Enjoy the feast you have prepared."}');

    INSERT INTO public.tour_highlights (tour_id, content) VALUES 
    (t_id, 'Learn to make authentic Balinese spice paste (Bumbu)'), 
    (t_id, 'Cook in a beautiful traditional Balinese family compound'), 
    (t_id, 'Take home a recipe book');

    INSERT INTO public.tour_inclusions (tour_id, content, type) VALUES 
    (t_id, 'Market tour', 'include'), 
    (t_id, 'All ingredients and equipment', 'include'), 
    (t_id, 'Recipe book', 'include'),
    (t_id, 'Lunch (what you cooked)', 'include');

    INSERT INTO public.tour_faq (tour_id, question, answer) VALUES 
    (t_id, 'Do you cater to vegetarians/vegans?', 'Yes, please let us know your dietary requirements when booking.');

    INSERT INTO public.tour_availability (tour_id, start_time, available_spots, total_spots) VALUES 
    (t_id, CURRENT_DATE + interval '7 days', 12, 12);

    INSERT INTO public.tour_fact_values (tour_id, fact_id, value) VALUES 
    (t_id, '04000000-0000-0000-0000-000000000001', '6 Hours'),
    (t_id, '04000000-0000-0000-0000-000000000002', 'Up to 12 People'),
    (t_id, '04000000-0000-0000-0000-000000000003', 'English');

END $$;

-- C. Administrators
INSERT INTO public.profiles (id, full_name, email, role, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@admin.com', 'admin', 'https://i.pravatar.cc/150?u=admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- D. Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Tours" ON public.tours FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Tours" ON public.tours FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated Update Tours" ON public.tours FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated Delete Tours" ON public.tours FOR DELETE TO authenticated USING (true);
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
