-- ====================================================================
-- AUTOELITE LUXURY SHOWROOM & TEST-DRIVE PLATFORM
-- Seed Data & Demonstration Assets
-- ====================================================================
-- NOTE: All prices and specifications are illustrative demonstration data.
-- Do not run in production without review.

-- 1. SHOWROOM SETTINGS
INSERT INTO public.showroom_settings (
    id,
    opening_hours,
    closed_dates,
    appointment_duration_minutes,
    max_bookings_per_slot,
    contact_phone,
    contact_email,
    showroom_address
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '{
        "monday": {"open": "09:30", "close": "19:30"},
        "tuesday": {"open": "09:30", "close": "19:30"},
        "wednesday": {"open": "09:30", "close": "19:30"},
        "thursday": {"open": "09:30", "close": "19:30"},
        "friday": {"open": "09:30", "close": "19:30"},
        "saturday": {"open": "10:00", "close": "19:00"},
        "sunday": {"open": "11:00", "close": "17:00"}
    }'::jsonb,
    '["2026-10-24", "2026-11-01", "2026-12-25"]'::jsonb,
    45,
    3,
    '+91 98765 43210',
    'concierge@autoelite.luxury',
    'AUTOELITE Experience Center, Sector 42, Golf Course Road, Gurugram, Delhi NCR - 122002'
) ON CONFLICT (id) DO UPDATE
SET opening_hours = EXCLUDED.opening_hours,
    closed_dates = EXCLUDED.closed_dates,
    max_bookings_per_slot = EXCLUDED.max_bookings_per_slot;

-- 2. VEHICLE INVENTORY (6 Premium Vehicles)

-- Car 1: BMW M4 Competition Coupé
INSERT INTO public.cars (
    id,
    brand,
    model,
    variant,
    model_year,
    ex_showroom_price,
    on_road_price,
    fuel_type,
    transmission,
    body_type,
    engine,
    horsepower,
    torque,
    mileage_or_range,
    seating_capacity,
    exterior_colors,
    interior_colors,
    features,
    safety_features,
    description,
    main_image_url,
    availability_status,
    is_featured,
    is_archived,
    model_3d_url
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'BMW',
    'M4 Competition',
    'M xDrive Coupé',
    2025,
    15300000.00,
    17850000.00,
    'Petrol',
    'Steptronic',
    'Coupe',
    '3.0L M TwinPower Turbo Inline 6-Cylinder',
    503,
    '650 Nm @ 2750-5500 rpm',
    '9.8 km/l',
    4,
    '["Isle of Man Green Metallic", "Sao Paulo Yellow", "Brooklyn Grey Metallic", "Black Sapphire Metallic", "Toronto Red Metallic"]'::jsonb,
    '["Yas Marina Blue / Black Extended Merino Leather", "Kyalami Orange / Black", "Silverstone / Black"]'::jsonb,
    '["M Carbon Bucket Seats", "BMW Curved Display with M-specific graphics", "M Carbon Ceramic Brakes", "Adaptive M Suspension", "Harman Kardon Surround Sound System", "Head-Up Display with Track Mode", "M Drive Professional with 10-stage traction control"]'::jsonb,
    '["Active Protection System", "Cornering Brake Control (CBC)", "Dynamic Stability Control with M Dynamic Mode", "6 Airbags with dual-stage deployment", "Parking Assistant Plus with 3D Surround View"]'::jsonb,
    'The BMW M4 Competition Coupé represents pure motorsport pedigree engineered for the open road. Powered by a high-revving 503 hp M TwinPower Turbo engine and equipped with intelligent M xDrive, it delivers 0-100 km/h in an astonishing 3.5 seconds with telepathic chassis control.',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85',
    'in_stock',
    true,
    false,
    null
) ON CONFLICT (id) DO UPDATE SET
    ex_showroom_price = EXCLUDED.ex_showroom_price,
    main_image_url = EXCLUDED.main_image_url;

