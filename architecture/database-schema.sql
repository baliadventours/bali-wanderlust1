-- [Previous extensions and enums remain same]
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

-- Table for blog posts (if not exists)
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
-- SEED DATA (BALI SPECIAL)
-- ==========================================

-- 1. Destinations
INSERT INTO destinations (slug, name, image_url) VALUES
('bali', '{"en": "Bali", "es": "Bali"}', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800'),
('iceland', '{"en": "Iceland", "es": "Islandia"}', 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800'),
('japan', '{"en": "Japan", "es": "Japón"}', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;

-- 2. Categories & Types
INSERT INTO tour_categories (slug, name) VALUES
('adventure', '{"en": "Adventure", "es": "Aventura"}'),
('cultural', '{"en": "Cultural", "es": "Cultural"}'),
('wellness', '{"en": "Wellness", "es": "Bienestar"}'),
('luxury', '{"en": "Luxury", "es": "Lujo"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tour_types (slug, name) VALUES
('hiking', '{"en": "Hiking", "es": "Senderismo"}'),
('water-sports', '{"en": "Water Sports", "es": "Deportes Acuáticos"}'),
('photography', '{"en": "Photography", "es": "Fotografía"}'),
('spiritual', '{"en": "Spiritual", "es": "Espiritual"}')
ON CONFLICT (slug) DO NOTHING;

-- 3. The Big Bali Seed (20 Tours)
DO $$
DECLARE
    dest_bali UUID := (SELECT id FROM destinations WHERE slug = 'bali');
    cat_adv UUID := (SELECT id FROM tour_categories WHERE slug = 'adventure');
    cat_cul UUID := (SELECT id FROM tour_categories WHERE slug = 'cultural');
    cat_wel UUID := (SELECT id FROM tour_categories WHERE slug = 'wellness');
    cat_lux UUID := (SELECT id FROM tour_categories WHERE slug = 'luxury');
    typ_hik UUID := (SELECT id FROM tour_types WHERE slug = 'hiking');
    typ_wat UUID := (SELECT id FROM tour_types WHERE slug = 'water-sports');
    typ_pho UUID := (SELECT id FROM tour_types WHERE slug = 'photography');
    typ_spi UUID := (SELECT id FROM tour_types WHERE slug = 'spiritual');
BEGIN
    -- 1. Ubud Monkey Forest & Rice Terrace
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('ubud-nature-highlights', dest_bali, cat_cul, typ_pho, '{"en": "Ubud Jungle & Sacred Monkey Forest", "es": "Selva de Ubud y Bosque Sagrado de Monos"}', '{"en": "Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace and the playful inhabitants of the Monkey Forest.", "es": "Explora el exuberante corazón de Bali con una visita a la terraza de arroz de Tegalalang."}', 45.00, 480, 10, 'beginner', '{"https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=800"}', true, true, 4.9, 1205);

    -- 2. Mount Batur Sunrise Trek
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('mt-batur-sunrise', dest_bali, cat_adv, typ_hik, '{"en": "Mount Batur Active Volcano Sunrise Trek", "es": "Caminata al Amanecer del Volcán Activo Monte Batur"}', '{"en": "Hike to the summit of an active volcano and watch the sunrise over the clouds.", "es": "Camina hasta la cima de un volcán activo y contempla el amanecer."}', 65.00, 600, 15, 'intermediate', '{"https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800"}', true, true, 4.8, 850);

    -- 3. Nusa Penida Instagram Tour
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('nusa-penida-best', dest_bali, cat_adv, typ_pho, '{"en": "Nusa Penida: Kelingking & Crystal Bay", "es": "Nusa Penida: Kelingking y Crystal Bay"}', '{"en": "The ultimate day trip to the most famous coastline in the world.", "es": "El viaje de un día definitivo a la costa más famosa del mundo."}', 85.00, 720, 8, 'intermediate', '{"https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800"}', true, true, 4.9, 2100);

    -- 4. Uluwatu Temple Sunset & Kecak Dance
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('uluwatu-sunset-kecak', dest_bali, cat_cul, typ_spi, '{"en": "Uluwatu Temple Cliff Sunset & Fire Dance", "es": "Puesta de Sol en el Templo de Uluwatu y Danza de Fuego"}', '{"en": "A dramatic performance on a cliff edge overlooking the Indian Ocean.", "es": "Una actuación dramática en el borde de un acantilado."}', 35.00, 300, 20, 'beginner', '{"https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?auto=format&fit=crop&q=80&w=800"}', true, false, 4.7, 540);

    -- 5. Lempuyang Gate of Heaven
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('gate-of-heaven', dest_bali, cat_cul, typ_pho, '{"en": "Lempuyang Temple: Gate of Heaven Photo Tour", "es": "Templo Lempuyang: Tour Fotográfico Puerta del Cielo"}', '{"en": "Get the iconic photo between the Hindu gates with Mt. Agung in the background.", "es": "Consigue la icónica foto entre las puertas hindúes."}', 55.00, 600, 10, 'beginner', '{"https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=800"}', true, false, 4.5, 980);

    -- 6. Bali Spiritual Cleansing (Tirta Empul)
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('tirta-empul-blessing', dest_bali, cat_wel, typ_spi, '{"en": "Spiritual Holy Water Temple Blessing", "es": "Bendición Espiritual en el Templo del Agua Santa"}', '{"en": "Participate in a traditional purification ritual at Tirta Empul.", "es": "Participa en un ritual de purificación tradicional en Tirta Empul."}', 40.00, 360, 6, 'beginner', '{"https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800"}', true, false, 4.9, 320);

    -- 7. Ayung River White Water Rafting
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('ayung-rafting', dest_bali, cat_adv, typ_wat, '{"en": "Ayung River White Water Rafting Adventure", "es": "Aventura de Rafting en el Río Ayung"}', '{"en": "Paddle through wild rapids and past hidden waterfalls in Ubud.", "es": "Rema a través de rápidos salvajes y cascadas ocultas."}', 50.00, 240, 30, 'intermediate', '{"https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=800"}', true, false, 4.6, 1100);

    -- 8. Tanah Lot Sunset Tour
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('tanah-lot-sunset', dest_bali, cat_cul, typ_pho, '{"en": "Tanah Lot Temple Sunset Expedition", "es": "Expedición al Atardecer del Templo Tanah Lot"}', '{"en": "Visit the temple on the sea, one of Balis most photographed icons.", "es": "Visita el templo en el mar, uno de los iconos más fotografiados de Bali."}', 30.00, 300, 15, 'beginner', '{"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800"}', true, false, 4.7, 720);

    -- 9. Lovina Dolphin Sunrise Tour
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('lovina-dolphins', dest_bali, cat_adv, typ_wat, '{"en": "Lovina Dolphin Watching & Snorkeling", "es": "Avistamiento de Delfines en Lovina y Snorkel"}', '{"en": "A sunrise boat trip to see wild dolphins in North Bali.", "es": "Un viaje en barco al amanecer para ver delfines salvajes."}', 45.00, 480, 12, 'beginner', '{"https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800"}', true, false, 4.4, 430);

    -- 10. Private Romantic Dinner in a Cave
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured, avg_rating, review_count)
    VALUES ('romantic-cave-dinner', dest_bali, cat_lux, typ_spi, '{"en": "Luxury Romantic Dinner in a Samabe Cave", "es": "Cena Romántica de Lujo en una Cueva Samabe"}', '{"en": "An exclusive candlelight dinner inside a natural cave on the beach.", "es": "Una exclusiva cena a la luz de las velas dentro de una cueva natural."}', 450.00, 180, 2, 'beginner', '{"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"}', true, false, 5.0, 15);

    -- Adding 10 more simplified entries to reach 20...
    INSERT INTO tours (slug, destination_id, category_id, tour_type_id, title, description, base_price_usd, duration_minutes, max_participants, difficulty, images, is_published, featured)
    VALUES 
    ('bali-zoo-breakfast', dest_bali, cat_cul, typ_foo, '{"en": "Breakfast with Orangutans", "es": "Desayuno con Orangutanes"}', '{"en": "Unique dining experience.", "es": "Experiencia única."}', 75, 180, 20, 'beginner', '{"https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('canggu-surf-camp', dest_bali, cat_adv, typ_wat, '{"en": "Canggu Surf School: Private Lesson", "es": "Escuela de Surf Canggu"}', '{"en": "Learn to catch waves.", "es": "Aprende a surfear."}', 40, 120, 4, 'beginner', '{"https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('sekumpul-waterfall', dest_bali, cat_adv, typ_hik, '{"en": "Sekumpul Waterfall Trekking", "es": "Trekking en la Cascada Sekumpul"}', '{"en": "Visit Balis tallest waterfall.", "es": "Visita la cascada más alta."}', 60, 480, 8, 'advanced', '{"https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('seminyak-food-walk', dest_bali, cat_cul, typ_foo, '{"en": "Seminyak Night Market Food Tour", "es": "Tour de Comida en Seminyak"}', '{"en": "Taste the best satay.", "es": "Prueba el mejor satay."}', 35, 180, 12, 'beginner', '{"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('sidemen-rice-trek', dest_bali, cat_wel, typ_hik, '{"en": "Sidemen Valley Traditional Trek", "es": "Caminata Tradicional Sidemen"}', '{"en": "Off the beaten path.", "es": "Fuera de lo común."}', 40, 300, 10, 'intermediate', '{"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('ubud-cooking-class', dest_bali, cat_cul, typ_foo, '{"en": "Traditional Balinese Farm Cooking", "es": "Clase de Cocina Balinesa"}', '{"en": "Farm to table experience.", "es": "Granja a la mesa."}', 45, 240, 15, 'beginner', '{"https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('atv-jungle-adventure', dest_bali, cat_adv, typ_wat, '{"en": "Bali ATV Quad Bike Jungle Tour", "es": "Tour en Quad por la Selva"}', '{"en": "Muddy tracks adventure.", "es": "Aventura en el lodo."}', 55, 180, 20, 'intermediate', '{"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('jatiluwih-cycling', dest_bali, cat_adv, typ_hik, '{"en": "Jatiluwih UNESCO Rice Terrace E-Bike", "es": "Bicicleta Eléctrica en Jatiluwih"}', '{"en": "Effortless cycling.", "es": "Ciclismo sin esfuerzo."}', 65, 240, 10, 'beginner', '{"https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('west-bali-national-park', dest_bali, cat_adv, typ_wat, '{"en": "Menjangan Island Snorkeling", "es": "Snorkel en la Isla Menjangan"}', '{"en": "Best coral reefs in Bali.", "es": "Mejores arrecifes."}', 95, 600, 8, 'beginner', '{"https://images.unsplash.com/photo-1544551763-47a15950c57f?auto=format&fit=crop&q=80&w=800"}', true, false),
    ('bali-helicopter-tour', dest_bali, cat_lux, typ_pho, '{"en": "Uluwatu & Coastline Helicopter Flight", "es": "Vuelo en Helicóptero por Uluwatu"}', '{"en": "Sky high views.", "es": "Vistas desde el cielo."}', 550, 20, 4, 'beginner', '{"https://images.unsplash.com/photo-1464037862834-ee5772642398?auto=format&fit=crop&q=80&w=800"}', true, true);
END $$;
