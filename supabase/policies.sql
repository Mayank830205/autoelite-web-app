-- ====================================================================
-- AUTOELITE LUXURY SHOWROOM & TEST-DRIVE PLATFORM
-- Row Level Security (RLS) Policies
-- PostgreSQL / Supabase
-- ====================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- PROFILES POLICIES
-- ====================================================================

-- Customers can view their own profile; Admins can view all customer profiles
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
USING (
    auth.uid() = id
    OR
    public.is_admin(auth.uid())
);

-- Customers can update only their own profile
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Profiles are inserted by trigger, but allow user insert on signup fallback
CREATE POLICY "profiles_insert_policy"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ====================================================================
-- USER ROLES POLICIES (CRITICAL SECURITY)
-- ====================================================================

-- Users can read their own role (needed for SPA route guards and client state)
-- Admins can read all roles
CREATE POLICY "user_roles_select_policy"
ON public.user_roles
FOR SELECT
USING (
    auth.uid() = user_id
    OR
    public.is_admin(auth.uid())
);

-- STRICT: Only existing admins can insert or update roles! Customers NEVER have write access.
CREATE POLICY "user_roles_admin_insert"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "user_roles_admin_update"
ON public.user_roles
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ====================================================================
-- CARS (INVENTORY) POLICIES
-- ====================================================================

-- Anyone (public and authenticated) can view non-archived cars.
-- Admins can view ALL cars (including archived ones).
CREATE POLICY "cars_public_select"
ON public.cars
FOR SELECT
USING (
    is_archived = false
    OR
    public.is_admin(auth.uid())
);

-- Only Admins can insert, update, or archive cars
CREATE POLICY "cars_admin_insert"
ON public.cars
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "cars_admin_update"
ON public.cars
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "cars_admin_delete"
ON public.cars
FOR DELETE
USING (public.is_admin(auth.uid()));

-- ====================================================================
-- CAR IMAGES POLICIES
-- ====================================================================

-- Public can view images for non-archived cars; Admins can view all images
CREATE POLICY "car_images_select"
ON public.car_images
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.cars
        WHERE cars.id = car_images.car_id
          AND (cars.is_archived = false OR public.is_admin(auth.uid()))
    )
);

-- Only Admins can modify car images
CREATE POLICY "car_images_admin_all"
ON public.car_images
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ====================================================================
-- SHOWROOM SETTINGS POLICIES
-- ====================================================================

-- Everyone can view showroom settings (hours, closed days, contact info)
CREATE POLICY "showroom_settings_select_public"
ON public.showroom_settings
FOR SELECT
USING (true);

-- Only Admins can update settings
CREATE POLICY "showroom_settings_admin_all"
ON public.showroom_settings
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ====================================================================
-- BOOKINGS POLICIES (PRIMARY BUSINESS WORKFLOW)
-- ====================================================================

-- Customers can view only their own bookings (matched by user_id).
-- Admins can view all bookings.
CREATE POLICY "bookings_select_policy"
ON public.bookings
FOR SELECT
USING (
    auth.uid() = user_id
    OR
    public.is_admin(auth.uid())
);

-- Customers can create bookings.
-- If authenticated, user_id must match auth.uid().
-- If guest, user_id may be NULL (with customer_email provided).
CREATE POLICY "bookings_insert_policy"
ON public.bookings
FOR INSERT
WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
);

-- Customers can ONLY update their own booking to status = 'cancelled'
-- Customers CANNOT confirm, complete, or reject bookings!
CREATE POLICY "bookings_customer_cancel_policy"
ON public.bookings
FOR UPDATE
USING (
    auth.uid() = user_id
    AND booking_status IN ('pending', 'confirmed')
)
WITH CHECK (
    auth.uid() = user_id
    AND booking_status = 'cancelled'
);

-- Admins have full update rights over bookings (confirm, complete, reject, notes)
CREATE POLICY "bookings_admin_update_policy"
ON public.bookings
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Only Admins can delete bookings if necessary (archival preferred)
CREATE POLICY "bookings_admin_delete_policy"
ON public.bookings
FOR DELETE
USING (public.is_admin(auth.uid()));

-- ====================================================================
-- VEHICLE SALES POLICIES (STRICT FINANCIAL SEPARATION)
-- ====================================================================

-- Only authenticated Administrators can view or manage vehicle sales.
-- Customers have NO access to vehicle_sales table.
CREATE POLICY "vehicle_sales_admin_select"
ON public.vehicle_sales
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "vehicle_sales_admin_insert"
ON public.vehicle_sales
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "vehicle_sales_admin_update"
ON public.vehicle_sales
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ====================================================================
-- ACTIVITY LOGS POLICIES
-- ====================================================================

-- Only Admins can read activity logs
CREATE POLICY "activity_logs_admin_select"
ON public.activity_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Any authenticated action can write an audit log
CREATE POLICY "activity_logs_insert"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- ====================================================================
-- SUPABASE STORAGE CONFIGURATION & POLICIES
-- ====================================================================
-- Creates bucket 'car-media' for high-resolution vehicle photography & 3D models

INSERT INTO storage.buckets (id, name, public)
VALUES ('car-media', 'car-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to car media
CREATE POLICY "car_media_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'car-media');

-- Only Admins can upload, modify, or delete vehicle media in 'car-media'
CREATE POLICY "car_media_admin_insert"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'car-media'
    AND public.is_admin(auth.uid())
);

CREATE POLICY "car_media_admin_update"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'car-media'
    AND public.is_admin(auth.uid())
);

CREATE POLICY "car_media_admin_delete"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'car-media'
    AND public.is_admin(auth.uid())
);