-- Car 2: Mercedes-Benz C-Class
INSERT INTO public.cars (
    id,
    brand,
    model,
    variant,
    model_year,
    ex_showroom_price,
    on_road_price,
    fuel_type,
    transmission,
    body_type,
    engine,
    horsepower,
    torque,
    mileage_or_range,
    seating_capacity,
    exterior_colors,
    interior_colors,
    features,
    safety_features,
    description,
    main_image_url,
    availability_status,
    is_featured,
    is_archived,
    model_3d_url
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Mercedes-Benz',
    'C-Class',
    'C 300 AMG Line',
    2025,
    6100000.00,
    7150000.00,
    'Petrol',
    'Automatic',
    'Sedan',
    '2.0L Turbocharged Inline-4 with 48V Mild Hybrid (EQ Boost)',
    258,
    '400 Nm + 200 Nm Boost',
    '14.4 km/l',
    5,
    '["Obsidian Black Metallic", "Selenite Grey", "Polar White", "Spectral Blue", "Manufaktur Opalite White Bright"]'::jsonb,
    '["Sienna Brown / Black Artico Leather", "Macchiato Beige", "Black Nappa Leather"]'::jsonb,
    '["11.9-inch Portrait Central Touchscreen", "Burmester 3D Surround Sound System", "Panoramic Sliding Sunroof", "Active Ambient Lighting (64 Colors)", "Digital Light Technology with Projection", "Wireless Smartphone Integration"]'::jsonb,
    '["Active Brake Assist with Cross-Traffic Detection", "Blind Spot Assist with Exit Warning", "PRE-SAFE Impulse Side", "Active Parking Assist with Parktronic", "7 Airbags with Centre Airbag"]'::jsonb,
    'Referred to as the "Baby S-Class", the Mercedes-Benz C 300 AMG Line combines avant-garde digital luxury with progressive sportiness. It features an integrated starter-generator mild-hybrid powertrain and second-generation MBUX infotainment for the ultimate executive commute.',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85',
    'in_stock',
    true,
    false,
    null
) ON CONFLICT (id) DO UPDATE SET
    ex_showroom_price = EXCLUDED.ex_showroom_price,
    main_image_url = EXCLUDED.main_image_url;

-- Car 3: Audi Q5
INSERT INTO public.cars (
    id,
    brand,
    model,
    variant,
    model_year,
    ex_showroom_price,
    on_road_price,
    fuel_type,
    transmission,
    body_type,
    engine,
    horsepower,
    torque,
    mileage_or_range,
    seating_capacity,
    exterior_colors,
    interior_colors,
    features,
    safety_features,
    description,
    main_image_url,
    availability_status,
    is_featured,
    is_archived,
    model_3d_url
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Audi',
    'Q5',
    'Technology 45 TFSI quattro',
    2025,
    6500000.00,
    7620000.00,
    'Petrol',
    'Dual-Clutch (DCT)',
    'SUV',
    '2.0L 4-Cylinder TFSI Turbocharged Petrol',
    249,
    '370 Nm @ 1600-4500 rpm',
    '13.4 km/l',
    5,
    '["Navarra Blue Metallic", "Mythos Black", "Glacier White", "Chronos Grey", "Manhattan Grey"]'::jsonb,
    '["Okapi Brown Cricket Leather", "Black Leatherette with Contrast Stitching"]'::jsonb,
    '["Audi Virtual Cockpit Plus (12.3-inch)", "quattro All-Wheel Drive with Ultra Technology", "Adaptive Suspension with Damper Control", "Bang & Olufsen 3D Premium Sound System (19 Speakers)", "Matrix LED Headlights with Dynamic Indicators", "3-Zone Deluxe Climate Control"]'::jsonb,
    '["Electronic Stability Control (ESC)", "Audi Pre-Sense Basic & Rear", "Hill Descent Control", "8 Airbags", "ISOFIX Child Seat Mounts"]'::jsonb,
    'The Audi Q5 combines sporty character with high everyday practicality. Its quattro all-wheel drive, refined suspension dampening, and whisper-quiet cabin deliver effortless poise across winding highways and challenging urban terrain alike.',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85',
    'in_stock',
    true,
    false,
    null
) ON CONFLICT (id) DO UPDATE SET
    ex_showroom_price = EXCLUDED.ex_showroom_price,
    main_image_url = EXCLUDED.main_image_url;

