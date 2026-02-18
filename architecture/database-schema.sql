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

-- [Tables definitions as before, omitting for brevity in this specific block but including new blog table]

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
-- SEED DATA (DUMMY DATA)
-- ==========================================

-- 1. Destinations
INSERT INTO destinations (slug, name, image_url) VALUES
('iceland', '{"en": "Iceland", "es": "Islandia"}', 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800'),
('japan', '{"en": "Japan", "es": "Japón"}', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800'),
('peru', '{"en": "Peru", "es": "Perú"}', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800'),
('italy', '{"en": "Italy", "es": "Italia"}', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=800')
ON CONFLICT DO NOTHING;

-- 2. Tour Categories
INSERT INTO tour_categories (slug, name) VALUES
('adventure', '{"en": "Adventure", "es": "Aventura"}'),
('cultural', '{"en": "Cultural", "es": "Cultural"}'),
('luxury', '{"en": "Luxury", "es": "Lujo"}')
ON CONFLICT DO NOTHING;

-- 3. Tour Types
INSERT INTO tour_types (slug, name) VALUES
('hiking', '{"en": "Hiking", "es": "Senderismo"}'),
('foodie', '{"en": "Food & Drink", "es": "Comida y Bebida"}'),
('sailing', '{"en": "Sailing", "es": "Navegación"}')
ON CONFLICT DO NOTHING;

-- 4. Tours (Example)
WITH dest AS (SELECT id FROM destinations WHERE slug = 'iceland' LIMIT 1),
     cat AS (SELECT id FROM tour_categories WHERE slug = 'adventure' LIMIT 1),
     typ AS (SELECT id FROM tour_types WHERE slug = 'hiking' LIMIT 1)
INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured)
SELECT 
    'northern-lights-expedition',
    dest.id, cat.id, typ.id,
    '{"en": "Arctic Northern Lights Expedition", "es": "Expedición Ártica de Luces del Norte"}',
    '{"en": "Join us for an unforgettable journey into the heart of Iceland...", "es": "Únete a nosotros para un viaje inolvidable al corazón de Islandia..."}',
    1250.00, 2880, 12, 'intermediate',
    '{"https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&q=80&w=1200"}',
    true, true
FROM dest, cat, typ
ON CONFLICT DO NOTHING;

-- 5. Blog Posts
INSERT INTO blog_posts (slug, title, excerpt, content, featured_image, category) VALUES
('packing-for-iceland', '{"en": "Ultimate Iceland Packing Guide", "es": "Guía Definitiva para Empacar en Islandia"}', '{"en": "Don’t let the cold ruin your trip.", "es": "No dejes que el frío arruine tu viaje."}', '{"en": "Full guide content here...", "es": "Contenido completo de la guía aquí..."}', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800', 'Guides'),
('tokyo-food-secrets', '{"en": "5 Hidden Ramen Spots in Tokyo", "es": "5 Lugares Secretos de Ramen en Tokio"}', '{"en": "Where the locals actually eat.", "es": "Donde comen realmente los lugareños."}', '{"en": "Full guide content here...", "es": "Contenido completo de la guía aquí..."}', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800', 'Food')
ON CONFLICT DO NOTHING;
