/**
 * AUTOELITE — Homepage View
 * Luxury Automotive Experience & Showroom Collection
 */

import { CarService } from '../services/car-service.js';
import { formatINR } from '../utils.js';
import { Animations } from '../animations.js';

export class HomeView {
  static async render() {
    const featuredCars = await CarService.getFeaturedCars();

    return `
      <div class="home-page animate-fade-in">
        <!-- HERO SECTION -->
        <section class="hero-section">
          <div class="hero-spotlight"></div>
          <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85')"></div>
          <div class="hero-overlay"></div>

          <div class="container hero-content">
            <div class="section-tag">
              <span class="badge-dot" style="background:var(--accent-primary)"></span>
              Flagship Experience Center
            </div>
            <h1 class="hero-title text-gradient-gold">
              Find Your Next<br>Obsession.
            </h1>
            <p class="hero-desc">
              Discover exceptional vehicles, explore every detail, and experience your next drive with AUTOELITE.
            </p>
            <div class="hero-buttons">
              <a href="/cars" data-link class="btn btn-primary btn-lg">
                Explore Collection
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
              <a href="/booking" data-link class="btn btn-secondary btn-lg">
                Book a Test Drive
              </a>
            </div>

            <div class="hero-stats">
              <div class="hero-stat-item">
                <div class="hero-stat-val" data-counter="500">500+</div>
                <div class="hero-stat-label">Bespoke Drives Conducted</div>
              </div>
              <div class="hero-stat-item">
                <div class="hero-stat-val">100%</div>
                <div class="hero-stat-label">Verified Vehicle Provenance</div>
              </div>
              <div class="hero-stat-item">
                <div class="hero-stat-val">45 Min</div>
                <div class="hero-stat-label">Dedicated Private Session</div>
              </div>
            </div>
          </div>
        </section>

        <!-- FEATURED COLLECTION -->
        <section class="section">
          <div class="container">
            <div class="section-header text-center" data-reveal>
              <div class="section-tag">Curated Inventory</div>
              <h2 class="section-title">The Showroom Showcase</h2>
              <p class="section-subtitle">
                Engineered for performance, sculpted with uncompromising elegance. Every vehicle is inspected and ready for an immersive demonstration.
              </p>
            </div>

            <div class="car-grid">
              ${featuredCars.map(car => `
                <div class="car-card tilt-card" data-reveal>
                  <div class="car-card-img-wrap">
                    <img src="${car.main_image_url}" alt="${car.brand} ${car.model}" class="car-card-img" loading="lazy">
                    <div class="car-card-badges">
                      <span class="badge ${car.availability_status === 'in_stock' ? 'badge-stock-in' : 'badge-stock-open'}">
                        <span class="badge-dot"></span>
                        ${car.availability_status === 'in_stock' ? 'In Showroom' : 'Booking Open'}
                      </span>
                      <span class="badge badge-gold">${car.model_year}</span>
                    </div>
                  </div>

                  <div class="car-card-body">
                    <div class="car-card-brand">${car.brand}</div>
                    <h3 class="car-card-title">${car.model}</h3>
                    <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;">${car.variant || ''}</div>

                    <div class="car-card-specs-row">
                      <div class="spec-item" title="Fuel Type">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22h12M4 9h10M4 5h10M4 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18M18 10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-8Z"></path></svg>
                        <span>${car.fuel_type}</span>
                      </div>
                      <div class="spec-item" title="Transmission">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"></path></svg>
                        <span>${car.transmission}</span>
                      </div>
                      <div class="spec-item" title="Seating">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>${car.seating_capacity} Seats</span>
                      </div>
                      <div class="spec-item" title="Power">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        <span>${car.horsepower} HP</span>
                      </div>
                    </div>

                    <div class="car-card-price-row">
                      <div>
                        <div class="car-price-label">Ex-Showroom Demo Price</div>
                        <div class="car-price-val">${formatINR(car.ex_showroom_price)}</div>
                      </div>
                    </div>

                    <div class="car-card-actions">
                      <a href="/car/${car.id}" data-link class="btn btn-secondary btn-sm">
                        View Details
                      </a>
                      <a href="/booking/${car.id}?type=test_drive" data-link class="btn btn-primary btn-sm">
                        Test Drive
                      </a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="text-center" style="margin-top: 3.5rem;">
              <a href="/cars" data-link class="btn btn-outline-gold btn-lg">
                View Complete Showroom Inventory (${featuredCars.length}+ Vehicles)
              </a>
            </div>
          </div>
        </section>

        <!-- WHY CHOOSE AUTOELITE -->
        <section class="section" id="about" style="background:var(--bg-secondary);">
          <div class="container">
            <div class="section-header text-center" data-reveal>
              <div class="section-tag">The AUTOELITE Difference</div>
              <h2 class="section-title">An Unrivaled Showroom Experience</h2>
              <p class="section-subtitle">
                We believe selecting a distinguished vehicle should be as exhilarating as driving it.
              </p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:2rem;">
              <div class="glass-panel" style="padding:2.25rem;" data-reveal>
                <div style="width:48px;height:48px;border-radius:12px;background:var(--accent-gold-subtle);color:var(--accent-primary);display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h3 style="font-size:1.35rem;margin-bottom:0.75rem;">Private VIP Viewing Suites</h3>
                <p>Every test-drive client enjoys a bespoke 45-minute private lounge reservation with automotive specialists and refreshments.</p>
              </div>

              <div class="glass-panel" style="padding:2.25rem;" data-reveal>
                <div style="width:48px;height:48px;border-radius:12px;background:var(--accent-gold-subtle);color:var(--accent-primary);display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h3 style="font-size:1.35rem;margin-bottom:0.75rem;">Dynamic Highway & Track Routes</h3>
                <p>Curated testing circuits designed to evaluate launch acceleration, chassis balance, emergency braking, and highway composure.</p>
              </div>

              <div class="glass-panel" style="padding:2.25rem;" data-reveal>
                <div style="width:48px;height:48px;border-radius:12px;background:var(--accent-gold-subtle);color:var(--accent-primary);display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h3 style="font-size:1.35rem;margin-bottom:0.75rem;">Interactive 360° Exploration</h3>
                <p>Explore exterior silhouettes, open cockpit details, and inspect high-resolution mechanical angles directly in your browser.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- HOW APPOINTMENTS WORK -->
        <section class="section">
          <div class="container">
            <div class="section-header text-center" data-reveal>
              <div class="section-tag">Seamless Booking Process</div>
              <h2 class="section-title">How Test-Drive Bookings Work</h2>
              <p class="section-subtitle">
                Reserve your showroom appointment or test drive in three simple steps.
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:2rem;">
              <div style="text-align:center;padding:1.5rem;" data-reveal>
                <div style="width:56px;height:56px;border-radius:50%;background:var(--accent-gold-subtle);border:2px solid var(--accent-primary);color:var(--accent-primary);display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;margin:0 auto 1.25rem;">1</div>
                <h3 style="font-size:1.2rem;margin-bottom:0.5rem;">Select Vehicle</h3>
                <p style="font-size:0.9rem;">Choose from our curated collection of coupes, luxury sedans, and performance SUVs.</p>
              </div>

              <div style="text-align:center;padding:1.5rem;" data-reveal>
                <div style="width:56px;height:56px;border-radius:50%;background:var(--accent-gold-subtle);border:2px solid var(--accent-primary);color:var(--accent-primary);display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;margin:0 auto 1.25rem;">2</div>
                <h3 style="font-size:1.2rem;margin-bottom:0.5rem;">Choose Date & Slot</h3>
                <p style="font-size:0.9rem;">Pick an appointment window. Showroom capacity limits ensure you receive uninterrupted attention.</p>
              </div>

              <div style="text-align:center;padding:1.5rem;" data-reveal>
                <div style="width:56px;height:56px;border-radius:50%;background:var(--accent-gold-subtle);border:2px solid var(--accent-primary);color:var(--accent-primary);display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;margin:0 auto 1.25rem;">3</div>
                <h3 style="font-size:1.2rem;margin-bottom:0.5rem;">Experience The Drive</h3>
                <p style="font-size:0.9rem;">Receive an instant confirmation reference and enjoy your private test drive experience.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- FREQUENTLY ASKED QUESTIONS -->
        <section class="section" style="background:var(--bg-secondary);">
          <div class="container container-narrow">
            <div class="section-header text-center" data-reveal>
              <div class="section-tag">Assistance & FAQ</div>
              <h2 class="section-title">Frequently Asked Questions</h2>
            </div>

            <div style="display:flex;flex-direction:column;gap:1rem;">
              <details class="glass-panel" style="padding:1.25rem 1.75rem;cursor:pointer;">
                <summary style="font-weight:600;font-size:1.05rem;color:var(--text-primary);list-style:none;display:flex;justify-content:space-between;align-items:center;">
                  What documentation is required for a test drive?
                  <span style="color:var(--accent-primary);font-size:1.2rem;">+</span>
                </summary>
                <p style="margin-top:0.875rem;font-size:0.925rem;color:var(--text-secondary);">
                  A valid original driver's license (minimum 2 years of driving experience) and government identification are required before key handover.
                </p>
              </details>

              <details class="glass-panel" style="padding:1.25rem 1.75rem;cursor:pointer;">
                <summary style="font-weight:600;font-size:1.05rem;color:var(--text-primary);list-style:none;display:flex;justify-content:space-between;align-items:center;">
                  Does booking an appointment mean I have purchased the vehicle?
                  <span style="color:var(--accent-primary);font-size:1.2rem;">+</span>
                </summary>
                <p style="margin-top:0.875rem;font-size:0.925rem;color:var(--text-secondary);">
                  No. An appointment or test drive reservation reserves an exclusive showroom slot for exploration and evaluation. Actual vehicle acquisitions are recorded separately upon contract execution.
                </p>
              </details>

              <details class="glass-panel" style="padding:1.25rem 1.75rem;cursor:pointer;">
                <summary style="font-weight:600;font-size:1.05rem;color:var(--text-primary);list-style:none;display:flex;justify-content:space-between;align-items:center;">
                  Can I reschedule or cancel my booking?
                  <span style="color:var(--accent-primary);font-size:1.2rem;">+</span>
                </summary>
                <p style="margin-top:0.875rem;font-size:0.925rem;color:var(--text-secondary);">
                  Yes, customers can cancel or reschedule any pending or confirmed booking at any time directly through the "My Bookings" portal.
                </p>
              </details>
            </div>
          </div>
        </section>

        <!-- FOOTER -->
        <footer id="contact" style="background:#050709;padding:4rem 0 2rem;border-top:1px solid var(--border-default);">
          <div class="container">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:2.5rem;margin-bottom:3rem;">
              <div>
                <div class="brand-logo-text" style="margin-bottom:1rem;">AUTO<span>ELITE</span></div>
                <p style="font-size:0.875rem;line-height:1.7;">
                  Experience the Drive. Own the Moment.<br>
                  India's foremost destination for curated luxury automotive excellence.
                </p>
                <div style="margin-top:1.25rem;display:flex;gap:0.75rem;">
                  <button class="btn btn-outline-gold btn-sm" onclick="UI.openSupabaseConnectModal()">
                    <span class="badge-dot" style="background:#34D399;"></span>
                    Database Settings
                  </button>
                </div>
              </div>

              <div>
                <h4 style="font-size:0.95rem;margin-bottom:1rem;color:var(--accent-secondary);text-transform:uppercase;letter-spacing:0.05em;">Showroom</h4>
                <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.875rem;color:var(--text-secondary);">
                  <li><a href="/cars" data-link>All Vehicles</a></li>
                  <li><a href="/compare" data-link>Side-by-Side Comparison</a></li>
                  <li><a href="/booking" data-link>Book Test Drive</a></li>
                  <li><a href="/login" data-link>Customer Portal</a></li>
                </ul>
              </div>

              <div>
                <h4 style="font-size:0.95rem;margin-bottom:1rem;color:var(--accent-secondary);text-transform:uppercase;letter-spacing:0.05em;">Administration</h4>
                <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.875rem;color:var(--text-secondary);">
                  <li><a href="/admin" data-link>Executive Dashboard</a></li>
                  <li><a href="/admin/cars" data-link>Inventory Control</a></li>
                  <li><a href="/admin/bookings" data-link>Booking Management</a></li>
                  <li><a href="/admin/analytics" data-link>Revenue & Business Analytics</a></li>
                </ul>
              </div>

              <div>
                <h4 style="font-size:0.95rem;margin-bottom:1rem;color:var(--accent-secondary);text-transform:uppercase;letter-spacing:0.05em;">Experience Center</h4>
                <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.6;">
                  AUTOELITE Flagship Pavilion<br>
                  Sector 42, Golf Course Road<br>
                  Gurugram, Delhi NCR - 122002<br>
                  <strong style="color:var(--accent-primary);">concierge@autoelite.luxury</strong>
                </p>
              </div>
            </div>

            <div class="gold-divider"></div>

            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;font-size:0.8125rem;color:var(--text-muted);">
              <div>© 2026 AUTOELITE Luxury Showroom Platform. All rights reserved.</div>
              <div>Prices and vehicle specifications shown are for demonstration purposes.</div>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  static afterRender() {
    Animations.initHeroLighting();
    Animations.initCardTilt();
    Animations.initScrollReveals();
  }
}