-- Car 4: Porsche 911 Carrera
INSERT INTO public.cars (
    id,
    brand,
    model,
    variant,
    model_year,
    ex_showroom_price,
    on_road_price,
    fuel_type,
    transmission,
    body_type,
    engine,
    horsepower,
    torque,
    mileage_or_range,
    seating_capacity,
    exterior_colors,
    interior_colors,
    features,
    safety_features,
    description,
    main_image_url,
    availability_status,
    is_featured,
    is_archived,
    model_3d_url
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'Porsche',
    '911 Carrera',
    'Carrera S 992.2',
    2025,
    20000000.00,
    23200000.00,
    'Petrol',
    'PDK',
    'Coupe',
    '3.0L Twin-Turbocharged Flat-6 Boxer',
    443,
    '530 Nm @ 2300-5000 rpm',
    '8.9 km/l',
    4,
    '["Guards Red", "Racing Yellow", "GT Silver Metallic", "Gentian Blue Metallic", "Crayon Special Paint"]'::jsonb,
    '["Black / Bordeaux Red Two-Tone Leather", "Truffle Brown Club Leather", "Slate Grey"]'::jsonb,
    '["8-Speed Porsche Doppelkupplung (PDK)", "Sport Chrono Package with Mode Switch", "Porsche Active Suspension Management (PASM)", "Sports Exhaust System with Black Tailpipes", "Bose Surround Sound System", "Front Axle Lift System"]'::jsonb,
    '["Porsche Ceramic Composite Brakes (PCCB)", "Porsche Stability Management (PSM)", "Lane Keep Assist with Traffic Sign Recognition", "Full-Size Front and Side Airbags", "Night Vision Assist"]'::jsonb,
    'The archetype of sports cars. The Porsche 911 Carrera S continues more than sixty years of engineering perfection. The rear-mounted twin-turbo flat-six engine roars with visceral emotion, while the 8-speed PDK delivers instantaneous gear changes.',
    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
    'booking_open',
    true,
    false,
    null
) ON CONFLICT (id) DO UPDATE SET
    ex_showroom_price = EXCLUDED.ex_showroom_price,
    main_image_url = EXCLUDED.main_image_url;

-- Car 5: Range Rover Velar
INSERT INTO public.cars (
    id,
    brand,
    model,
    variant,
    model_year,
    ex_showroom_price,
    on_road_price,
    fuel_type,
    transmission,
    body_type,
    engine,
    horsepower,
    torque,
    mileage_or_range,
    seating_capacity,
    exterior_colors,
    interior_colors,
    features,
    safety_features,
    description,
    main_image_url,
    availability_status,
    is_featured,
    is_archived,
    model_3d_url
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Land Rover',
    'Range Rover Velar',
    'Dynamic HSE 2.0 Petrol',
    2025,
    8700000.00,
    10150000.00,
    'Petrol',
    'Automatic',
    'SUV',
    '2.0L 4-Cylinder Turbocharged Ingenium',
    247,
    '365 Nm @ 1300-4500 rpm',
    '11.2 km/l',
    5,
    '["Santorini Black", "Fuji White", "Hakuba Silver", "Carpathian Grey Premium Metallic", "Zadar Grey"]'::jsonb,
    '["Ebony Windsor Leather with Mars Red Accents", "Cloud / Ebony Duotone", "Light Oyster"]'::jsonb,
    '["Pivi Pro 11.4-inch Curved Glass Touchscreen", "Meridian 3D Surround Sound (17 Speakers)", "Electronic Air Suspension with Adaptive Dynamics", "Flush Deployable Door Handles", "Cabin Air Purification Plus with PM2.5 filtration", "Sliding Panoramic Roof"]'::jsonb,
    '["All-Terrain Progress Control (ATPC)", "Terrain Response 2 with Dynamic Program", "Emergency Braking & Driver Condition Monitor", "3D Surround Camera with Wade Sensing", "6 Airbags"]'::jsonb,
    'The Range Rover Velar is the avant-garde luxury SUV. Clean, reductive design meets calm, sanctuary-like interiors crafted from the finest materials. Its advanced air suspension floats over road imperfections with serene authority.',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85',
    'in_stock',
    true,
    false,
    null
) ON CONFLICT (id) DO UPDATE SET
    ex_showroom_price = EXCLUDED.ex_showroom_price,
    main_image_url = EXCLUDED.main_image_url;

