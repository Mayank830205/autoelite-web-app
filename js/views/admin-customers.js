/**
 * AUTOELITE — Admin Customer Directory Management View
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { CustomerService } from '../services/customer-service.js';
import { BookingService } from '../services/booking-service.js';
import { formatDate, debounce, escapeHTML } from '../utils.js';
import { UI } from '../ui.js';

export class AdminCustomersView {
  static filterState = {
    search: '',
    page: 1,
    pageSize: 15
  };

  static async render() {
    const { data: customers, total, page, pageSize } = await CustomerService.getCustomers(this.filterState);
    const totalPages = Math.ceil(total / pageSize) || 1;

    const content = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.4rem; margin-bottom: 0.25rem;">Client Directory & Member Profiles</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Review registered clients, their lifetime appointment counts, and engagement history.</p>
      </div>

      <!-- SEARCH BAR -->
      <div class="filters-bar" style="margin-bottom: 1.5rem; grid-template-columns: 1fr;">
        <div class="search-input-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="admin-cust-search" class="form-control" placeholder="Search by client name, email, or telephone..." value="${escapeHTML(this.filterState.search)}">
        </div>
      </div>

      <!-- DATA TABLE -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <div style="font-weight: 600;">Showing ${customers.length} of ${total} registered clients</div>
        </div>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Client Profile</th>
                <th>Contact Details</th>
                <th>Member Since</th>
                <th>Total Bookings</th>
                <th>Last Active Appointment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${customers.length === 0 ? `
                <tr><td colspan="6" class="text-center" style="padding:3rem;">No client records found.</td></tr>
              ` : customers.map(c => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                      <div class="sidebar-avatar" style="width:36px;height:36px;font-size:0.85rem;">
                        ${(c.full_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(c.full_name)}</div>
                        <span class="badge badge-gold" style="font-size:0.65rem;margin-top:2px;">Verified Member</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-size:0.875rem;color:var(--text-secondary);">${escapeHTML(c.email)}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${escapeHTML(c.phone || '—')}</div>
                  </td>
                  <td>
                    <div style="font-size:0.85rem;color:var(--text-secondary);">${formatDate(c.created_at)}</div>
                  </td>
                  <td>
                    <span class="badge ${c.total_bookings > 0 ? 'badge-confirmed' : 'badge-gold'}">
                      ${c.total_bookings} Bookings
                    </span>
                  </td>
                  <td>
                    <div style="font-size:0.85rem;color:var(--text-secondary);">${formatDate(c.last_booking_date)}</div>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-view-cust-history" data-id="${c.id}" data-name="${escapeHTML(c.full_name)}" data-email="${escapeHTML(c.email)}">
                      Booking History
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return renderAdminLayout('customers', 'Client Directory', content);
  }

  static afterRender() {
    initAdminLayoutListeners();

    const searchInput = document.getElementById('admin-cust-search');
    if (searchInput) {
      searchInput.oninput = debounce((e) => {
        this.filterState.search = e.target.value.trim();
        this.filterState.page = 1;
        window.appRouter.navigate('/admin/customers', false);
      }, 300);
    }

    document.querySelectorAll('.btn-view-cust-history').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const email = btn.dataset.email;
        const bookings = await BookingService.getMyBookings(id, email);

        const listHtml = bookings.length === 0
          ? '<p style="color:var(--text-muted);padding:1rem 0;">No bookings recorded for this client.</p>'
          : `
            <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:360px;overflow-y:auto;">
              ${bookings.map(b => `
                <div style="padding:0.75rem 1rem;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <strong style="color:var(--accent-primary);">${b.booking_reference}</strong>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${b.cars ? `${b.cars.brand} ${b.cars.model}` : 'Showroom Visit'} · ${formatDate(b.created_at)}</div>
                  </div>
                  <span class="badge ${b.booking_status === 'confirmed' ? 'badge-confirmed' : b.booking_status === 'completed' ? 'badge-completed' : 'badge-pending'}">
                    ${b.booking_status}
                  </span>
                </div>
              `).join('')}
            </div>
          `;

        UI.openModal({
          title: `Booking History — ${name}`,
          body: listHtml,
          footer: `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>`
        });
      };
    });
  }
}
