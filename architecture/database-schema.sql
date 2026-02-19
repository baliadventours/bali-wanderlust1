
-- ==========================================
-- 0. CLEANUP & EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS public.related_tours CASCADE;
DROP TABLE IF EXISTS public.tour_reviews CASCADE;
DROP TABLE IF EXISTS public.tour_faq CASCADE;
DROP TABLE IF EXISTS public.tour_inclusions CASCADE;
DROP TABLE IF EXISTS public.tour_itineraries CASCADE;
DROP TABLE IF EXISTS public.seasonal_pricing CASCADE;
DROP TABLE IF EXISTS public.tour_pricing_packages CASCADE;
DROP TABLE IF EXISTS public.tour_highlights CASCADE;
DROP TABLE IF EXISTS public.tour_gallery CASCADE;
DROP TABLE IF EXISTS public.tour_fact_values CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.tours CASCADE;
DROP TABLE IF EXISTS public.tour_facts CASCADE;
DROP TABLE IF EXISTS public.destinations CASCADE;
DROP TABLE IF EXISTS public.tour_categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.tour_status CASCADE;
DROP TYPE IF EXISTS public.inclusion_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- ==========================================
-- 1. TYPES & CORE TABLES
-- ==========================================
CREATE TYPE public.tour_status AS ENUM ('draft', 'published');
CREATE TYPE public.inclusion_type AS ENUM ('include', 'exclude');
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'customer');

-- Profiles (Extends Auth.Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role public.user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Taxonomy
CREATE TABLE public.tour_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL DEFAULT '{"en": ""}',
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE public.tour_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT
);

-- Main Product
CREATE TABLE public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title JSONB NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.tour_categories(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    description JSONB DEFAULT '{"en": ""}',
    important_info JSONB DEFAULT '{"en": ""}',
    booking_policy JSONB DEFAULT '{"en": ""}',
    base_price_usd DECIMAL(12,2),
    duration_minutes INT,
    max_participants INT,
    difficulty TEXT DEFAULT 'Moderate',
    status public.tour_status DEFAULT 'draft',
    images TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    avg_rating DECIMAL(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. RELATIONAL TABLES
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
    base_price_idr DECIMAL(15,2),
    min_people INT DEFAULT 1,
    max_people INT DEFAULT 12
);

CREATE TABLE public.seasonal_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES public.tour_pricing_packages(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_idr DECIMAL(15,2) NOT NULL
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
    related_tour_slug TEXT,
    PRIMARY KEY (tour_id, related_tour_slug)
);

CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL,
    excerpt JSONB,
    content JSONB,
    featured_image TEXT,
    category TEXT,
    reading_time_minutes INT DEFAULT 5,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. AUTOMATION & SECURITY
-- ==========================================

-- Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 
    CASE WHEN NEW.email = 'admin@admin.com' THEN 'admin'::public.user_role ELSE 'customer'::public.user_role END);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_tours_slug ON public.tours(slug);
CREATE INDEX idx_blogs_slug ON public.blog_posts(slug);
CREATE INDEX idx_tours_status ON public.tours(status);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public Read Published Tours" ON public.tours FOR SELECT USING (status = 'published');
CREATE POLICY "Admin All Tours" ON public.tours FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public Read Blogs" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admin All Blogs" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 4. INITIAL SEED DATA (CORE TAXONOMY)
-- ==========================================
INSERT INTO public.tour_categories (name, slug) VALUES 
('Adventure', 'adventure'),
('Cultural', 'cultural'),
('Nature', 'nature'),
('Waterfall', 'waterfall'),
('Temple', 'temple'),
('Island Tour', 'island-tour'),
('Romantic', 'romantic'),
('Family Friendly', 'family-friendly');

INSERT INTO public.destinations (name, slug) VALUES 
('{"en": "Ubud"}', 'ubud'),
('{"en": "Uluwatu"}', 'uluwatu'),
('{"en": "Nusa Penida"}', 'nusa-penida'),
('{"en": "Kintamani"}', 'kintamani'),
('{"en": "Sidemen"}', 'sidemen'),
('{"en": "East Bali"}', 'east-bali'),
('{"en": "North Bali"}', 'north-bali'),
('{"en": "Canggu"}', 'canggu');

INSERT INTO public.tour_facts (name, icon) VALUES 
('Duration', 'clock'),
('Difficulty', 'zap'),
('Pickup Area', 'map-pin'),
('Start Time', 'sunrise');

-- ==========================================
-- 5. SEED DATA: 20 BALI TOURS
-- ==========================================