-- Car 6: Toyota Fortuner Legender
INSERT INTO public.cars (
    id,
    brand,
    model,
    variant,
    model_year,
    ex_showroom_price,
    on_road_price,
    fuel_type,
    transmission,
    body_type,
    engine,
    horsepower,
    torque,
    mileage_or_range,
    seating_capacity,
    exterior_colors,
    interior_colors,
    features,
    safety_features,
    description,
    main_image_url,
    availability_status,
    is_featured,
    is_archived,
    model_3d_url
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    'Toyota',
    'Fortuner Legender',
    '4x4 AT',
    2025,
    4400000.00,
    5280000.00,
    'Diesel',
    'Automatic',
    'SUV',
    '2.8L 4-Cylinder D-4D Turbo Diesel',
    201,
    '500 Nm @ 1600-2800 rpm',
    '14.2 km/l',
    7,
    '["Platinum White Pearl with Black Roof", "Attitude Black"]'::jsonb,
    '["Dual Tone Black & Maroon Leather Upholstery"]'::jsonb,
    '["Catamaran Style Sharp Front Bumper", "Split Quad-LED Headlamps with Sequential Turn Signals", "Kick-Sensor Powered Back Door", "Ventilated Front Seats", "Wireless Charging Pad", "JBL 11-Speaker Audio with Subwoofer"]'::jsonb,
    '["Vehicle Stability Control (VSC) with Brake Assist", "Hill Assist Control & Downhill Assist Control", "Traction Control System (TRC)", "7 SRS Airbags including Knee Airbag", "Anti-Theft Alarm with Ultrasonic Sensor"]'::jsonb,
    'The undisputed king of rugged luxury. The Toyota Fortuner Legender combines menacing street presence with legendary durability, supreme off-road capability, and an indulgent executive cabin tailored for Indian terrain.',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85',
    'in_stock',
    true,
    false,
    null
) ON CONFLICT (id) DO UPDATE SET
    ex_showroom_price = EXCLUDED.ex_showroom_price,
    main_image_url = EXCLUDED.main_image_url;

-- ====================================================================
-- 3. MULTI-ANGLE CAR IMAGES & 360-DEGREE SEQUENCES
-- ====================================================================

-- Images for BMW M4 Competition (id: 11111111-1111-1111-1111-111111111111)
DELETE FROM public.car_images WHERE car_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85', 'front_quarter', 1),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85', 'front', 2),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1600&q=85', 'side', 3),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85', 'rear_quarter', 4),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85', 'dashboard', 5),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85', 'interior', 6),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1600&q=85', 'wheel', 7);

-- 360-degree sequence frames for BMW M4 Competition (16 rotational studio angles)
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', 'frame_00', 100),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', 'frame_01', 101),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80', 'frame_02', 102),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80', 'frame_03', 103),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', 'frame_04', 104),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', 'frame_05', 105),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', 'frame_06', 106),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1617814076668-8dfc6cb30b91?auto=format&fit=crop&w=1200&q=80', 'frame_07', 107),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', 'frame_08', 108),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 'frame_09', 109),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', 'frame_10', 110),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', 'frame_11', 111);

-- Images for Mercedes-Benz C-Class (id: 22222222-2222-2222-2222-222222222222)
DELETE FROM public.car_images WHERE car_id = '22222222-2222-2222-2222-222222222222';
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85', 'front_quarter', 1),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85', 'front', 2),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=85', 'side', 3),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85', 'dashboard', 4),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85', 'interior', 5);

