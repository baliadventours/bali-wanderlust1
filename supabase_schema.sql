
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('customer', 'vendor', 'admin');
    CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
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

-- 2. Vendors Table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tours Table (Multilingual)
CREATE TABLE public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
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
CREATE INDEX tours_vendor_id_idx ON tours(vendor_id);

-- 4. Tour Images Table
CREATE TABLE public.tour_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX tour_images_tour_id_idx ON tour_images(tour_id);

-- 5. Tour Availability
CREATE TABLE public.tour_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_slots INT NOT NULL,
    booked_slots INT DEFAULT 0,
    UNIQUE(tour_id, date)
);

CREATE INDEX tour_availability_tour_date_idx ON tour_availability(tour_id, date);

-- 6. Tour Pricing (Advanced)
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

-- 7. Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    status public.booking_status DEFAULT 'pending',
    total_amount_usd DECIMAL(12,2) NOT NULL,
    pricing_breakdown JSONB, -- Store breakdown of adult/child/group pricing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX bookings_customer_id_idx ON bookings(customer_id);
CREATE INDEX bookings_vendor_id_idx ON bookings(vendor_id);
CREATE INDEX bookings_tour_id_idx ON bookings(tour_id);

-- 8. Payments Table
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

-- 9. Commissions Table
CREATE TABLE public.booking_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    commission_amount DECIMAL(12,2) NOT NULL,
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Vendors manage own" ON public.vendors FOR ALL USING (auth.uid() = owner_id);

-- Tours
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view active tours" ON public.tours FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors manage own tours" ON public.tours FOR ALL USING (
    EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND owner_id = auth.uid())
);
CREATE POLICY "Admin manage all tours" ON public.tours FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Vendors view own bookings" ON public.bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND owner_id = auth.uid())
);
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid())
);

-- TRIGGERS for status updates
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