-- 1. Ubud Jungle Expedition
WITH inserted_tour AS (
  INSERT INTO public.tours (title, slug, description, base_price_usd, duration_minutes, max_participants, difficulty, status, is_published, images, avg_rating, review_count, category_id, destination_id)
  VALUES (
    '{"en": "Ubud Jungle Expedition & ATV Adventure"}', 
    'ubud-jungle-expedition', 
    '{"en": "Experience the ultimate Ubud adventure. This tour combines a thrilling ATV ride through rice paddies and jungles with a visit to the Sacred Monkey Forest."}', 
    55.00, 480, 10, 'Moderate', 'published', true, 
    '{"https://images.unsplash.com/photo-1554443651-7871b058d867", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2", "https://images.unsplash.com/photo-1537996194471-e657df975ab4"}',
    4.9, 128, 
    (SELECT id FROM tour_categories WHERE slug = 'adventure'), 
    (SELECT id FROM destinations WHERE slug = 'ubud')
  ) RETURNING id
)
INSERT INTO public.tour_highlights (tour_id, content, sort_order) 
SELECT id, unnest(array['Ride an ATV through hidden jungle trails', 'Visit the famous Ubud Monkey Forest', 'Walk through Tegalalang Rice Terraces', 'Enjoy a traditional Balinese lunch with a view']), generate_series(1,4) FROM inserted_tour;

-- (Repeat pattern for other 19 tours in a real seed, here showing condensed version for the most popular)
-- 2. Mt Batur Sunrise
INSERT INTO public.tours (title, slug, description, base_price_usd, duration_minutes, max_participants, difficulty, status, is_published, images, avg_rating, review_count, category_id, destination_id)
VALUES (
  '{"en": "Mount Batur Sunrise Trekking & Hot Springs"}', 
  'mt-batur-sunrise', 
  '{"en": "Hike the active volcano of Mount Batur under the stars and witness one of the most spectacular sunrises in Asia."}', 
  65.00, 600, 15, 'Hard', 'published', true, 
  '{"https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8", "https://images.unsplash.com/photo-1508672019048-805c876b67e2", "https://images.unsplash.com/photo-1502680390469-be75c86b636f", "https://images.unsplash.com/photo-1469474968028-56623f02e42e"}',
  4.8, 850, 
  (SELECT id FROM tour_categories WHERE slug = 'adventure'), 
  (SELECT id FROM destinations WHERE slug = 'kintamani')
);

-- 3. Nusa Penida Day Trip
INSERT INTO public.tours (title, slug, description, base_price_usd, duration_minutes, max_participants, difficulty, status, is_published, images, avg_rating, review_count, category_id, destination_id)
VALUES (
  '{"en": "Nusa Penida: The Ultimate Instagram Adventure"}', 
  'nusa-penida-ultimate', 
  '{"en": "Discover the most iconic spots of Nusa Penida island, including Kelingking Beach and Broken Beach."}', 
  85.00, 720, 8, 'Moderate', 'published', true, 
  '{"https://images.unsplash.com/photo-1544644181-1484b3fdfc62", "https://images.unsplash.com/photo-1537953391648-762d01df3c14", "https://images.unsplash.com/photo-1502680390469-be75c86b636f", "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8"}',
  4.9, 2100, 
  (SELECT id FROM tour_categories WHERE slug = 'island-tour'), 
  (SELECT id FROM destinations WHERE slug = 'nusa-penida')
);

-- 4. Lempuyang Gateway
INSERT INTO public.tours (title, slug, description, base_price_usd, duration_minutes, max_participants, difficulty, status, is_published, images, avg_rating, review_count, category_id, destination_id)
VALUES (
  '{"en": "Gate of Heaven: Lempuyang Temple & Tirta Gangga"}', 
  'lempuyang-gate-of-heaven', 
  '{"en": "Visit the most sacred and photographed temple in Bali, the Lempuyang Temple, also known as the Gate of Heaven."}', 
  50.00, 600, 10, 'Easy', 'published', true, 
  '{"https://images.unsplash.com/photo-1537953391648-762d01df3c14", "https://images.unsplash.com/photo-1540541338287-41700207dee6", "https://images.unsplash.com/photo-1558005530-d7c4ec1630aa", "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2"}',
  4.7, 540, 
  (SELECT id FROM tour_categories WHERE slug = 'temple'), 
  (SELECT id FROM destinations WHERE slug = 'east-bali')
);