-- Images for Audi Q5 (id: 33333333-3333-3333-3333-333333333333)
DELETE FROM public.car_images WHERE car_id = '33333333-3333-3333-3333-333333333333';
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85', 'front_quarter', 1),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85', 'front', 2),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85', 'side', 3),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85', 'dashboard', 4);

-- Images for Porsche 911 Carrera (id: 44444444-4444-4444-4444-444444444444)
DELETE FROM public.car_images WHERE car_id = '44444444-4444-4444-4444-444444444444';
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85', 'front_quarter', 1),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85', 'rear_quarter', 2),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85', 'front', 3),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85', 'side', 4),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85', 'interior', 5);

-- 360-degree sequence frames for Porsche 911 Carrera (12 rotational studio frames)
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', 'frame_00', 100),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 'frame_01', 101),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', 'frame_02', 102),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', 'frame_03', 103),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', 'frame_04', 104),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', 'frame_05', 105),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', 'frame_06', 106),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80', 'frame_07', 107);

-- Images for Range Rover Velar (id: 55555555-5555-5555-5555-555555555555)
DELETE FROM public.car_images WHERE car_id = '55555555-5555-5555-5555-555555555555';
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85', 'front_quarter', 1),
('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85', 'side', 2),
('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85', 'dashboard', 3);

-- Images for Toyota Fortuner Legender (id: 66666666-6666-6666-6666-666666666666)
DELETE FROM public.car_images WHERE car_id = '66666666-6666-6666-6666-666666666666';
INSERT INTO public.car_images (car_id, image_url, angle_label, display_order) VALUES
('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85', 'front_quarter', 1),
('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85', 'side', 2),
('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85', 'interior', 3);

-- ====================================================================
-- 4. DEMONSTRATION BOOKINGS (16 Realistically Distributed Bookings)
-- ====================================================================

DELETE FROM public.bookings WHERE booking_reference LIKE 'DEMO-%';

