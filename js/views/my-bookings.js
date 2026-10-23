/**
 * AUTOELITE — My Bookings View (Customer Portal)
 * View appointment history, track statuses, and cancel eligible bookings.
 */

import { BookingService } from '../services/booking-service.js';
import { AuthService } from '../auth.js';
import { formatDate, formatTime, escapeHTML } from '../utils.js';
import { UI } from '../ui.js';

export class MyBookingsView {
  static async render(params) {
    const user = AuthService.getUser();
    const bookings = await BookingService.getMyBookings(user?.id, user?.email);
    const targetBookingId = params?.bookingId || null;

    return `
      <div class="container section" style="padding-top: calc(var(--header-height) + 2rem);">
        <div class="section-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="section-tag">Client Reservations</div>
            <h1 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 0.5rem;">My Bookings & Inquiries</h1>
            <p>Track your test drive appointments, showroom reservations, and purchase enquiries.</p>
          </div>

          <a href="/booking" data-link class="btn btn-primary">
            + Schedule New Appointment
          </a>
        </div>

        ${bookings.length === 0 ? `
          <div class="glass-panel text-center" style="padding: 4rem 2rem;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--accent-primary);">📅</div>
            <h3 style="margin-bottom: 0.5rem;">No Active Bookings Found</h3>
            <p style="margin-bottom: 1.5rem;">You have not scheduled any showroom visits or test drives yet.</p>
            <a href="/cars" data-link class="btn btn-outline-gold">Explore Vehicles to Test Drive</a>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            ${bookings.map(b => {
              const car = b.cars;
              const isCancellable = b.booking_status === 'pending' || b.booking_status === 'confirmed';
              const isTargeted = targetBookingId && (b.id === targetBookingId || b.booking_reference === targetBookingId);

              let statusBadgeClass = 'badge-pending';
              if (b.booking_status === 'confirmed') statusBadgeClass = 'badge-confirmed';
              if (b.booking_status === 'completed') statusBadgeClass = 'badge-completed';
              if (b.booking_status === 'cancelled' || b.booking_status === 'rejected') statusBadgeClass = 'badge-cancelled';

              return `
                <div class="glass-panel" style="padding: 1.75rem 2rem; ${isTargeted ? 'border-color: var(--accent-primary); box-shadow: 0 0 25px rgba(214, 179, 106, 0.3);' : ''}">
                  <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem;">
                        <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-primary); font-size: 1.1rem;">
                          ${b.booking_reference}
                        </span>
                        <span class="badge ${statusBadgeClass}">
                          <span class="badge-dot"></span>
                          ${b.booking_status}
                        </span>
                        <span class="badge badge-gold" style="text-transform: capitalize;">
                          ${b.booking_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div style="font-size: 0.8125rem; color: var(--text-muted);">
                        Submitted on ${formatDate(b.created_at)}
                      </div>
                    </div>

                    ${isCancellable ? `
                      <button class="btn btn-danger btn-sm btn-cancel-booking" data-id="${b.id}" data-ref="${b.booking_reference}">
                        Cancel Reservation
                      </button>
                    ` : ''}
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                    ${car ? `
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${car.main_image_url}" alt="${car.model}" style="width: 80px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);">
                        <div>
                          <div style="font-size: 0.75rem; color: var(--accent-primary); text-transform: uppercase; font-weight: 600;">${car.brand}</div>
                          <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">${car.model}</div>
                        </div>
                      </div>
                    ` : `
                      <div style="font-weight: 500; color: var(--text-secondary);">
                        General Showroom Experience Center Visit
                      </div>
                    `}

                    <div>
                      <div class="car-price-label">Appointment Schedule</div>
                      <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary); margin-top: 0.2rem;">
                        ${b.appointment_date ? `${formatDate(b.appointment_date)} at ${formatTime(b.appointment_time)}` : 'Inquiry / Flexible'}
                      </div>
                    </div>

                    <div>
                      <div class="car-price-label">Customer Contact</div>
                      <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.2rem;">
                        ${escapeHTML(b.customer_name)} · ${escapeHTML(b.customer_phone)}
                      </div>
                    </div>
                  </div>

                  ${b.customer_message ? `
                    <div style="margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary);">
                      <strong style="color: var(--text-primary);">Your Notes:</strong> ${escapeHTML(b.customer_message)}
                    </div>
                  ` : ''}

                  ${b.admin_notes ? `
                    <div style="margin-top: 0.75rem; padding: 0.75rem 1rem; background: var(--accent-gold-subtle); border: 1px solid var(--border-accent); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--accent-secondary);">
                      <strong style="color: var(--accent-primary);">Showroom Concierge Update:</strong> ${escapeHTML(b.admin_notes)}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  static afterRender() {
    const cancelBtns = document.querySelectorAll('.btn-cancel-booking');
    cancelBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const ref = btn.dataset.ref;
        const user = AuthService.getUser();

        UI.openModal({
          title: 'Confirm Reservation Cancellation',
          body: `
            <p>Are you sure you wish to cancel booking <strong>${ref}</strong>?</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
              This will release your reserved slot for other clients. You can reschedule anytime.
            </p>
          `,
          footer: `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Keep Appointment</button>
            <button class="btn btn-danger" id="confirm-cancel-action">Yes, Cancel Reservation</button>
          `
        });

        document.getElementById('confirm-cancel-action').onclick = async () => {
          try {
            await BookingService.cancelBooking(id, user.id);
            UI.closeModal();
            UI.showToast('Reservation Cancelled', `Booking ${ref} was marked cancelled.`, 'info');
            window.appRouter.navigate('/my-bookings', false);
          } catch (err) {
            UI.showToast('Error', err.message, 'error');
          }
        };
      };
    });
  }
}
