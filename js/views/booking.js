/**
 * AUTOELITE — Comprehensive Booking Wizard View
 * Supports Test Drive, Showroom Visit & Purchase Enquiry workflows.
 */

import { CarService } from '../services/car-service.js';
import { BookingService } from '../services/booking-service.js';
import { AuthService } from '../auth.js';
import { formatINR, formatTime } from '../utils.js';
import { UI } from '../ui.js';

export class BookingView {
  static currentType = 'test_drive';
  static selectedCar = null;
  static selectedDate = '';
  static selectedTime = '';

  static async render(params, query) {
    const carId = params?.carId || query?.carId || null;
    this.currentType = query?.type || 'test_drive';

    const { data: allCars } = await CarService.getCars({ pageSize: 50 });
    this.selectedCar = carId ? allCars.find(c => c.id === carId) : (allCars[0] || null);

    const user = AuthService.getUser();

    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.selectedDate = tomorrow.toISOString().slice(0, 10);
    this.selectedTime = '11:00:00';

    const timeSlots = [
      '10:00:00', '11:00:00', '12:00:00', '14:30:00', '15:30:00', '16:30:00', '17:30:00', '18:30:00'
    ];

    return `
      <div class="booking-page-wrap container animate-fade-in">
        <div class="section-header" style="margin-bottom: 2rem;">
          <div class="section-tag">Concierge Reservations</div>
          <h1 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 0.5rem;">Schedule Your Experience</h1>
          <p>Book a dedicated 45-minute test drive, arrange a private showroom visit, or register a purchase enquiry.</p>
        </div>

        <!-- TYPE SWITCHER -->
        <div class="booking-type-grid">
          <div class="booking-type-card ${this.currentType === 'test_drive' ? 'selected' : ''}" data-type="test_drive">
            <div class="booking-type-icon">🏎️</div>
            <div class="booking-type-title">Book a Test Drive</div>
            <div class="booking-type-desc">Dynamic route evaluation with our technical driving specialist.</div>
          </div>

          <div class="booking-type-card ${this.currentType === 'showroom_visit' ? 'selected' : ''}" data-type="showroom_visit">
            <div class="booking-type-icon">🏛️</div>
            <div class="booking-type-title">Showroom Visit</div>
            <div class="booking-type-desc">Private lounge tour & inspection of multiple inventory models.</div>
          </div>

          <div class="booking-type-card ${this.currentType === 'purchase_enquiry' ? 'selected' : ''}" data-type="purchase_enquiry">
            <div class="booking-type-icon">📑</div>
            <div class="booking-type-title">Purchase Enquiry</div>
            <div class="booking-type-desc">Bespoke allocation timeline, finance terms, and delivery quotes.</div>
          </div>
        </div>

        <div class="booking-layout">
          <!-- MAIN FORM -->
          <div class="glass-panel" style="padding: 2.5rem;">
            <form id="booking-form">
              <!-- VEHICLE SELECTION -->
              <div class="form-group">
                <label class="form-label" for="booking-car-select">
                  Select Vehicle ${this.currentType === 'showroom_visit' ? '(Optional)' : '<span class="required">*</span>'}
                </label>
                <select id="booking-car-select" class="form-control" ${this.currentType === 'showroom_visit' ? '' : 'required'}>
                  ${this.currentType === 'showroom_visit' ? '<option value="">All Vehicles / General Showroom Tour</option>' : ''}
                  ${allCars.map(c => `
                    <option value="${c.id}" ${this.selectedCar && this.selectedCar.id === c.id ? 'selected' : ''}>
                      ${c.brand} ${c.model} ${c.variant ? '· ' + c.variant : ''} (${formatINR(c.ex_showroom_price, true)})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- DATE & TIME SLOTS (Only for test drives and visits) -->
              ${this.currentType !== 'purchase_enquiry' ? `
                <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                  <div class="form-group" style="margin:0;">
                    <label class="form-label" for="booking-date">Preferred Date <span class="required">*</span></label>
                    <input type="date" id="booking-date" class="form-control" min="${new Date().toISOString().slice(0, 10)}" value="${this.selectedDate}" required>
                  </div>

                  <div>
                    <label class="form-label">Available Appointment Slots (45-Minute Sessions)</label>
                    <div class="slots-grid">
                      ${timeSlots.map(slot => `
                        <button type="button" class="slot-btn ${slot === this.selectedTime ? 'selected' : ''}" data-slot="${slot}">
                          ${formatTime(slot)}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              ` : `
                <div class="glass-panel" style="padding: 1.25rem; background: rgba(214, 179, 106, 0.06); border-color: var(--border-accent); margin-bottom: 1.5rem;">
                  <div style="font-size: 0.9rem; color: var(--accent-secondary); font-weight: 600; margin-bottom: 0.25rem;">
                    Notice of Purchase Enquiry
                  </div>
                  <p style="font-size: 0.85rem; margin: 0;">
                    Submitting this enquiry conveys interest in acquisition. It does not constitute a confirmed financial commitment or vehicle sale. Our team will contact you within 24 hours.
                  </p>
                </div>
              `}

              <!-- CONTACT DETAILS -->
              <h4 style="font-size: 1.1rem; margin: 1.5rem 0 1rem; color: var(--accent-secondary);">Client Contact Information</h4>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="booking-name">Full Name <span class="required">*</span></label>
                  <input type="text" id="booking-name" class="form-control" placeholder="Vikramaditya Singhania" value="${user?.full_name || ''}" required>
                </div>

                <div class="form-group">
                  <label class="form-label" for="booking-phone">Phone Number <span class="required">*</span></label>
                  <input type="tel" id="booking-phone" class="form-control" placeholder="+91 98765 43210" value="${user?.phone || ''}" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="booking-email">Email Address <span class="required">*</span></label>
                <input type="email" id="booking-email" class="form-control" placeholder="name@example.com" value="${user?.email || ''}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="booking-message">Special Requirements / Notes (Optional)</label>
                <textarea id="booking-message" class="form-control" placeholder="e.g. Preparing specific track mode configuration, arriving with family, or asking about delivery schedules..."></textarea>
              </div>

              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-checkbox">
                  <input type="checkbox" id="booking-consent" required checked>
                  <span>I confirm that I hold a valid driver's license for test-drive appointments and consent to concierge communications.</span>
                </label>
              </div>

              <button type="submit" id="btn-submit-booking" class="btn btn-primary w-full" style="padding: 1rem; font-size: 1rem; margin-top: 1.5rem;">
                ${this.currentType === 'purchase_enquiry' ? 'Submit Purchase Enquiry' : 'Confirm Appointment Reservation'}
              </button>
            </form>
          </div>

          <!-- SUMMARY SIDEBAR -->
          <div>
            <div class="booking-summary-card">
              <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Reservation Summary</h3>

              ${this.selectedCar ? `
                <img src="${this.selectedCar.main_image_url}" alt="${this.selectedCar.model}" class="summary-car-img" id="summary-img">
                <div class="summary-car-name" id="summary-name">${this.selectedCar.brand} ${this.selectedCar.model}</div>
                <div class="summary-car-price" id="summary-price">${formatINR(this.selectedCar.ex_showroom_price)}</div>
              ` : `
                <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted);">
                  General Showroom Experience
                </div>
              `}

              <div class="summary-item-row">
                <span class="label">Booking Type</span>
                <span class="value" id="summary-type-label" style="text-transform: capitalize;">
                  ${this.currentType.replace('_', ' ')}
                </span>
              </div>

              ${this.currentType !== 'purchase_enquiry' ? `
                <div class="summary-item-row">
                  <span class="label">Date</span>
                  <span class="value" id="summary-date-label">${this.selectedDate}</span>
                </div>

                <div class="summary-item-row">
                  <span class="label">Time Window</span>
                  <span class="value" id="summary-time-label">${formatTime(this.selectedTime)}</span>
                </div>
              ` : ''}

              <div class="summary-item-row">
                <span class="label">Location</span>
                <span class="value">Golf Course Rd, Gurugram</span>
              </div>

              <div class="summary-item-row">
                <span class="label">Online Deposit</span>
                <span class="value" style="color: var(--color-success);">₹0 (Complimentary)</span>
              </div>

              <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; margin-top: 1.25rem;">
                * Test drive appointments are subject to slot availability and driving credential verification upon arrival.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static afterRender(params, query) {
    const allCars = window.localShowroomCars || [];

    // Type cards switch
    document.querySelectorAll('.booking-type-card').forEach(card => {
      card.onclick = () => {
        const type = card.dataset.type;
        const carId = this.selectedCar ? this.selectedCar.id : '';
        window.appRouter.navigate(`/booking${carId ? '/' + carId : ''}?type=${type}`);
      };
    });

    // Car select switch
    const carSelect = document.getElementById('booking-car-select');
    if (carSelect) {
      carSelect.onchange = (e) => {
        const newCarId = e.target.value;
        window.appRouter.navigate(`/booking${newCarId ? '/' + newCarId : ''}?type=${this.currentType}`);
      };
    }

    // Slot click
    const slotBtns = document.querySelectorAll('.slot-btn');
    slotBtns.forEach(btn => {
      btn.onclick = () => {
        slotBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedTime = btn.dataset.slot;
        const sumTime = document.getElementById('summary-time-label');
        if (sumTime) sumTime.textContent = formatTime(this.selectedTime);
      };
    });

    // Date change
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      dateInput.onchange = (e) => {
        this.selectedDate = e.target.value;
        const sumDate = document.getElementById('summary-date-label');
        if (sumDate) sumDate.textContent = this.selectedDate;
      };
    }

    // Form submit
    const form = document.getElementById('booking-form');
    const submitBtn = document.getElementById('btn-submit-booking');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const user = AuthService.getUser();
        const name = document.getElementById('booking-name').value.trim();
        const email = document.getElementById('booking-email').value.trim();
        const phone = document.getElementById('booking-phone').value.trim();
        const message = document.getElementById('booking-message').value.trim();
        const carId = this.selectedCar ? this.selectedCar.id : null;

        // Verify slot availability
        if (this.currentType !== 'purchase_enquiry') {
          const avail = await BookingService.checkSlotAvailability(this.selectedDate, this.selectedTime);
          if (!avail.available) {
            UI.showToast('Slot Unavailable', avail.reason || 'Please choose another time slot.', 'error');
            return;
          }
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing Reservation...';

        try {
          const booking = await BookingService.createBooking({
            user_id: user ? user.id : null,
            car_id: carId,
            booking_type: this.currentType,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            appointment_date: this.currentType !== 'purchase_enquiry' ? this.selectedDate : null,
            appointment_time: this.currentType !== 'purchase_enquiry' ? this.selectedTime : null,
            customer_message: message
          });

          UI.showToast('Reservation Submitted', `Reference: ${booking.booking_reference}`, 'success');

          // Render luxury confirmation modal
          const confirmationBody = `
            <div class="text-center" style="padding:1rem 0;">
              <div style="width:60px;height:60px;border-radius:50%;background:rgba(52, 211, 153, 0.15);border:2px solid #34D399;color:#34D399;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style="font-size:1.4rem;margin-bottom:0.5rem;">Reservation Confirmed</h3>
              <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:1.5rem;">
                Your request has been logged. Our concierge will review and assign your test vehicle.
              </p>
              
              <div class="glass-panel" style="padding:1rem;margin-bottom:1.5rem;">
                <div style="font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.08em;">Booking Reference</div>
                <div style="font-family:var(--font-mono);font-size:1.4rem;font-weight:700;color:var(--accent-primary);margin-top:0.25rem;">
                  ${booking.booking_reference}
                </div>
              </div>

              <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:1.5rem;">
                A confirmation has been saved to your portal. You can view or manage this appointment anytime.
              </div>
            </div>
          `;

          const confirmationFooter = `
            <button class="btn btn-secondary" onclick="UI.closeModal(); window.appRouter.navigate('/');">Return Home</button>
            <button class="btn btn-primary" onclick="UI.closeModal(); window.appRouter.navigate('/my-bookings');">View in My Bookings</button>
          `;

          UI.openModal({
            title: 'AUTOELITE Concierge',
            body: confirmationBody,
            footer: confirmationFooter,
            maxWidth: '520px'
          });

        } catch (err) {
          UI.showToast('Booking Error', err.message, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirm Appointment Reservation';
        }
      };
    }
  }
}