INSERT INTO public.bookings (
    booking_reference,
    booking_type,
    customer_name,
    customer_email,
    customer_phone,
    car_id,
    appointment_date,
    appointment_time,
    booking_status,
    customer_message,
    admin_notes,
    created_at
) VALUES
(
    'DEMO-202610-001',
    'test_drive',
    'Vikramaditya Singhania',
    'vikram.singhania@example.com',
    '+91 98111 22334',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE + INTERVAL '2 days',
    '11:00:00',
    'confirmed',
    'Interested in Isle of Man Green spec. Please prepare track configuration.',
    'VIP Customer. Key handover arranged with Chief Experience Officer.',
    NOW() - INTERVAL '1 day'
),
(
    'DEMO-202610-002',
    'purchase_enquiry',
    'Aanya Kapoor',
    'aanya.kapoor@example.com',
    '+91 98222 33445',
    '44444444-4444-4444-4444-444444444444',
    CURRENT_DATE + INTERVAL '5 days',
    '14:30:00',
    'pending',
    'Looking for immediate allocation of 911 Carrera in Guards Red.',
    'Allocation slot checking with regional factory distributor.',
    NOW() - INTERVAL '2 hours'
),
(
    'DEMO-202610-003',
    'showroom_visit',
    'Rajesh Malhotra',
    'rajesh.malhotra@example.com',
    '+91 98333 44556',
    null,
    CURRENT_DATE + INTERVAL '1 day',
    '16:00:00',
    'confirmed',
    'Family visit to evaluate luxury executive sedans and SUVs.',
    'Lounge hospitality and private consultant assigned.',
    NOW() - INTERVAL '6 hours'
),
(
    'DEMO-202610-004',
    'test_drive',
    'Dr. Rohan Mukherjee',
    'dr.rohan@example.com',
    '+91 98444 55667',
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE - INTERVAL '3 days',
    '10:30:00',
    'completed',
    'Wanted to compare ride quality with previous generation C-Class.',
    'Test drive completed successfully. Customer was very impressed with MBUX.',
    NOW() - INTERVAL '5 days'
),
(
    'DEMO-202610-005',
    'test_drive',
    'Pooja Nambiar',
    'pooja.nambiar@example.com',
    '+91 98555 66778',
    '55555555-5555-5555-5555-555555555555',
    CURRENT_DATE - INTERVAL '5 days',
    '15:00:00',
    'completed',
    'Checking highway poise and sound insulation.',
    'Test drive completed. Sent brochure and customized finance quote.',
    NOW() - INTERVAL '7 days'
),
(
    'DEMO-202610-006',
    'purchase_enquiry',
    'Sameer Merchant',
    'sameer.m@example.com',
    '+91 98666 77889',
    '33333333-3333-3333-3333-333333333333',
    null,
    null,
    'pending',
    'Requesting corporate fleet purchase quotation for two Audi Q5 Technology units.',
    'Sent to Corporate B2B sales desk.',
    NOW() - INTERVAL '1 day'
),
(
    'DEMO-202610-007',
    'test_drive',
    'Kabir Oberoi',
    'kabir.o@example.com',
    '+91 98777 88990',
    '66666666-6666-6666-6666-666666666666',
    CURRENT_DATE + INTERVAL '3 days',
    '12:00:00',
    'pending',
    'Testing 4x4 low range switchability for estate use.',
    'Awaiting customer license photo verification.',
    NOW() - INTERVAL '4 hours'
),
(
    'DEMO-202610-008',
    'test_drive',
    'Devika Sen',
    'devika.sen@example.com',
    '+91 98888 99001',
    '44444444-4444-4444-4444-444444444444',
    CURRENT_DATE - INTERVAL '10 days',
    '11:00:00',
    'cancelled',
    'Urgent travel rescheduled.',
    'Cancelled by customer via online portal.',
    NOW() - INTERVAL '12 days'
),
(
    'DEMO-202610-009',
    'showroom_visit',
    'Arjun Varma',
    'arjun.varma@example.com',
    '+91 98999 00112',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE + INTERVAL '4 days',
    '17:00:00',
    'confirmed',
    'Viewing M Carbon bucket seats in person with my track driving coach.',
    'Confirmed appointment slot.',
    NOW() - INTERVAL '1 day'
),
(
    'DEMO-202610-010',
    'purchase_enquiry',
    'Meera Deshmukh',
    'meera.d@example.com',
    '+91 97111 12345',
    '22222222-2222-2222-2222-222222222222',
    null,
    null,
    'confirmed',
    'Inquiring about delivery timelines for Manufaktur Opalite White.',
    'Vehicle in transit from plant, ETA 14 days.',
    NOW() - INTERVAL '3 days'
),
(
    'DEMO-202610-011',
    'test_drive',
    'Siddharth Roy',
    'siddharth.roy@example.com',
    '+91 97222 23456',
    '33333333-3333-3333-3333-333333333333',
    CURRENT_DATE - INTERVAL '15 days',
    '14:00:00',
    'completed',
    'Weekend test drive with family.',
    'Completed appointment.',
    NOW() - INTERVAL '18 days'
),
(
    'DEMO-202610-012',
    'showroom_visit',
    'Ananya Chawla',
    'ananya.chawla@example.com',
    '+91 97333 34567',
    null,
    CURRENT_DATE - INTERVAL '8 days',
    '16:30:00',
    'completed',
    'Exploring options for luxury gifting.',
    'Hosted in private showroom pavilion.',
    NOW() - INTERVAL '9 days'
),
(
    'DEMO-202610-013',
    'test_drive',
    'Nikhil Jindal',
    'nikhil.j@example.com',
    '+91 97444 45678',
    '55555555-5555-5555-5555-555555555555',
    CURRENT_DATE - INTERVAL '20 days',
    '10:00:00',
    'rejected',
    'Requested test drive on closed national highway.',
    'Rejected: Test drives only conducted on approved showroom safety routes.',
    NOW() - INTERVAL '22 days'
),
(
    'DEMO-202610-014',
    'purchase_enquiry',
    'Ritu Bhattacharya',
    'ritu.b@example.com',
    '+91 97555 56789',
    '66666666-6666-6666-6666-666666666666',
    null,
    null,
    'pending',
    'Looking for Fortuner Legender delivery before Diwali festival.',
    'Follow-up scheduled with sales coordinator.',
    NOW() - INTERVAL '12 hours'
),
(
    'DEMO-202610-015',
    'test_drive',
    'Kunal Goel',
    'kunal.goel@example.com',
    '+91 97666 67890',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE + INTERVAL '6 days',
    '15:30:00',
    'confirmed',
    'Excited to test M4 Competition handling.',
    'Confirmed.',
    NOW() - INTERVAL '8 hours'
),
(
    'DEMO-202610-016',
    'showroom_visit',
    'Tarun Saxena',
    'tarun.saxena@example.com',
    '+91 97777 78901',
    '44444444-4444-4444-4444-444444444444',
    CURRENT_DATE + INTERVAL '1 day',
    '18:00:00',
    'pending',
    'Evening visit to inspect 911 interior specifications.',
    'Slot tentative, pending phone confirmation.',
    NOW() - INTERVAL '1 hour'
);

