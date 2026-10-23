# AUTOELITE — Luxury Showroom & Test-Drive Platform

> **"Experience the Drive. Own the Moment."**  
> A luxury automotive Single Page Application (SPA) designed with Vanilla JavaScript, modern CSS3, and Supabase PostgreSQL.

---

## 🏎️ Executive Summary

**AUTOELITE** is an end-to-end showroom management and test-drive scheduling platform for high-performance luxury automotive dealerships. Built without heavy frameworks (pure Vanilla ES6+ modules, CSS Grid/Flexbox, and Supabase Auth/Postgres/Storage), the application delivers fluid animations, an interactive 360° rotational vehicle studio viewer, side-by-side spec comparison, appointment capacity scheduling, and an executive administration portal with verified commercial revenue tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Custom Variables, 3D Transforms, Glassmorphism), Vanilla JavaScript (ES6+ Modules) |
| **Icons & Visuals** | Lucide-style inline SVGs, High-Resolution Licensed Automotive Imagery, Interactive 360° Frame Sequences |
| **Data Visualization** | Chart.js 4.x via CDN |
| **Backend & Storage** | Supabase Authentication, Supabase PostgreSQL, Supabase Storage (`car-media` bucket) |
| **Security** | PostgreSQL Row Level Security (RLS), Role-Based Access Control (`user_roles`) |
| **Hosting & Deployment** | Vercel Static Hosting (`vercel.json` SPA routing rewrites) |

> ⚠️ **Strict Architectural Constraints Adhered To:**
> - No React, Vue, Angular, Next.js, or TypeScript.
> - No Tailwind CSS or Bootstrap (100% custom-crafted design system).
> - No Node.js/Express backend; static client directly interacts with Supabase via secure RLS.
> - Zero private credentials or `service_role` keys exposed in browser code.

---

## 💎 Design System & Brand Palette

Inspired by iconic supercar configurators and premier German automotive design pavilions.

- **Primary Background**: `#080A0D`
- **Secondary Background**: `#11151B`
- **Card Background**: `#171D25` (Hover: `#1E2530`)
- **Primary Accent**: `#D6B36A` (Champagne Gold)
- **Secondary Accent**: `#F3E8CF` (Cream Gold)
- **Primary Text**: `#F8FAFC`
- **Secondary Text**: `#9CA3AF`
- **Borders**: `rgba(255, 255, 255, 0.12)`
- **Success / Warning / Error**: `#34D399` / `#FBBF24` / `#F87171`
- **Currency Standard**: Indian Rupee (`₹`, `Intl.NumberFormat('en-IN')`)

---

## 🧭 Application Routes

### Public Pages
- `/` — Homepage with mouse-responsive spotlight hero, featured vehicles, concierge benefits, and booking process.
- `/cars` — Vehicle inventory with full-text search, multi-faceted filtering (Price, Fuel, Transmission, Body Type, Availability), sorting, and pagination.
- `/car/:id` — Vehicle detail view featuring 360° drag-to-rotate sequence, multi-angle gallery thumbnails, technical specs, and instant booking CTAs.
- `/compare` — Interactive side-by-side comparison matrix for up to 3 vehicles.
- `/login` — Unified Customer and Administrator sign-in with instant demo access shortcuts.
- `/register` — Customer account creation.
- `/forgot-password` — Password reset recovery workflow.

### Customer Portal
- `/dashboard` — Client overview with upcoming reservation highlights and quick action tiles.
- `/booking/:carId` — Three-mode booking wizard (**Test Drive**, **Showroom Visit**, or **Purchase Enquiry**) with calendar slot picker and concurrency checks.
- `/my-bookings` — Customer booking ledger with status timeline and instant cancellation.
- `/profile` — Client profile information and account management.

### Executive Administration
- `/admin` — High-level KPI overview, Chart.js volume trends, status doughnut, and recent bookings table.
- `/admin/cars` — Inventory master list with search, status badges, and archive triggers.
- `/admin/cars/new` & `/admin/cars/edit/:id` — Complete vehicle profile, pricing, angles, and 3D asset editor.
- `/admin/bookings` — Booking management with state transitions (`pending` → `confirmed` / `rejected`, `confirmed` → `completed`), and concierge internal note logs.
- `/admin/customers` — Client registry with total booking tallies and customer engagement history.
- `/admin/sales` — Commercial sales ledger enforcing strict separation of test drives vs. verified sales revenue.
- `/admin/analytics` — Business intelligence dashboards with custom date range filters.
- `/admin/settings` — Showroom operating hours, session durations, and slot concurrency limits.

---

## 📊 Strict Financial & Revenue Definitions

