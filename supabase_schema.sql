
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
    CREATE TYPE public.booking_status AS ENUM ('awaiting_payment', 'confirmed', 'cancelled', 'expired', 'completed');
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'expired');
    CREATE TYPE public.payment_provider AS ENUM ('midtrans', 'paypal', 'bank_transfer');
    CREATE TYPE public.price_type AS ENUM ('adult', 'child', 'group');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role public.user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tours Table (Multilingual)
CREATE TABLE public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en TEXT NOT NULL,
    title_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_id TEXT,
    base_price_usd DECIMAL(12,2) NOT NULL,
    duration_minutes INT NOT NULL,
    max_participants INT NOT NULL,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX tours_slug_idx ON tours(slug);

-- 3. Tour Images Table
CREATE TABLE public.tour_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX tour_images_tour_id_idx ON tour_images(tour_id);

-- 4. Tour Availability
CREATE TABLE public.tour_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_slots INT NOT NULL,
    booked_slots INT DEFAULT 0 CHECK (booked_slots <= total_slots),
    UNIQUE(tour_id, date)
);

CREATE INDEX tour_availability_tour_date_idx ON tour_availability(tour_id, date);

-- 5. Tour Pricing (Advanced)
CREATE TABLE public.tour_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    date DATE, -- Specific date pricing
    min_group_size INT DEFAULT 1,
    max_group_size INT,
    price_per_person DECIMAL(12,2) NOT NULL,
    price_type public.price_type DEFAULT 'adult',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    status public.booking_status DEFAULT 'awaiting_payment',
    total_amount_usd DECIMAL(12,2) NOT NULL,
    pricing_breakdown JSONB,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX bookings_customer_id_idx ON bookings(customer_id);
CREATE INDEX bookings_tour_id_idx ON bookings(tour_id);
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_created_at_idx ON bookings(created_at);

-- 7. Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    provider public.payment_provider NOT NULL,
    transaction_id TEXT UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    status public.payment_status DEFAULT 'pending',
    payment_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX payments_status_idx ON payments(status);

-- RPC: Calculate Price
CREATE OR REPLACE FUNCTION public.calculate_price(
    p_tour_id UUID,
    p_date DATE,
    p_participants JSONB -- Array of { type: 'adult', count: 2 }
)
RETURNS JSONB AS $$
DECLARE
    v_total DECIMAL(12,2) := 0;
    v_breakdown JSONB := '[]'::jsonb;
    v_total_count INT := 0;
    v_item RECORD;
    v_rule RECORD;
BEGIN
    -- Calculate total participants
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_participants) AS x(type TEXT, count INT) LOOP
        v_total_count := v_total_count + v_item.count;
    END LOOP;

    -- Iterate through participant types to find best matching rules
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_participants) AS x(type TEXT, count INT) LOOP
        IF v_item.count > 0 THEN
            -- Find rule: Date specific first, then general
            SELECT * INTO v_rule FROM public.tour_pricing
            WHERE tour_id = p_tour_id 
              AND price_type = v_item.type::public.price_type
              AND (date = p_date OR date IS NULL)
              AND min_group_size <= v_total_count
              AND (max_group_size >= v_total_count OR max_group_size IS NULL)
            ORDER BY date DESC NULLS LAST
            LIMIT 1;

            IF FOUND THEN
                v_total := v_total + (v_rule.price_per_person * v_item.count);
                v_breakdown := v_breakdown || jsonb_build_object(
                    'type', v_item.type,
                    'count', v_item.count,
                    'price_per_person', v_rule.price_per_person,
                    'subtotal', v_rule.price_per_person * v_item.count
                );
            ELSE
                -- Fallback to base price if no rule found (optional logic)
                RAISE EXCEPTION 'No pricing rule found for %', v_item.type;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('total', v_total, 'breakdown', v_breakdown);
END;
$$ LANGUAGE plpgsql;

-- RPC: Reserve Slots and Create Booking
CREATE OR REPLACE FUNCTION public.reserve_slots(
    p_tour_id UUID,
    p_date DATE,
    p_participants JSONB,
    p_customer_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_booking_id UUID;
    v_total_count INT := 0;
    v_price_data JSONB;
    v_item RECORD;
BEGIN
    -- 1. Calculate total participants
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_participants) AS x(type TEXT, count INT) LOOP
        v_total_count := v_total_count + v_item.count;
    END LOOP;

    -- 2. Lock and update availability
    -- If no record exists, we assume infinite slots or handle error. 
    -- Better to ensure availability record exists for specific dates.
    UPDATE public.tour_availability
    SET booked_slots = booked_slots + v_total_count
    WHERE tour_id = p_tour_id AND date = p_date;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Availability not defined for this date';
    END IF;

    -- 3. Calculate price via DB logic
    v_price_data := public.calculate_price(p_tour_id, p_date, p_participants);

    -- 4. Create booking
    INSERT INTO public.bookings (
        customer_id,
        tour_id,
        booking_date,
        total_amount_usd,
        pricing_breakdown,
        status
    ) VALUES (
        p_customer_id,
        p_tour_id,
        p_date,
        (v_price_data->>'total')::DECIMAL,
        v_price_data->'breakdown',
        'awaiting_payment'
    ) RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: Release Slots
CREATE OR REPLACE FUNCTION public.release_slots(
    p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_tour_id UUID;
    v_date DATE;
    v_total_count INT := 0;
    v_item RECORD;
BEGIN
    -- 1. Get booking details
    SELECT tour_id, booking_date, pricing_breakdown INTO v_tour_id, v_date, v_item
    FROM public.bookings WHERE id = p_booking_id;

    -- 2. Calculate participants
    FOR v_item IN SELECT * FROM jsonb_to_recordset(v_item.pricing_breakdown) AS x(type TEXT, count INT) LOOP
        v_total_count := v_total_count + v_item.count;
    END LOOP;

    -- 3. Release slots
    UPDATE public.tour_availability
    SET booked_slots = GREATEST(0, booked_slots - v_total_count)
    WHERE tour_id = v_tour_id AND date = v_date;

    -- 4. Mark expired
    UPDATE public.bookings SET status = 'expired' WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

-- RLS POLICIES

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner and admin" ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access on profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tours
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view active tours" ON public.tours FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on tours" ON public.tours FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tour Images
ALTER TABLE public.tour_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view images" ON public.tour_images FOR SELECT USING (true);
CREATE POLICY "Admin full access on images" ON public.tour_images FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admin full access on bookings" ON public.bookings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid()));
CREATE POLICY "Admin full access on payments" ON public.payments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- TRIGGER: Update booking status on payment
CREATE OR REPLACE FUNCTION public.handle_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' THEN
        UPDATE public.bookings SET status = 'confirmed' WHERE id = NEW.booking_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_status_change
    AFTER UPDATE OF status ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_payment_status_change();
