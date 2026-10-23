/**
 * AUTOELITE — Customer Dashboard Overview
 */

import { AuthService } from '../auth.js';
import { BookingService } from '../services/booking-service.js';
import { formatDate, formatTime } from '../utils.js';

export class UserDashboardView {
  static async render() {
    const user = AuthService.getUser();
    const bookings = await BookingService.getMyBookings(user?.id, user?.email);

    const upcoming = bookings.find(b => b.booking_status === 'confirmed' || b.booking_status === 'pending');

    return `
      <div class="container section animate-fade-in" style="padding-top: calc(var(--header-height) + 2rem);">
        <div class="section-header" style="margin-bottom: 2rem;">
          <div class="section-tag">Client Pavilion</div>
          <h1 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 0.5rem;">Welcome back, ${user?.full_name?.split(' ')[0] || 'Member'}</h1>
          <p>Your private portal for automotive appointments, bespoke drives, and vehicle acquisitions.</p>
        </div>

        <!-- UPCOMING APPOINTMENT BANNER -->
        ${upcoming ? `
          <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem; border-color: var(--border-accent); background: linear-gradient(135deg, rgba(214, 179, 106, 0.08) 0%, var(--bg-card) 60%);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <span class="badge badge-gold" style="margin-bottom: 0.5rem;">Upcoming Reservation</span>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.25rem;">
                  ${upcoming.cars ? `${upcoming.cars.brand} ${upcoming.cars.model}` : 'Showroom Visit'}
                </h3>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                  ${upcoming.appointment_date ? `${formatDate(upcoming.appointment_date)} at ${formatTime(upcoming.appointment_time)}` : 'Flexible Schedule'} · Ref: ${upcoming.booking_reference}
                </div>
              </div>
              <a href="/my-bookings" data-link class="btn btn-outline-gold btn-sm">
                Manage Appointment
              </a>
            </div>
          </div>
        ` : ''}

        <!-- QUICK ACTION TILES -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
          <div class="glass-panel" style="padding: 2rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🏎️</div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Book a Test Drive</h3>
            <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Reserve a 45-minute private drive session in any active showroom vehicle.</p>
            <a href="/booking?type=test_drive" data-link class="btn btn-primary btn-sm">Reserve Slot</a>
          </div>

          <div class="glass-panel" style="padding: 2rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🏛️</div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Showroom Experience</h3>
            <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Visit our Golf Course Road pavilion with our senior automotive consultants.</p>
            <a href="/booking?type=showroom_visit" data-link class="btn btn-secondary btn-sm">Arrange Visit</a>
          </div>

          <div class="glass-panel" style="padding: 2rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📑</div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Vehicle Comparison</h3>
            <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Compare horsepower curves, dimensions, and standard specs side-by-side.</p>
            <a href="/compare" data-link class="btn btn-secondary btn-sm">Open Comparison</a>
          </div>
        </div>

        <!-- RECENT BOOKINGS SUMMARY -->
        <div class="glass-panel" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.3rem;">Recent Activity</h3>
            <a href="/my-bookings" data-link style="font-size: 0.875rem; color: var(--accent-primary);">View All Bookings &rarr;</a>
          </div>

          ${bookings.length === 0 ? `
            <p style="color: var(--text-muted); font-size: 0.9rem;">No booking history yet.</p>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${bookings.slice(0, 3).map(b => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm);">
                  <div>
                    <span style="font-weight: 600; color: var(--text-primary);">${b.booking_reference}</span>
                    <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem;">· ${b.cars ? `${b.cars.brand} ${b.cars.model}` : 'Showroom Visit'}</span>
                  </div>
                  <span class="badge ${b.booking_status === 'confirmed' ? 'badge-confirmed' : b.booking_status === 'completed' ? 'badge-completed' : 'badge-pending'}">
                    ${b.booking_status}
                  </span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  static afterRender() {}
}