To ensure strict commercial compliance:
1. **Total Bookings**: Measures engagement volume only.
2. **Completed Appointments**: A completed test drive or showroom visit represents an experience completed, **never revenue**.
3. **Sales Pipeline**: Estimated value of non-binding purchase enquiries.
4. **Verified Vehicle Sales**: Maintained in a dedicated `vehicle_sales` table.
5. **Actual Revenue**: Calculated **strictly** from verified records in `vehicle_sales`. If zero sales are recorded, revenue displays **₹0**.

---

## 🗄️ Supabase Database Architecture

The repository includes complete production-grade SQL scripts in `supabase/`:

### 1. Tables (`supabase/schema.sql`)
- `profiles` (linked to `auth.users`)
- `user_roles` (admin / customer role assignments with non-recursive RLS)
- `cars` (technical specs, pricing, availability, featured flags)
- `car_images` (multi-angle photographs & 360° rotation frames)
- `bookings` (unique auto-generated reference `AEL-YYYYMMDD-XXXX`, statuses, notes)
- `vehicle_sales` (verified commercial transactions)
- `showroom_settings` (operating schedule, slot duration, capacity limits)
- `activity_logs` (audit log records)

### 2. Security & RLS (`supabase/policies.sql`)
- Row Level Security (RLS) is enabled on all tables.
- Customers can only read active non-archived cars, view their own bookings, and cancel eligible bookings.
- Customers **cannot** confirm their own bookings, create sales, or modify vehicle inventory.
- Privileged operations require the trusted `is_admin(auth.uid())` SECURITY DEFINER function.
- Supabase Storage policies protect the `car-media` bucket.

### 3. Demonstration Seed Data (`supabase/seed.sql`)
Includes 6 premier showroom vehicles:
1. **BMW M4 Competition Coupé** — ₹1.53 Crore (`₹1,53,00,000`)
2. **Mercedes-Benz C-Class C 300 AMG Line** — ₹61 Lakh (`₹61,00,000`)
3. **Audi Q5 Technology 45 TFSI quattro** — ₹65 Lakh (`₹65,00,000`)
4. **Porsche 911 Carrera S** — ₹2.00 Crore (`₹2,00,00,000`)
5. **Range Rover Velar Dynamic HSE** — ₹87 Lakh (`₹87,00,000`)
6. **Toyota Fortuner Legender 4x4 AT** — ₹44 Lakh (`₹44,00,000`)
- 16 realistically distributed demo bookings spanning all statuses.
- 3 verified demo vehicle sales generating actual revenue metrics.

---

## 🚀 Quick Start & Local Execution

Because AUTOELITE is built with standard ECMAScript modules, no bundler or npm installation is required.

### Run with any static server:
```bash
# Python 3
python -m http.server 3000

# or Node http-server
npx http-server -p 3000

# or VS Code Live Server extension
```
Open `http://localhost:3000` in your browser.

---

## 🔑 Connecting to Your Real Supabase Project

1. Run `supabase/schema.sql`, `supabase/policies.sql`, and `supabase/seed.sql` in your Supabase SQL Editor.
2. In the AUTOELITE website, click **"Database Settings"** (in the footer or admin topbar).
3. Paste your **Supabase Project URL** and **Anon Public Key**.
4. Click **Save & Connect**. The app immediately tests and connects to your real database!

### Provisioning an Administrator:
1. Register a user in your Supabase Auth dashboard (e.g. `admin@autoelite.luxury`).
2. Run this query in your Supabase SQL Editor to grant admin privileges:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<PASTE-USER-UUID-FROM-AUTH.USERS>', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

---

## ☁️ Vercel Deployment

The project is preconfigured for Vercel via `vercel.json` and `404.html`:

```bash
# Deploy with Vercel CLI
vercel --prod
```
Or push to GitHub and import the repository into your Vercel Dashboard as a static project (Framework Preset: **Other**, Build Command: empty, Output Directory: `./`).

---

## ✅ Feature Verification Checklist

- [x] Luxury UI/UX with mouse spotlight lighting & 3D tilt effects
- [x] Vanilla JS SPA Router with browser back/forward and route guards
- [x] Vehicle catalog with search, price filters, fuel, transmission, body type, and sorting
- [x] Multi-angle image gallery and interactive drag-to-rotate 360° viewer
- [x] Lightweight genuine 3D canvas vehicle rendering
- [x] Side-by-side 3-vehicle comparison matrix
- [x] Test drive, showroom visit, and purchase enquiry booking workflows
- [x] Slot capacity verification against showroom schedule
- [x] Customer dashboard & booking cancellation workflow
- [x] Executive admin portal with Chart.js analytics & collapsible sidebar
- [x] Vehicle inventory creator & editor
- [x] Appointment status transitions & internal notes
- [x] Strict vehicle sales ledger tracking actual revenue in INR
- [x] Complete Supabase SQL scripts (`schema.sql`, `policies.sql`, `seed.sql`)
- [x] Vercel SPA deployment configuration (`vercel.json`, `404.html`)
