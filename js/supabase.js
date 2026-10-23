/**
 * AUTOELITE — Supabase Database & Client Architecture
 * Seamlessly handles live Supabase Postgres/Auth/Storage with robust local reactive fallback.
 */

import { ConfigManager } from './config.js';
import { generateBookingRef, generateUUID } from './utils.js';

// Global Supabase client instance
let supabaseClient = null;
let isLiveSupabase = false;

// In-Memory Database store seeded with demonstration data matching seed.sql
const localDb = {
  cars: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      brand: 'BMW',
      model: 'M4 Competition',
      variant: 'M xDrive Coupé',
      model_year: 2025,
      ex_showroom_price: 15300000,
      on_road_price: 17850000,
      fuel_type: 'Petrol',
      transmission: 'Steptronic',
      body_type: 'Coupe',
      engine: '3.0L M TwinPower Turbo Inline 6-Cylinder',
      horsepower: 503,
      torque: '650 Nm @ 2750-5500 rpm',
      mileage_or_range: '9.8 km/l',
      seating_capacity: 4,
      exterior_colors: ['Isle of Man Green Metallic', 'Sao Paulo Yellow', 'Brooklyn Grey Metallic', 'Black Sapphire Metallic', 'Toronto Red Metallic'],
      interior_colors: ['Yas Marina Blue / Black Extended Merino Leather', 'Kyalami Orange / Black', 'Silverstone / Black'],
      features: ['M Carbon Bucket Seats', 'BMW Curved Display with M-specific graphics', 'M Carbon Ceramic Brakes', 'Adaptive M Suspension', 'Harman Kardon Surround Sound System', 'Head-Up Display with Track Mode', 'M Drive Professional with 10-stage traction control'],
      safety_features: ['Active Protection System', 'Cornering Brake Control (CBC)', 'Dynamic Stability Control with M Dynamic Mode', '6 Airbags with dual-stage deployment', 'Parking Assistant Plus with 3D Surround View'],
      description: 'The BMW M4 Competition Coupé represents pure motorsport pedigree engineered for the open road. Powered by a high-revving 503 hp M TwinPower Turbo engine and equipped with intelligent M xDrive, it delivers 0-100 km/h in an astonishing 3.5 seconds with telepathic chassis control.',
      main_image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85',
      availability_status: 'in_stock',
      is_featured: true,
      is_archived: false,
      model_3d_url: null,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      variant: 'C 300 AMG Line',
      model_year: 2025,
      ex_showroom_price: 6100000,
      on_road_price: 7150000,
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      body_type: 'Sedan',
      engine: '2.0L Turbocharged Inline-4 with 48V Mild Hybrid (EQ Boost)',
      horsepower: 258,
      torque: '400 Nm + 200 Nm Boost',
      mileage_or_range: '14.4 km/l',
      seating_capacity: 5,
      exterior_colors: ['Obsidian Black Metallic', 'Selenite Grey', 'Polar White', 'Spectral Blue', 'Manufaktur Opalite White Bright'],
      interior_colors: ['Sienna Brown / Black Artico Leather', 'Macchiato Beige', 'Black Nappa Leather'],
      features: ['11.9-inch Portrait Central Touchscreen', 'Burmester 3D Surround Sound System', 'Panoramic Sliding Sunroof', 'Active Ambient Lighting (64 Colors)', 'Digital Light Technology with Projection', 'Wireless Smartphone Integration'],
      safety_features: ['Active Brake Assist with Cross-Traffic Detection', 'Blind Spot Assist with Exit Warning', 'PRE-SAFE Impulse Side', 'Active Parking Assist with Parktronic', '7 Airbags with Centre Airbag'],
      description: 'Referred to as the "Baby S-Class", the Mercedes-Benz C 300 AMG Line combines avant-garde digital luxury with progressive sportiness. It features an integrated starter-generator mild-hybrid powertrain and second-generation MBUX infotainment.',
      main_image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85',
      availability_status: 'in_stock',
      is_featured: true,
      is_archived: false,
      model_3d_url: null,
      created_at: new Date(Date.now() - 28 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      brand: 'Audi',
      model: 'Q5',
      variant: 'Technology 45 TFSI quattro',
      model_year: 2025,
      ex_showroom_price: 6500000,
      on_road_price: 7620000,
      fuel_type: 'Petrol',
      transmission: 'Dual-Clutch (DCT)',
      body_type: 'SUV',
      engine: '2.0L 4-Cylinder TFSI Turbocharged Petrol',
      horsepower: 249,
      torque: '370 Nm @ 1600-4500 rpm',
      mileage_or_range: '13.4 km/l',
      seating_capacity: 5,
      exterior_colors: ['Navarra Blue Metallic', 'Mythos Black', 'Glacier White', 'Chronos Grey', 'Manhattan Grey'],
      interior_colors: ['Okapi Brown Cricket Leather', 'Black Leatherette with Contrast Stitching'],
      features: ['Audi Virtual Cockpit Plus (12.3-inch)', 'quattro All-Wheel Drive with Ultra Technology', 'Adaptive Suspension with Damper Control', 'Bang & Olufsen 3D Premium Sound System (19 Speakers)', 'Matrix LED Headlights with Dynamic Indicators'],
      safety_features: ['Electronic Stability Control (ESC)', 'Audi Pre-Sense Basic & Rear', 'Hill Descent Control', '8 Airbags', 'ISOFIX Child Seat Mounts'],
      description: 'The Audi Q5 combines sporty character with high everyday practicality. Its quattro all-wheel drive, refined suspension dampening, and whisper-quiet cabin deliver effortless poise across Indian highways.',
      main_image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85',
      availability_status: 'in_stock',
      is_featured: true,
      is_archived: false,
      model_3d_url: null,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      brand: 'Porsche',
      model: '911 Carrera',
      variant: 'Carrera S 992.2',
      model_year: 2025,
      ex_showroom_price: 20000000,
      on_road_price: 23200000,
      fuel_type: 'Petrol',
      transmission: 'PDK',
      body_type: 'Coupe',
      engine: '3.0L Twin-Turbocharged Flat-6 Boxer',
      horsepower: 443,
      torque: '530 Nm @ 2300-5000 rpm',
      mileage_or_range: '8.9 km/l',
      seating_capacity: 4,
      exterior_colors: ['Guards Red', 'Racing Yellow', 'GT Silver Metallic', 'Gentian Blue Metallic', 'Crayon Special Paint'],
      interior_colors: ['Black / Bordeaux Red Two-Tone Leather', 'Truffle Brown Club Leather', 'Slate Grey'],
      features: ['8-Speed Porsche Doppelkupplung (PDK)', 'Sport Chrono Package with Mode Switch', 'Porsche Active Suspension Management (PASM)', 'Sports Exhaust System with Black Tailpipes', 'Bose Surround Sound System', 'Front Axle Lift System'],
      safety_features: ['Porsche Ceramic Composite Brakes (PCCB)', 'Porsche Stability Management (PSM)', 'Lane Keep Assist with Traffic Sign Recognition', 'Full-Size Front and Side Airbags', 'Night Vision Assist'],
      description: 'The archetype of sports cars. The Porsche 911 Carrera S continues more than sixty years of engineering perfection. The rear-mounted twin-turbo flat-six engine roars with visceral emotion.',
      main_image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
      availability_status: 'booking_open',
      is_featured: true,
      is_archived: false,
      model_3d_url: null,
      created_at: new Date(Date.now() - 22 * 86400000).toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      brand: 'Land Rover',
      model: 'Range Rover Velar',
      variant: 'Dynamic HSE 2.0 Petrol',
      model_year: 2025,
      ex_showroom_price: 8700000,
      on_road_price: 10150000,
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      body_type: 'SUV',
      engine: '2.0L 4-Cylinder Turbocharged Ingenium',
      horsepower: 247,
      torque: '365 Nm @ 1300-4500 rpm',
      mileage_or_range: '11.2 km/l',
      seating_capacity: 5,
      exterior_colors: ['Santorini Black', 'Fuji White', 'Hakuba Silver', 'Carpathian Grey Premium Metallic', 'Zadar Grey'],
      interior_colors: ['Ebony Windsor Leather with Mars Red Accents', 'Cloud / Ebony Duotone', 'Light Oyster'],
      features: ['Pivi Pro 11.4-inch Curved Glass Touchscreen', 'Meridian 3D Surround Sound (17 Speakers)', 'Electronic Air Suspension with Adaptive Dynamics', 'Flush Deployable Door Handles', 'Cabin Air Purification Plus with PM2.5 filtration', 'Sliding Panoramic Roof'],
      safety_features: ['All-Terrain Progress Control (ATPC)', 'Terrain Response 2 with Dynamic Program', 'Emergency Braking & Driver Condition Monitor', '3D Surround Camera with Wade Sensing', '6 Airbags'],
      description: 'The Range Rover Velar is the avant-garde luxury SUV. Clean, reductive design meets calm, sanctuary-like interiors crafted from the finest materials.',
      main_image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85',
      availability_status: 'in_stock',
      is_featured: true,
      is_archived: false,
      model_3d_url: null,
      created_at: new Date(Date.now() - 19 * 86400000).toISOString()
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      brand: 'Toyota',
      model: 'Fortuner Legender',
      variant: '4x4 AT',
      model_year: 2025,
      ex_showroom_price: 4400000,
      on_road_price: 5280000,
      fuel_type: 'Diesel',
      transmission: 'Automatic',
      body_type: 'SUV',
      engine: '2.8L 4-Cylinder D-4D Turbo Diesel',
      horsepower: 201,
      torque: '500 Nm @ 1600-2800 rpm',
      mileage_or_range: '14.2 km/l',
      seating_capacity: 7,
      exterior_colors: ['Platinum White Pearl with Black Roof', 'Attitude Black'],
      interior_colors: ['Dual Tone Black & Maroon Leather Upholstery'],
      features: ['Catamaran Style Sharp Front Bumper', 'Split Quad-LED Headlamps with Sequential Turn Signals', 'Kick-Sensor Powered Back Door', 'Ventilated Front Seats', 'Wireless Charging Pad', 'JBL 11-Speaker Audio with Subwoofer'],
      safety_features: ['Vehicle Stability Control (VSC) with Brake Assist', 'Hill Assist Control & Downhill Assist Control', 'Traction Control System (TRC)', '7 SRS Airbags including Knee Airbag', 'Anti-Theft Alarm with Ultrasonic Sensor'],
      description: 'The undisputed king of rugged luxury. The Toyota Fortuner Legender combines menacing street presence with legendary durability, supreme off-road capability, and an indulgent executive cabin.',
      main_image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85',
      availability_status: 'in_stock',
      is_featured: true,
      is_archived: false,
      model_3d_url: null,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    }
  ],

  car_images: [
    // BMW M4
    { id: 'img-1', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85', angle_label: 'front_quarter', display_order: 1 },
    { id: 'img-2', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85', angle_label: 'front', display_order: 2 },
    { id: 'img-3', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1600&q=85', angle_label: 'side', display_order: 3 },
    { id: 'img-4', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85', angle_label: 'rear_quarter', display_order: 4 },
    { id: 'img-5', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85', angle_label: 'dashboard', display_order: 5 },
    { id: 'img-6', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85', angle_label: 'interior', display_order: 6 },
    { id: 'img-7', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1600&q=85', angle_label: 'wheel', display_order: 7 },

    // 360 sequence for BMW M4
    { id: 'm4-360-0', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_00', display_order: 100 },
    { id: 'm4-360-1', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_01', display_order: 101 },
    { id: 'm4-360-2', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_02', display_order: 102 },
    { id: 'm4-360-3', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_03', display_order: 103 },
    { id: 'm4-360-4', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_04', display_order: 104 },
    { id: 'm4-360-5', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_05', display_order: 105 },
    { id: 'm4-360-6', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_06', display_order: 106 },
    { id: 'm4-360-7', car_id: '11111111-1111-1111-1111-111111111111', image_url: 'https://images.unsplash.com/photo-1617814076668-8dfc6cb30b91?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_07', display_order: 107 },

    // Porsche 911
    { id: 'p-1', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85', angle_label: 'front_quarter', display_order: 1 },
    { id: 'p-2', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85', angle_label: 'rear_quarter', display_order: 2 },
    { id: 'p-3', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85', angle_label: 'front', display_order: 3 },
    { id: 'p-4', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85', angle_label: 'interior', display_order: 4 },

    // 360 sequence for Porsche 911
    { id: 'p-360-0', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_00', display_order: 100 },
    { id: 'p-360-1', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_01', display_order: 101 },
    { id: 'p-360-2', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_02', display_order: 102 },
    { id: 'p-360-3', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_03', display_order: 103 },
    { id: 'p-360-4', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_04', display_order: 104 },
    { id: 'p-360-5', car_id: '44444444-4444-4444-4444-444444444444', image_url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', angle_label: 'frame_05', display_order: 105 },

    // Mercedes C-Class
    { id: 'mb-1', car_id: '22222222-2222-2222-2222-222222222222', image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85', angle_label: 'front_quarter', display_order: 1 },
    { id: 'mb-2', car_id: '22222222-2222-2222-2222-222222222222', image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85', angle_label: 'front', display_order: 2 },
    { id: 'mb-3', car_id: '22222222-2222-2222-2222-222222222222', image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=85', angle_label: 'side', display_order: 3 },
    { id: 'mb-4', car_id: '22222222-2222-2222-2222-222222222222', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85', angle_label: 'dashboard', display_order: 4 },

    // Audi Q5
    { id: 'aq-1', car_id: '33333333-3333-3333-3333-333333333333', image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85', angle_label: 'front_quarter', display_order: 1 },
    { id: 'aq-2', car_id: '33333333-3333-3333-3333-333333333333', image_url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85', angle_label: 'front', display_order: 2 },
    { id: 'aq-3', car_id: '33333333-3333-3333-3333-333333333333', image_url: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85', angle_label: 'side', display_order: 3 },

    // Range Rover Velar
    { id: 'rr-1', car_id: '55555555-5555-5555-5555-555555555555', image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85', angle_label: 'front_quarter', display_order: 1 },
    { id: 'rr-2', car_id: '55555555-5555-5555-5555-555555555555', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85', angle_label: 'side', display_order: 2 },

    // Toyota Fortuner Legender
    { id: 'tf-1', car_id: '66666666-6666-6666-6666-666666666666', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85', angle_label: 'front_quarter', display_order: 1 },
    { id: 'tf-2', car_id: '66666666-6666-6666-6666-666666666666', image_url: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85', angle_label: 'side', display_order: 2 }
  ],

  bookings: [
    {
      id: 'b-1',
      booking_reference: 'DEMO-202610-001',
      booking_type: 'test_drive',
      customer_name: 'Vikramaditya Singhania',
      customer_email: 'vikram.singhania@example.com',
      customer_phone: '+91 98111 22334',
      car_id: '11111111-1111-1111-1111-111111111111',
      user_id: 'demo-user-1',
      appointment_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      appointment_time: '11:00:00',
      booking_status: 'confirmed',
      customer_message: 'Interested in Isle of Man Green spec. Please prepare track configuration.',
      admin_notes: 'VIP Customer. Key handover arranged with Chief Experience Officer.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'b-2',
      booking_reference: 'DEMO-202610-002',
      booking_type: 'purchase_enquiry',
      customer_name: 'Aanya Kapoor',
      customer_email: 'aanya.kapoor@example.com',
      customer_phone: '+91 98222 33445',
      car_id: '44444444-4444-4444-4444-444444444444',
      user_id: null,
      appointment_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      appointment_time: '14:30:00',
      booking_status: 'pending',
      customer_message: 'Looking for immediate allocation of 911 Carrera in Guards Red.',
      admin_notes: 'Allocation slot checking with regional factory distributor.',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'b-3',
      booking_reference: 'DEMO-202610-003',
      booking_type: 'showroom_visit',
      customer_name: 'Rajesh Malhotra',
      customer_email: 'rajesh.malhotra@example.com',
      customer_phone: '+91 98333 44556',
      car_id: null,
      user_id: null,
      appointment_date: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
      appointment_time: '16:00:00',
      booking_status: 'confirmed',
      customer_message: 'Family visit to evaluate luxury executive sedans and SUVs.',
      admin_notes: 'Lounge hospitality and private consultant assigned.',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString()
    },
    {
      id: 'b-4',
      booking_reference: 'DEMO-202610-004',
      booking_type: 'test_drive',
      customer_name: 'Dr. Rohan Mukherjee',
      customer_email: 'dr.rohan@example.com',
      customer_phone: '+91 98444 55667',
      car_id: '22222222-2222-2222-2222-222222222222',
      user_id: null,
      appointment_date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
      appointment_time: '10:30:00',
      booking_status: 'completed',
      customer_message: 'Wanted to compare ride quality with previous generation C-Class.',
      admin_notes: 'Test drive completed successfully. Customer was very impressed with MBUX.',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'b-5',
      booking_reference: 'DEMO-202610-005',
      booking_type: 'test_drive',
      customer_name: 'Pooja Nambiar',
      customer_email: 'pooja.nambiar@example.com',
      customer_phone: '+91 98555 66778',
      car_id: '55555555-5555-5555-5555-555555555555',
      user_id: null,
      appointment_date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
      appointment_time: '15:00:00',
      booking_status: 'completed',
      customer_message: 'Checking highway poise and sound insulation.',
      admin_notes: 'Test drive completed. Sent brochure and customized finance quote.',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'b-6',
      booking_reference: 'DEMO-202610-006',
      booking_type: 'purchase_enquiry',
      customer_name: 'Sameer Merchant',
      customer_email: 'sameer.m@example.com',
      customer_phone: '+91 98666 77889',
      car_id: '33333333-3333-3333-3333-333333333333',
      user_id: null,
      appointment_date: null,
      appointment_time: null,
      booking_status: 'pending',
      customer_message: 'Requesting corporate fleet purchase quotation for two Audi Q5 Technology units.',
      admin_notes: 'Sent to Corporate B2B sales desk.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'b-7',
      booking_reference: 'DEMO-202610-007',
      booking_type: 'test_drive',
      customer_name: 'Kabir Oberoi',
      customer_email: 'kabir.o@example.com',
      customer_phone: '+91 98777 88990',
      car_id: '66666666-6666-6666-6666-666666666666',
      user_id: null,
      appointment_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      appointment_time: '12:00:00',
      booking_status: 'pending',
      customer_message: 'Testing 4x4 low range switchability for estate use.',
      admin_notes: 'Awaiting customer license photo verification.',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString()
    },
    {
      id: 'b-8',
      booking_reference: 'DEMO-202610-008',
      booking_type: 'test_drive',
      customer_name: 'Devika Sen',
      customer_email: 'devika.sen@example.com',
      customer_phone: '+91 98888 99001',
      car_id: '44444444-4444-4444-4444-444444444444',
      user_id: 'demo-user-1',
      appointment_date: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
      appointment_time: '11:00:00',
      booking_status: 'cancelled',
      customer_message: 'Urgent travel rescheduled.',
      admin_notes: 'Cancelled by customer via online portal.',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'b-9',
      booking_reference: 'DEMO-202610-009',
      booking_type: 'showroom_visit',
      customer_name: 'Arjun Varma',
      customer_email: 'arjun.varma@example.com',
      customer_phone: '+91 98999 00112',
      car_id: '11111111-1111-1111-1111-111111111111',
      user_id: null,
      appointment_date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
      appointment_time: '17:00:00',
      booking_status: 'confirmed',
      customer_message: 'Viewing M Carbon bucket seats in person with my coach.',
      admin_notes: 'Confirmed appointment slot.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'b-10',
      booking_reference: 'DEMO-202610-010',
      booking_type: 'purchase_enquiry',
      customer_name: 'Meera Deshmukh',
      customer_email: 'meera.d@example.com',
      customer_phone: '+91 97111 12345',
      car_id: '22222222-2222-2222-2222-222222222222',
      user_id: null,
      appointment_date: null,
      appointment_time: null,
      booking_status: 'confirmed',
      customer_message: 'Inquiring about delivery timelines for Manufaktur Opalite White.',
      admin_notes: 'Vehicle in transit from plant, ETA 14 days.',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'b-11',
      booking_reference: 'DEMO-202610-011',
      booking_type: 'test_drive',
      customer_name: 'Siddharth Roy',
      customer_email: 'siddharth.roy@example.com',
      customer_phone: '+91 97222 23456',
      car_id: '33333333-3333-3333-3333-333333333333',
      user_id: null,
      appointment_date: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10),
      appointment_time: '14:00:00',
      booking_status: 'completed',
      customer_message: 'Weekend test drive with family.',
      admin_notes: 'Completed appointment.',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString()
    },
    {
      id: 'b-12',
      booking_reference: 'DEMO-202610-012',
      booking_type: 'showroom_visit',
      customer_name: 'Ananya Chawla',
      customer_email: 'ananya.chawla@example.com',
      customer_phone: '+91 97333 34567',
      car_id: null,
      user_id: null,
      appointment_date: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
      appointment_time: '16:30:00',
      booking_status: 'completed',
      customer_message: 'Exploring options for luxury gifting.',
      admin_notes: 'Hosted in private showroom pavilion.',
      created_at: new Date(Date.now() - 9 * 86400000).toISOString()
    },
    {
      id: 'b-13',
      booking_reference: 'DEMO-202610-013',
      booking_type: 'test_drive',
      customer_name: 'Nikhil Jindal',
      customer_email: 'nikhil.j@example.com',
      customer_phone: '+91 97444 45678',
      car_id: '55555555-5555-5555-5555-555555555555',
      user_id: null,
      appointment_date: new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10),
      appointment_time: '10:00:00',
      booking_status: 'rejected',
      customer_message: 'Requested test drive on closed national highway.',
      admin_notes: 'Rejected: Test drives only conducted on approved showroom safety routes.',
      created_at: new Date(Date.now() - 22 * 86400000).toISOString()
    },
    {
      id: 'b-14',
      booking_reference: 'DEMO-202610-014',
      booking_type: 'purchase_enquiry',
      customer_name: 'Ritu Bhattacharya',
      customer_email: 'ritu.b@example.com',
      customer_phone: '+91 97555 56789',
      car_id: '66666666-6666-6666-6666-666666666666',
      user_id: null,
      appointment_date: null,
      appointment_time: null,
      booking_status: 'pending',
      customer_message: 'Looking for Fortuner Legender delivery before Diwali festival.',
      admin_notes: 'Follow-up scheduled with sales coordinator.',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: 'b-15',
      booking_reference: 'DEMO-202610-015',
      booking_type: 'test_drive',
      customer_name: 'Kunal Goel',
      customer_email: 'kunal.goel@example.com',
      customer_phone: '+91 97666 67890',
      car_id: '11111111-1111-1111-1111-111111111111',
      user_id: null,
      appointment_date: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
      appointment_time: '15:30:00',
      booking_status: 'confirmed',
      customer_message: 'Excited to test M4 Competition handling.',
      admin_notes: 'Confirmed.',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString()
    },
    {
      id: 'b-16',
      booking_reference: 'DEMO-202610-016',
      booking_type: 'showroom_visit',
      customer_name: 'Tarun Saxena',
      customer_email: 'tarun.saxena@example.com',
      customer_phone: '+91 97777 78901',
      car_id: '44444444-4444-4444-4444-444444444444',
      user_id: null,
      appointment_date: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
      appointment_time: '18:00:00',
      booking_status: 'pending',
      customer_message: 'Evening visit to inspect 911 interior specifications.',
      admin_notes: 'Slot tentative, pending phone confirmation.',
      created_at: new Date(Date.now() - 1 * 3600000).toISOString()
    }
  ],

  // VERIFIED VEHICLE SALES (STRICT SEPARATION: Only explicit sales count towards revenue!)
  vehicle_sales: [
    {
      id: 's-1',
      car_id: '22222222-2222-2222-2222-222222222222', // Mercedes C-Class
      customer_name: 'DEMO SALE - Harshvardhan Singhal',
      customer_contact: '+91 98100 99887',
      sale_amount: 6100000,
      sale_status: 'completed',
      sales_rep_notes: 'Full payment settled via RTGS. Vehicle delivered to client residence.',
      recorded_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 's-2',
      car_id: '33333333-3333-3333-3333-333333333333', // Audi Q5
      customer_name: 'DEMO SALE - Sunita Rao',
      customer_contact: '+91 98200 88776',
      sale_amount: 6500000,
      sale_status: 'completed',
      sales_rep_notes: 'Corporate purchase invoice settled. Registration formalities completed.',
      recorded_at: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 's-3',
      car_id: '55555555-5555-5555-5555-555555555555', // Range Rover Velar
      customer_name: 'DEMO SALE - Varun Khanna',
      customer_contact: '+91 98300 77665',
      sale_amount: 8700000,
      sale_status: 'pending_delivery',
      sales_rep_notes: 'Downpayment & vehicle booking advance confirmed. Delivery scheduled next week.',
      recorded_at: new Date(Date.now() - 4 * 86400000).toISOString()
    }
  ],

  showroom_settings: {
    id: '00000000-0000-0000-0000-000000000001',
    opening_hours: {
      monday: { open: '09:30', close: '19:30' },
      tuesday: { open: '09:30', close: '19:30' },
      wednesday: { open: '09:30', close: '19:30' },
      thursday: { open: '09:30', close: '19:30' },
      friday: { open: '09:30', close: '19:30' },
      saturday: { open: '10:00', close: '19:00' },
      sunday: { open: '11:00', close: '17:00' }
    },
    closed_dates: ['2026-10-24', '2026-11-01', '2026-12-25'],
    appointment_duration_minutes: 45,
    max_bookings_per_slot: 3,
    contact_phone: '+91 98765 43210',
    contact_email: 'concierge@autoelite.luxury',
    showroom_address: 'AUTOELITE Experience Center, Sector 42, Golf Course Road, Gurugram, Delhi NCR - 122002'
  },

  customers: [
    { id: 'demo-user-1', full_name: 'Vikramaditya Singhania', email: 'vikram.singhania@example.com', phone: '+91 98111 22334', role: 'customer', created_at: new Date(Date.now() - 40 * 86400000).toISOString() },
    { id: 'demo-user-2', full_name: 'Aanya Kapoor', email: 'aanya.kapoor@example.com', phone: '+91 98222 33445', role: 'customer', created_at: new Date(Date.now() - 35 * 86400000).toISOString() },
    { id: 'demo-user-3', full_name: 'Rajesh Malhotra', email: 'rajesh.malhotra@example.com', phone: '+91 98333 44556', role: 'customer', created_at: new Date(Date.now() - 28 * 86400000).toISOString() },
    { id: 'demo-user-4', full_name: 'Dr. Rohan Mukherjee', email: 'dr.rohan@example.com', phone: '+91 98444 55667', role: 'customer', created_at: new Date(Date.now() - 25 * 86400000).toISOString() },
    { id: 'demo-user-5', full_name: 'Pooja Nambiar', email: 'pooja.nambiar@example.com', phone: '+91 98555 66778', role: 'customer', created_at: new Date(Date.now() - 20 * 86400000).toISOString() }
  ]
};

/**
 * Initializes the Supabase client
 */
export async function initSupabase() {
  const config = ConfigManager.getConfig();

  if (window.supabase && !config.isDemoMode) {
    try {
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      // Quick ping test
      const { data, error } = await supabaseClient.from('cars').select('id').limit(1);
      if (!error) {
        isLiveSupabase = true;
        console.log('✅ Connected to live Supabase Postgres database.');
        return { isLive: true, client: supabaseClient };
      } else {
        console.warn('⚠️ Supabase connection test returned error, using local fallback:', error.message);
      }
    } catch (err) {
      console.warn('⚠️ Supabase client initialization error, falling back to local database:', err);
    }
  }

  isLiveSupabase = false;
  console.log('ℹ️ Running in AUTOELITE demonstration database mode.');
  return { isLive: false, client: null };
}

export function isConnectedToSupabase() {
  return isLiveSupabase;
}

export function getSupabase() {
  return supabaseClient;
}

export function getLocalDb() {
  return localDb;
}
