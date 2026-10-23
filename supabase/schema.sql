-- ====================================================================
-- AUTOELITE LUXURY SHOWROOM & TEST-DRIVE PLATFORM
-- Database Schema Definition
-- PostgreSQL / Supabase
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPES & DOMAINS (if needed)
DO $$ BEGIN
    CREATE TYPE booking_type_enum AS ENUM ('test_drive', 'showroom_visit', 'purchase_enquiry');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
-- Extends Supabase auth.users for customer and admin profile details
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. USER ROLES TABLE
-- High-security role table. Prevents customers from escalating privileges.
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for role lookup performance
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Helper function to check if the current requester is an administrator
-- Uses SECURITY DEFINER to bypass RLS recursion, with a fixed search_path.
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id AND role = 'admin'
    );
$$;

-- 5. CARS (INVENTORY) TABLE
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    model_year INTEGER NOT NULL CHECK (model_year >= 1990 AND model_year <= 2035),
    ex_showroom_price NUMERIC(14, 2) NOT NULL CHECK (ex_showroom_price > 0),
    on_road_price NUMERIC(14, 2) CHECK (on_road_price >= ex_showroom_price),
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid')),
    transmission TEXT NOT NULL CHECK (transmission IN ('Automatic', 'Manual', 'Dual-Clutch (DCT)', 'Steptronic', 'PDK', 'e-CVT')),
    body_type TEXT NOT NULL CHECK (body_type IN ('Sedan', 'SUV', 'Coupe', 'Convertible', 'Sportback', 'Gran Coupe')),
    engine TEXT,
    horsepower INTEGER CHECK (horsepower > 0),
    torque TEXT,
    mileage_or_range TEXT,
    seating_capacity INTEGER NOT NULL DEFAULT 5 CHECK (seating_capacity BETWEEN 2 AND 9),
    exterior_colors JSONB DEFAULT '[]'::jsonb,
    interior_colors JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    safety_features JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    main_image_url TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'booking_open', 'reserved', 'sold_out')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    model_3d_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON public.cars(brand, model);
CREATE INDEX IF NOT EXISTS idx_cars_price ON public.cars(ex_showroom_price);
CREATE INDEX IF NOT EXISTS idx_cars_featured ON public.cars(is_featured) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_cars_availability ON public.cars(availability_status);

-- 6. CAR IMAGES TABLE (Multi-angle and 360-degree sequences)
CREATE TABLE IF NOT EXISTS public.car_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    angle_label TEXT DEFAULT 'front', -- front, front_quarter, side, rear_quarter, rear, interior, dashboard, wheel, frame_0..frame_35
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_car_images_car_order ON public.car_images(car_id, display_order);

-- 7. SHOWROOM SETTINGS
CREATE TABLE IF NOT EXISTS public.showroom_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opening_hours JSONB NOT NULL DEFAULT '{"mon_fri": {"open": "09:30", "close": "19:30"}, "sat": {"open": "10:00", "close": "19:00"}, "sun": {"open": "11:00", "close": "17:00"}}'::jsonb,
    closed_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
    appointment_duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (appointment_duration_minutes BETWEEN 15 AND 180),
    max_bookings_per_slot INTEGER NOT NULL DEFAULT 3 CHECK (max_bookings_per_slot > 0),
    contact_phone TEXT DEFAULT '+91 98765 43210',
    contact_email TEXT DEFAULT 'experience@autoelite.luxury',
    showroom_address TEXT DEFAULT 'AUTOELITE Experience Center, Sector 42, Golf Course Road, Gurugram, Delhi NCR - 122002',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    booking_type TEXT NOT NULL CHECK (booking_type IN ('test_drive', 'showroom_visit', 'purchase_enquiry')),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    appointment_date DATE,
    appointment_time TIME,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
    customer_message TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON public.bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);

-- 9. VEHICLE SALES TABLE (STRICT SEPARATION: Only explicit sales count towards revenue)
CREATE TABLE IF NOT EXISTS public.vehicle_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE RESTRICT,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sale_amount NUMERIC(14, 2) NOT NULL CHECK (sale_amount > 0),
    sale_status TEXT NOT NULL DEFAULT 'completed' CHECK (sale_status IN ('completed', 'pending_delivery', 'cancelled')),
    customer_name TEXT NOT NULL,
    customer_contact TEXT,
    sales_rep_notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicle_sales_car_id ON public.vehicle_sales(car_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_recorded_at ON public.vehicle_sales(recorded_at);

-- 10. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ====================================================================
-- TRIGGERS & AUTOMATION FUNCTIONS
-- ====================================================================

-- Automatic updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cars_updated_at ON public.cars;
CREATE TRIGGER set_cars_updated_at
BEFORE UPDATE ON public.cars
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_showroom_settings_updated_at ON public.showroom_settings;
CREATE TRIGGER set_showroom_settings_updated_at
BEFORE UPDATE ON public.showroom_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Automatic booking reference generator trigger
-- Generates unique human-readable references like AEL-20261023-A9F2
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    today_str TEXT;
    random_suffix TEXT;
    candidate_ref TEXT;
    is_unique BOOLEAN := FALSE;
BEGIN
    IF NEW.booking_reference IS NOT NULL AND length(NEW.booking_reference) > 0 THEN
        RETURN NEW;
    END IF;

    today_str := to_char(CURRENT_DATE, 'YYYYMMDD');
    WHILE NOT is_unique LOOP
        random_suffix := upper(substr(md5(random()::text), 1, 4));
        candidate_ref := 'AEL-' || today_str || '-' || random_suffix;
        IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE booking_reference = candidate_ref) THEN
            is_unique := TRUE;
        END IF;
    END LOOP;

    NEW.booking_reference := candidate_ref;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_booking_reference ON public.bookings;
CREATE TRIGGER trigger_generate_booking_reference
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.generate_booking_reference();

-- Automatic profile creation on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name;

    -- Default role is 'customer'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Slot availability checking function (server-side trusted check)
CREATE OR REPLACE FUNCTION public.check_slot_capacity(
    p_date DATE,
    p_time TIME
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    max_slots INTEGER := 3;
    current_count INTEGER := 0;
    is_closed BOOLEAN := FALSE;
BEGIN
    -- Check max bookings setting
    SELECT max_bookings_per_slot INTO max_slots FROM public.showroom_settings LIMIT 1;
    IF max_slots IS NULL THEN
        max_slots := 3;
    END IF;

    -- Check closed dates
    SELECT EXISTS (
        SELECT 1 FROM public.showroom_settings,
        jsonb_array_elements_text(closed_dates) AS cd
        WHERE cd = p_date::text
    ) INTO is_closed;

    IF is_closed THEN
        RETURN jsonb_build_object('available', false, 'reason', 'Showroom closed on selected date');
    END IF;

    -- Count active bookings in this slot
    SELECT COUNT(*) INTO current_count
    FROM public.bookings
    WHERE appointment_date = p_date
      AND appointment_time = p_time
      AND booking_status IN ('pending', 'confirmed');

    IF current_count >= max_slots THEN
        RETURN jsonb_build_object('available', false, 'current_count', current_count, 'max_slots', max_slots, 'reason', 'Slot capacity reached');
    ELSE
        RETURN jsonb_build_object('available', true, 'current_count', current_count, 'max_slots', max_slots);
    END IF;
END;
$$;
