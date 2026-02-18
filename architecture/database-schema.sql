-- [Previous extension and enum definitions remain same]
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure types exist
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

-- Table for blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  excerpt JSONB,
  content JSONB NOT NULL,
  featured_image TEXT,
  category TEXT,
  reading_time_minutes INT DEFAULT 5,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SEED DATA (COMPREHENSIVE DUMMY DATA)
-- ==========================================

-- 1. Destinations
INSERT INTO destinations (slug, name, image_url) VALUES
('iceland', '{"en": "Iceland", "es": "Islandia"}', 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800'),
('japan', '{"en": "Japan", "es": "Japón"}', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800'),
('peru', '{"en": "Peru", "es": "Perú"}', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800'),
('italy', '{"en": "Italy", "es": "Italia"}', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;

-- 2. Tour Categories
INSERT INTO tour_categories (slug, name) VALUES
('adventure', '{"en": "Adventure", "es": "Aventura"}'),
('cultural', '{"en": "Cultural", "es": "Cultural"}'),
('luxury', '{"en": "Luxury", "es": "Lujo"}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 3. Tour Types
INSERT INTO tour_types (slug, name) VALUES
('hiking', '{"en": "Hiking", "es": "Senderismo"}'),
('foodie', '{"en": "Food & Drink", "es": "Comida y Bebida"}'),
('sailing', '{"en": "Sailing", "es": "Navegación"}'),
('wellness', '{"en": "Wellness", "es": "Bienestar"}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 4. Tours Seeding Function Helper
-- Since we need IDs from other tables, we'll use a temporary block to seed multiple tours correctly.
DO $$
DECLARE
    dest_iceland UUID := (SELECT id FROM destinations WHERE slug = 'iceland');
    dest_japan UUID := (SELECT id FROM destinations WHERE slug = 'japan');
    dest_peru UUID := (SELECT id FROM destinations WHERE slug = 'peru');
    dest_italy UUID := (SELECT id FROM destinations WHERE slug = 'italy');
    
    cat_adv UUID := (SELECT id FROM tour_categories WHERE slug = 'adventure');
    cat_cul UUID := (SELECT id FROM tour_categories WHERE slug = 'cultural');
    cat_lux UUID := (SELECT id FROM tour_categories WHERE slug = 'luxury');
    
    typ_hik UUID := (SELECT id FROM tour_types WHERE slug = 'hiking');
    typ_foo UUID := (SELECT id FROM tour_types WHERE slug = 'foodie');
    typ_sai UUID := (SELECT id FROM tour_types WHERE slug = 'sailing');
    typ_wel UUID := (SELECT id FROM tour_types WHERE slug = 'wellness');
BEGIN
    -- Tour 1: Northern Lights (Iceland)
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES (
        'northern-lights-expedition', dest_iceland, cat_adv, typ_hik,
        '{"en": "Arctic Northern Lights Expedition", "es": "Expedición Ártica de Luces del Norte"}',
        '{"en": "Chase the celestial dance of the Aurora Borealis through the Icelandic tundra. Led by expert photographers.", "es": "Persigue la danza celestial de la Aurora Boreal a través de la tundra islandesa. Dirigido por fotógrafos expertos."}',
        1250.00, 2880, 12, 'intermediate',
        '{"https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1531366930477-4fbd0ce926e1?auto=format&fit=crop&q=80&w=1200"}',
        true, true, 4.9, 56
    ) ON CONFLICT (slug) DO NOTHING;

    -- Tour 2: Tokyo Food (Japan)
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES (
        'tokyo-food-odyssey', dest_japan, cat_cul, typ_foo,
        '{"en": "Tokyo Midnight Food Odyssey", "es": "Odisea Gastronómica de Medianoche en Tokio"}',
        '{"en": "Explore the back-alleys of Shinjuku and Shibuya. Taste authentic ramen, yakitori, and secret sake spots.", "es": "Explora los callejones de Shinjuku y Shibuya. Prueba ramen auténtico, yakitori y lugares secretos de sake."}',
        185.00, 240, 8, 'beginner',
        '{"https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=1200"}',
        true, true, 4.8, 124
    ) ON CONFLICT (slug) DO NOTHING;

    -- Tour 3: Machu Picchu (Peru)
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES (
        'inca-trail-machu-picchu', dest_peru, cat_adv, typ_hik,
        '{"en": "Inca Trail to Machu Picchu", "es": "Camino Inca a Machu Picchu"}',
        '{"en": "The classic 4-day trek through the Andes. Witness breathtaking ruins and cloud forests before reaching the Sun Gate.", "es": "La clásica caminata de 4 días por los Andes. Presencie ruinas impresionantes y bosques nubosos antes de llegar a la Puerta del Sol."}',
        750.00, 5760, 15, 'advanced',
        '{"https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=1200"}',
        true, false, 5.0, 89
    ) ON CONFLICT (slug) DO NOTHING;

    -- Tour 4: Amalfi Sailing (Italy)
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES (
        'amalfi-coast-sailing', dest_italy, cat_lux, typ_sai,
        '{"en": "Amalfi Coast Sailing Week", "es": "Semana de Navegación por la Costa Amalfitana"}',
        '{"en": "A luxurious week-long journey aboard a private catamaran. Visit Positano, Capri, and Ravello from the turquoise water.", "es": "Un lujoso viaje de una semana a bordo de un catamarán privado. Visite Positano, Capri y Ravello desde el agua turquesa."}',
        3200.00, 10080, 6, 'beginner',
        '{"https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1516483642785-22fc1730964f?auto=format&fit=crop&q=80&w=1200"}',
        true, true, 5.0, 32
    ) ON CONFLICT (slug) DO NOTHING;

    -- Tour 5: Kyoto Wellness (Japan)
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES (
        'kyoto-zen-retreat', dest_japan, cat_cul, typ_wel,
        '{"en": "Kyoto Zen & Forest Bathing", "es": "Retiro Zen y Baño de Bosque en Kioto"}',
        '{"en": "A peaceful journey through Arashiyama bamboo groves and hidden Zen temples. Includes a traditional tea ceremony.", "es": "Un viaje tranquilo a través de los bosques de bambú de Arashiyama y templos Zen ocultos. Incluye una ceremonia de té tradicional."}',
        220.00, 360, 10, 'beginner',
        '{"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=1200"}',
        true, false, 4.7, 42
    ) ON CONFLICT (slug) DO NOTHING;

    -- Tour 6: Blue Lagoon Experience (Iceland)
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES (
        'blue-lagoon-vip', dest_iceland, cat_lux, typ_wel,
        '{"en": "Ultimate Blue Lagoon Luxury", "es": "Lujo Definitivo en el Blue Lagoon"}',
        '{"en": "Skip the lines with private lounge access, silica mud masks, and a floating massage in the volcanic waters.", "es": "Evite las colas con acceso a la sala privada, máscaras de barro de sílice y un masaje flotante en las aguas volcánicas."}',
        450.00, 180, 4, 'beginner',
        '{"https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200"}',
        true, false, 4.9, 215
    ) ON CONFLICT (slug) DO NOTHING;
END $$;

-- 5. Blog Posts
INSERT INTO blog_posts (slug, title, excerpt, content, featured_image, category) VALUES
('packing-for-iceland', '{"en": "Ultimate Iceland Packing Guide", "es": "Guía Definitiva para Empacar en Islandia"}', '{"en": "Don’t let the cold ruin your trip.", "es": "No dejes que el frío arruine tu viaje."}', '{"en": "Full guide content here...", "es": "Contenido completo de la guía aquí..."}', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800', 'Guides'),
('tokyo-food-secrets', '{"en": "5 Hidden Ramen Spots in Tokyo", "es": "5 Lugares Secretos de Ramen en Tokio"}', '{"en": "Where the locals actually eat.", "es": "Donde comen realmente los lugareños."}', '{"en": "Full guide content here...", "es": "Contenido completo de la guía aquí..."}', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800', 'Food')
ON CONFLICT (slug) DO NOTHING;