-- 5. Uluwatu Sunset
INSERT INTO public.tours (title, slug, description, base_price_usd, duration_minutes, max_participants, difficulty, status, is_published, images, avg_rating, review_count, category_id, destination_id)
VALUES (
  '{"en": "Uluwatu Temple Sunset & Kecak Fire Dance"}', 
  'uluwatu-sunset-kecak', 
  '{"en": "Perched on a 70-meter cliff, Uluwatu Temple offers the best sunset view in Bali paired with a cultural fire dance performance."}', 
  35.00, 300, 20, 'Easy', 'published', true, 
  '{"https://images.unsplash.com/photo-1558005530-d7c4ec1630aa", "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2", "https://images.unsplash.com/photo-1537953391648-762d01df3c14", "https://images.unsplash.com/photo-1554443651-7871b058d867"}',
  4.8, 980, 
  (SELECT id FROM tour_categories WHERE slug = 'cultural'), 
  (SELECT id FROM destinations WHERE slug = 'uluwatu')
);

-- ... (Continue for 20 tours to ensure full coverage)
INSERT INTO public.tours (title, slug, description, base_price_usd, status, is_published, category_id, destination_id, images) VALUES
('{"en": "Sekumpul Waterfall Private Trek"}', 'sekumpul-waterfall-trek', '{"en": "The tallest waterfall in Bali."}', 60, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'waterfall'), (SELECT id FROM destinations WHERE slug = 'north-bali'), '{"https://images.unsplash.com/photo-1508672019048-805c876b67e2"}'),
('{"en": "Lovina Dolphin Watching Sunrise"}', 'lovina-dolphin-sunrise', '{"en": "See dolphins in the wild."}', 45, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'nature'), (SELECT id FROM destinations WHERE slug = 'north-bali'), '{"https://images.unsplash.com/photo-1544928147-79a2dbc1f389"}'),
('{"en": "Canggu Surf School Lesson"}', 'canggu-surf-lesson', '{"en": "Learn to surf in Canggu."}', 40, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'adventure'), (SELECT id FROM destinations WHERE slug = 'canggu'), '{"https://images.unsplash.com/photo-1502680390469-be75c86b636f"}'),
('{"en": "Sidemen Valley Traditional Trek"}', 'sidemen-valley-trek', '{"en": "Untouched rice terraces."}', 40, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'nature'), (SELECT id FROM destinations WHERE slug = 'sidemen'), '{"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2"}'),
('{"en": "Romantic Cave Dinner Nusa Dua"}', 'romantic-cave-dinner', '{"en": "Luxury dining experience."}', 450, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'romantic'), (SELECT id FROM destinations WHERE slug = 'uluwatu'), '{"https://images.unsplash.com/photo-1414235077428-338989a2e8c0"}'),
('{"en": "Ayung River White Water Rafting"}', 'ayung-river-rafting', '{"en": "Thrills in the jungle."}', 50, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'adventure'), (SELECT id FROM destinations WHERE slug = 'ubud'), '{"https://images.unsplash.com/photo-1530122622335-d40394391ea5"}'),
('{"en": "Bali Swing & Tegalalang Tour"}', 'bali-swing-tegalalang', '{"en": "Iconic jungle swing."}', 45, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'family-friendly'), (SELECT id FROM destinations WHERE slug = 'ubud'), '{"https://images.unsplash.com/photo-1554443651-7871b058d867"}'),
('{"en": "Tanah Lot Sunset Pilgrimage"}', 'tanah-lot-sunset', '{"en": "Temple on the sea."}', 30, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'temple'), (SELECT id FROM destinations WHERE slug = 'canggu'), '{"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2"}'),
('{"en": "Menjangan Island Snorkeling"}', 'menjangan-snorkeling', '{"en": "Best marine life in Bali."}', 95, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'nature'), (SELECT id FROM destinations WHERE slug = 'north-bali'), '{"https://images.unsplash.com/photo-1544551763-47a15950c57f"}'),
('{"en": "Ubud Art Market & Palace Walk"}', 'ubud-art-market-palace', '{"en": "Cultural heart of Bali."}', 25, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'cultural'), (SELECT id FROM destinations WHERE slug = 'ubud'), '{"https://images.unsplash.com/photo-1537996194471-e657df975ab4"}'),
('{"en": "Tirta Empul Holy Water Blessing"}', 'tirta-empul-blessing', '{"en": "Spiritual purification."}', 40, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'temple'), (SELECT id FROM destinations WHERE slug = 'ubud'), '{"https://images.unsplash.com/photo-1540541338287-41700207dee6"}'),
('{"en": "Jatiluwih Rice Terrace Cycling"}', 'jatiluwih-cycling', '{"en": "UNESCO heritage scenery."}', 65, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'nature'), (SELECT id FROM destinations WHERE slug = 'ubud'), '{"https://images.unsplash.com/photo-1444464666168-49d633b867ad"}'),
('{"en": "Bali Safari & Marine Park Day"}', 'bali-safari-park', '{"en": "Family wildlife adventure."}', 85, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'family-friendly'), (SELECT id FROM destinations WHERE slug = 'ubud'), '{"https://images.unsplash.com/photo-1540206351-d6465b3ac5c1"}'),
('{"en": "Blue Lagoon Padangbai Snorkel"}', 'blue-lagoon-snorkel', '{"en": "Crystal clear waters."}', 45, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'adventure'), (SELECT id FROM destinations WHERE slug = 'east-bali'), '{"https://images.unsplash.com/photo-1544551763-47a15950c57f"}'),
('{"en": "Uluwatu Beach Club Hopping"}', 'uluwatu-beach-clubs', '{"en": "Modern coastal luxury."}', 120, 'published', true, (SELECT id FROM tour_categories WHERE slug = 'romantic'), (SELECT id FROM destinations WHERE slug = 'uluwatu'), '{"https://images.unsplash.com/photo-1502680390469-be75c86b636f"}');

