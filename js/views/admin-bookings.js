/**
 * AUTOELITE — Admin Bookings & Appointment Schedule Management
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { BookingService } from '../services/booking-service.js';
import { formatDate, formatTime, debounce, escapeHTML } from '../utils.js';
import { UI } from '../ui.js';

export class AdminBookingsView {
  static filterState = {
    status: '',
    bookingType: '',
    search: '',
    date: '',
    page: 1,
    pageSize: 12
  };

  static async render() {
    const { data: bookings, total, page, pageSize } = await BookingService.getAllBookings(this.filterState);
    const totalPages = Math.ceil(total / pageSize) || 1;

    const content = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.4rem; margin-bottom: 0.25rem;">Appointment & Inquiry Management</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Confirm slots, coordinate test routes, log concierge updates, and review client appointments.</p>
      </div>

      <!-- FILTER CONTROLS -->
      <div class="filters-bar" style="margin-bottom: 1.75rem;">
        <div class="search-input-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="admin-booking-search" class="form-control" placeholder="Search reference, customer name, or email..." value="${escapeHTML(this.filterState.search)}">
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label">Status</label>
          <select id="admin-booking-status" class="form-control">
            <option value="">All Statuses</option>
            <option value="pending" ${this.filterState.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${this.filterState.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="completed" ${this.filterState.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${this.filterState.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="rejected" ${this.filterState.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label">Booking Type</label>
          <select id="admin-booking-type" class="form-control">
            <option value="">All Types</option>
            <option value="test_drive" ${this.filterState.bookingType === 'test_drive' ? 'selected' : ''}>Test Drive</option>
            <option value="showroom_visit" ${this.filterState.bookingType === 'showroom_visit' ? 'selected' : ''}>Showroom Visit</option>
            <option value="purchase_enquiry" ${this.filterState.bookingType === 'purchase_enquiry' ? 'selected' : ''}>Purchase Enquiry</option>
          </select>
        </div>
      </div>

      <!-- DATA TABLE -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <div style="font-weight:600;font-size:0.95rem;">
            Showing ${bookings.length} of ${total} reservations
          </div>
        </div>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Client Name & Contact</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Appointment Slot</th>
                <th>Status</th>
                <th>Concierge Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.length === 0 ? `
                <tr><td colspan="7" class="text-center" style="padding:3rem;">No booking records found.</td></tr>
              ` : bookings.map(b => {
                let badgeClass = 'badge-pending';
                if (b.booking_status === 'confirmed') badgeClass = 'badge-confirmed';
                if (b.booking_status === 'completed') badgeClass = 'badge-completed';
                if (b.booking_status === 'cancelled' || b.booking_status === 'rejected') badgeClass = 'badge-cancelled';

                return `
                  <tr>
                    <td>
                      <strong style="font-family:var(--font-mono);color:var(--accent-primary);font-size:0.95rem;">
                        ${b.booking_reference}
                      </strong>
                      <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
                        ${formatDate(b.created_at)}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(b.customer_name)}</div>
                      <div style="font-size:0.8rem;color:var(--text-secondary);">${escapeHTML(b.customer_email)}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHTML(b.customer_phone)}</div>
                    </td>
                    <td>
                      ${b.cars ? `
                        <div style="font-weight:500;">${b.cars.brand} ${b.cars.model}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${b.cars.variant || ''}</div>
                      ` : `
                        <span style="color:var(--text-muted);">Showroom Visit</span>
                      `}
                    </td>
                    <td>
                      <span class="badge badge-gold" style="text-transform:capitalize;">
                        ${b.booking_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      ${b.appointment_date ? `
                        <div style="font-weight:600;color:var(--text-primary);">${formatDate(b.appointment_date)}</div>
                        <div style="font-size:0.8rem;color:var(--accent-secondary);">${formatTime(b.appointment_time)}</div>
                      ` : `
                        <span style="color:var(--text-muted);">Inquiry / Flexible</span>
                      `}
                    </td>
                    <td>
                      <span class="badge ${badgeClass}">
                        <span class="badge-dot"></span>
                        ${b.booking_status}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        ${b.booking_status === 'pending' ? `
                          <button class="btn btn-sm btn-primary btn-act-confirm" data-id="${b.id}" data-ref="${b.booking_reference}">Confirm</button>
                          <button class="btn btn-sm btn-secondary btn-act-reject" data-id="${b.id}" data-ref="${b.booking_reference}" style="color:var(--color-error);">Reject</button>
                        ` : ''}

                        ${b.booking_status === 'confirmed' ? `
                          <button class="btn btn-sm btn-secondary btn-act-complete" data-id="${b.id}" data-ref="${b.booking_reference}" style="color:var(--color-success);">Complete</button>
                          <button class="btn btn-sm btn-ghost btn-act-cancel" data-id="${b.id}" data-ref="${b.booking_reference}" style="color:var(--color-error);">Cancel</button>
                        ` : ''}

                        <button class="btn-icon-sm btn-act-note" data-id="${b.id}" title="Add Internal Note">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        ${totalPages > 1 ? `
          <div class="table-pagination">
            <div>Page ${page} of ${totalPages}</div>
            <div style="display:flex;gap:0.5rem;">
              <button class="btn btn-secondary btn-sm" id="btn-prev-page" ${page <= 1 ? 'disabled' : ''}>Previous</button>
              <button class="btn btn-secondary btn-sm" id="btn-next-page" ${page >= totalPages ? 'disabled' : ''}>Next</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    return renderAdminLayout('bookings', 'Bookings & Test Drives', content);
  }

  static afterRender() {
    initAdminLayoutListeners();

    const searchInput = document.getElementById('admin-booking-search');
    if (searchInput) {
      searchInput.oninput = debounce((e) => {
        this.filterState.search = e.target.value.trim();
        this.filterState.page = 1;
        window.appRouter.navigate('/admin/bookings', false);
      }, 300);
    }

    const statusSelect = document.getElementById('admin-booking-status');
    if (statusSelect) {
      statusSelect.onchange = (e) => {
        this.filterState.status = e.target.value;
        this.filterState.page = 1;
        window.appRouter.navigate('/admin/bookings', false);
      };
    }

    const typeSelect = document.getElementById('admin-booking-type');
    if (typeSelect) {
      typeSelect.onchange = (e) => {
        this.filterState.bookingType = e.target.value;
        this.filterState.page = 1;
        window.appRouter.navigate('/admin/bookings', false);
      };
    }

    // Action buttons
    document.querySelectorAll('.btn-act-confirm').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        try {
          await BookingService.updateBookingStatus(id, 'confirmed');
          UI.showToast('Confirmed', 'Booking status updated to Confirmed.', 'success');
          window.appRouter.navigate('/admin/bookings', false);
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
        }
      };
    });

    document.querySelectorAll('.btn-act-complete').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        try {
          await BookingService.updateBookingStatus(id, 'completed');
          UI.showToast('Completed', 'Appointment marked as Completed.', 'success');
          window.appRouter.navigate('/admin/bookings', false);
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
        }
      };
    });

    document.querySelectorAll('.btn-act-reject').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (confirm('Reject this appointment request?')) {
          try {
            await BookingService.updateBookingStatus(id, 'rejected');
            UI.showToast('Rejected', 'Appointment rejected.', 'info');
            window.appRouter.navigate('/admin/bookings', false);
          } catch (err) {
            UI.showToast('Error', err.message, 'error');
          }
        }
      };
    });

    document.querySelectorAll('.btn-act-cancel').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (confirm('Cancel this confirmed appointment?')) {
          try {
            await BookingService.updateBookingStatus(id, 'cancelled');
            UI.showToast('Cancelled', 'Booking marked cancelled.', 'info');
            window.appRouter.navigate('/admin/bookings', false);
          } catch (err) {
            UI.showToast('Error', err.message, 'error');
          }
        }
      };
    });

    // Internal note modal
    document.querySelectorAll('.btn-act-note').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const b = await BookingService.getBookingById(id);
        if (!b) return;

        UI.openModal({
          title: `Internal Concierge Notes — ${b.booking_reference}`,
          body: `
            <div class="form-group">
              <label class="form-label">Administrative Notes & Customer Follow-Up Log</label>
              <textarea id="modal-admin-note-text" class="form-control" style="min-height:120px;" placeholder="Add internal directives, key handover instructions, finance details...">${b.admin_notes || ''}</textarea>
            </div>
          `,
          footer: `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-modal-note">Save Notes</button>
          `
        });

        document.getElementById('btn-save-modal-note').onclick = async () => {
          const notes = document.getElementById('modal-admin-note-text').value.trim();
          try {
            await BookingService.updateBookingStatus(id, b.booking_status, notes);
            UI.closeModal();
            UI.showToast('Notes Saved', 'Internal record updated.', 'success');
            window.appRouter.navigate('/admin/bookings', false);
          } catch (err) {
            UI.showToast('Error', err.message, 'error');
          }
        };
      };
    });

    const prevBtn = document.getElementById('btn-prev-page');
    if (prevBtn) {
      prevBtn.onclick = () => {
        this.filterState.page--;
        window.appRouter.navigate('/admin/bookings', false);
      };
    }

    const nextBtn = document.getElementById('btn-next-page');
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.filterState.page++;
        window.appRouter.navigate('/admin/bookings', false);
      };
    }
  }
}