-- ====================================================================
-- 5. VERIFIED DEMO VEHICLE SALES (STRICT SEPARATION FROM BOOKINGS)
-- Only explicit records in vehicle_sales count towards actual revenue!
-- ====================================================================

DELETE FROM public.vehicle_sales WHERE customer_name LIKE 'DEMO SALE -%';

INSERT INTO public.vehicle_sales (
    id,
    car_id,
    sale_amount,
    sale_status,
    customer_name,
    customer_contact,
    sales_rep_notes,
    recorded_at
) VALUES
(
    'aaaa1111-aaaa-1111-aaaa-111111111111',
    '22222222-2222-2222-2222-222222222222', -- Mercedes C-Class
    6100000.00,
    'completed',
    'DEMO SALE - Harshvardhan Singhal',
    '+91 98100 99887',
    'Full payment settled via RTGS. Vehicle delivered to client residence.',
    NOW() - INTERVAL '25 days'
),
(
    'bbbb2222-bbbb-2222-bbbb-222222222222',
    '33333333-3333-3333-3333-333333333333', -- Audi Q5
    6500000.00,
    'completed',
    'DEMO SALE - Sunita Rao',
    '+91 98200 88776',
    'Corporate purchase invoice settled. Registration formalities completed.',
    NOW() - INTERVAL '12 days'
),
(
    'cccc3333-cccc-3333-cccc-333333333333',
    '55555555-5555-5555-5555-555555555555', -- Range Rover Velar
    8700000.00,
    'pending_delivery',
    'DEMO SALE - Varun Khanna',
    '+91 98300 77665',
    'Downpayment & vehicle booking advance confirmed. Delivery scheduled next week.',
    NOW() - INTERVAL '4 days'
);

-- ====================================================================
-- 6. AUDIT / ACTIVITY LOGS
-- ====================================================================

INSERT INTO public.activity_logs (action, entity_type, entity_id, metadata, created_at)
VALUES
('INVENTORY_CREATED', 'cars', '11111111-1111-1111-1111-111111111111', '{"brand": "BMW", "model": "M4 Competition"}'::jsonb, NOW() - INTERVAL '30 days'),
('INVENTORY_CREATED', 'cars', '44444444-4444-4444-4444-444444444444', '{"brand": "Porsche", "model": "911 Carrera"}'::jsonb, NOW() - INTERVAL '30 days'),
('SALE_RECORDED', 'vehicle_sales', 'aaaa1111-aaaa-1111-aaaa-111111111111', '{"amount": 6100000, "car": "Mercedes-Benz C-Class"}'::jsonb, NOW() - INTERVAL '25 days'),
('SALE_RECORDED', 'vehicle_sales', 'bbbb2222-bbbb-2222-bbbb-222222222222', '{"amount": 6500000, "car": "Audi Q5"}'::jsonb, NOW() - INTERVAL '12 days');