-- ==========================================
-- 6. SEED DATA: 10 BLOG POSTS
-- ==========================================
INSERT INTO public.blog_posts (slug, title, excerpt, content, featured_image, category) VALUES
('packing-for-bali-tips', '{"en": "What to Pack for Your Bali Adventure: The Ultimate Guide"}', '{"en": "From temple dress codes to jungle gear, here is everything you need."}', '{"en": "Packing for Bali is an art form. You need to balance the tropical heat with the respect required for sacred temples..."}', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'Guides'),
('hidden-waterfalls-bali', '{"en": "5 Hidden Waterfalls in North Bali You Must Visit"}', '{"en": "Escape the crowds and discover these secret gems."}', '{"en": "While Tegenungan is famous, North Bali hides some of the most majestic falls..."}', 'https://images.unsplash.com/photo-1530122622335-d40394391ea5', 'Nature'),
('bali-temple-etiquette', '{"en": "Bali Temple Etiquette: How to Respect Local Culture"}', '{"en": "A guide to sarongs, behavior, and offerings."}', '{"en": "Bali is known as the Island of a Thousand Temples. When visiting these holy sites..."}', 'https://images.unsplash.com/photo-1537953391648-762d01df3c14', 'Culture'),
('best-time-to-visit-bali', '{"en": "When is the Best Time to Visit Bali?"}', '{"en": "A seasonal guide to weather, crowds, and festivals."}', '{"en": "Dry season or wet season? Depending on what you want to do..."}', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9', 'Travel Tips'),
('ubud-food-guide', '{"en": "The Foodie’s Guide to Ubud: Best Warungs and Cafes"}', '{"en": "From Babi Guling to vegan delights."}', '{"en": "Ubud is a culinary melting pot. You can find everything from 50-cent street food..."}', 'https://images.unsplash.com/photo-1552611052-33e04de081de', 'Food'),
('nusa-penida-safety', '{"en": "Staying Safe in Nusa Penida: Road and Cliff Tips"}', '{"en": "Everything you need to know before you rent a scooter."}', '{"en": "The roads in Nusa Penida are famously difficult. Here is our safety guide..."}', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62', 'Safety'),
('digital-nomad-bali', '{"en": "Bali for Digital Nomads: Best Coworking Spaces"}', '{"en": "The ultimate guide to working remotely in paradise."}', '{"en": "Canggu and Ubud are the hubs for remote workers worldwide..."}', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643', 'Lifestyle'),
('bali-with-kids', '{"en": "Bali with Kids: Top Family-Friendly Activities"}', '{"en": "Fun for all ages on the Island of the Gods."}', '{"en": "From waterparks to monkey forests, kids love Bali..."}', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957', 'Family'),
('sustainable-travel-bali', '{"en": "How to Travel Sustainably in Bali"}', '{"en": "Tips for reducing your footprint while enjoying your stay."}', '{"en": "Bali faces significant waste challenges. Here is how you can help..."}', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2', 'Eco Travel'),
('solo-traveler-bali', '{"en": "The Solo Traveler’s Guide to Bali"}', '{"en": "Is Bali safe for solo travelers? Yes! Here is why."}', '{"en": "Meeting people in Bali is easier than anywhere else in the world..."}', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Solo Travel');
