/**
 * AUTOELITE — Administrator Executive Dashboard
 * High-precision business metrics, Chart.js visualizations, and recent booking transactions.
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { AnalyticsService } from '../services/analytics-service.js';
import { BookingService } from '../services/booking-service.js';
import { formatINR, formatDate, formatTime, escapeHTML } from '../utils.js';
import { UI } from '../ui.js';

export class AdminDashboardView {
  static async render() {
    const metrics = await AnalyticsService.getSummaryMetrics('all');
    const { data: recentBookings } = await BookingService.getAllBookings({ pageSize: 6 });

    const content = `
      <!-- METRICS GRID -->
      <div class="metrics-grid">
        <div class="metric-card revenue-card">
          <div class="metric-card-header">
            <span class="metric-label">Actual Recorded Revenue</span>
            <div class="metric-icon-wrap" style="color:var(--accent-primary);">₹</div>
          </div>
          <div class="metric-value">${formatINR(metrics.actualRevenue)}</div>
          <div class="metric-subtitle">
            <span class="badge badge-gold" style="font-size:0.7rem;">Verified Sales Only</span>
            From ${metrics.recordedSalesCount} recorded sales
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Total Bookings</span>
            <div class="metric-icon-wrap">📅</div>
          </div>
          <div class="metric-value">${metrics.totalBookings}</div>
          <div class="metric-subtitle">${metrics.pendingBookings} pending approval</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Completed Appointments</span>
            <div class="metric-icon-wrap">🏎️</div>
          </div>
          <div class="metric-value">${metrics.completedAppointments}</div>
          <div class="metric-subtitle" style="font-size:0.75rem;color:var(--text-muted);">
            Test drives & visits completed (Not revenue)
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Sales Pipeline</span>
            <div class="metric-icon-wrap">📑</div>
          </div>
          <div class="metric-value">${formatINR(metrics.pipelineEstimatedValue, true)}</div>
          <div class="metric-subtitle">${metrics.purchaseEnquiries} active purchase enquiries</div>
        </div>
      </div>

      <!-- SECONDARY METRICS ROW -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1rem;margin-bottom:2.5rem;">
        <div class="glass-panel" style="padding:1.25rem;">
          <div class="car-price-label">Confirmed Slots</div>
          <div style="font-size:1.6rem;font-weight:700;color:#60A5FA;margin-top:0.25rem;">${metrics.confirmedBookings}</div>
        </div>
        <div class="glass-panel" style="padding:1.25rem;">
          <div class="car-price-label">Cancelled / Rejected</div>
          <div style="font-size:1.6rem;font-weight:700;color:var(--color-error);margin-top:0.25rem;">${metrics.cancelledBookings + metrics.rejectedBookings}</div>
        </div>
        <div class="glass-panel" style="padding:1.25rem;">
          <div class="car-price-label">Active Inventory</div>
          <div style="font-size:1.6rem;font-weight:700;color:var(--color-success);margin-top:0.25rem;">${metrics.totalCars} Vehicles</div>
        </div>
        <div class="glass-panel" style="padding:1.25rem;">
          <div class="car-price-label">Registered Clients</div>
          <div style="font-size:1.6rem;font-weight:700;color:var(--accent-secondary);margin-top:0.25rem;">${metrics.totalCustomers}</div>
        </div>
      </div>

      <!-- CHARTS SECTION -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Booking Volumes & Inquiries</h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">Monthly Trend</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="chart-booking-trends"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Booking Status Distribution</h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">All-time Breakdown</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="chart-status-doughnut"></canvas>
          </div>
        </div>
      </div>

      <!-- RECENT BOOKINGS TABLE -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.2rem;">Recent Showroom Bookings</h3>
          <a href="/admin/bookings" data-link class="btn btn-outline-gold btn-sm">
            View All Bookings &rarr;
          </a>
        </div>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentBookings.map(b => {
                let badgeClass = 'badge-pending';
                if (b.booking_status === 'confirmed') badgeClass = 'badge-confirmed';
                if (b.booking_status === 'completed') badgeClass = 'badge-completed';
                if (b.booking_status === 'cancelled' || b.booking_status === 'rejected') badgeClass = 'badge-cancelled';

                return `
                  <tr>
                    <td>
                      <strong style="font-family:var(--font-mono);color:var(--accent-primary);">${b.booking_reference}</strong>
                    </td>
                    <td>
                      <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(b.customer_name)}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHTML(b.customer_phone)}</div>
                    </td>
                    <td>
                      ${b.cars ? `<span style="font-weight:500;">${b.cars.brand} ${b.cars.model}</span>` : '<span style="color:var(--text-muted);">Showroom Visit</span>'}
                    </td>
                    <td>
                      <span style="text-transform:capitalize;font-size:0.85rem;">${b.booking_type.replace('_', ' ')}</span>
                    </td>
                    <td>
                      ${b.appointment_date ? `${formatDate(b.appointment_date)} · ${formatTime(b.appointment_time)}` : '<span style="color:var(--text-muted);">Flexible / Inquiry</span>'}
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
                          <button class="btn btn-sm btn-primary btn-quick-confirm" data-id="${b.id}" title="Confirm Appointment">Confirm</button>
                        ` : ''}
                        ${b.booking_status === 'confirmed' ? `
                          <button class="btn btn-sm btn-secondary btn-quick-complete" data-id="${b.id}" style="color:var(--color-success);" title="Mark Completed">Complete</button>
                        ` : ''}
                        <button class="btn-icon-sm btn-quick-view" data-id="${b.id}" title="View Details">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return renderAdminLayout('overview', 'Executive Overview', content);
  }

  static async afterRender() {
    initAdminLayoutListeners();

    // Chart.js initialization
    if (window.Chart) {
      // 1. Booking Trends Chart
      const trendsData = await AnalyticsService.getBookingTrendsChartData();
      const ctxTrends = document.getElementById('chart-booking-trends')?.getContext('2d');
      if (ctxTrends) {
        new window.Chart(ctxTrends, {
          type: 'line',
          data: trendsData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#9CA3AF' } }
            },
            scales: {
              x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
              y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } }
            }
          }
        });
      }

      // 2. Status Doughnut Chart
      const statusData = await AnalyticsService.getStatusBreakdown();
      const ctxStatus = document.getElementById('chart-status-doughnut')?.getContext('2d');
      if (ctxStatus) {
        new window.Chart(ctxStatus, {
          type: 'doughnut',
          data: statusData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right', labels: { color: '#9CA3AF' } }
            }
          }
        });
      }
    }

    // Action buttons
    document.querySelectorAll('.btn-quick-confirm').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        try {
          await BookingService.updateBookingStatus(id, 'confirmed');
          UI.showToast('Appointment Confirmed', 'The reservation has been moved to Confirmed status.', 'success');
          window.appRouter.navigate('/admin', false);
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
        }
      };
    });

    document.querySelectorAll('.btn-quick-complete').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        try {
          await BookingService.updateBookingStatus(id, 'completed');
          UI.showToast('Appointment Completed', 'Marked test drive / visit completed.', 'success');
          window.appRouter.navigate('/admin', false);
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
        }
      };
    });

    document.querySelectorAll('.btn-quick-view').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const b = await BookingService.getBookingById(id);
        if (!b) return;

        UI.openModal({
          title: `Booking ${b.booking_reference}`,
          body: `
            <div style="font-size:0.9rem;display:flex;flex-direction:column;gap:0.75rem;">
              <div><strong>Customer:</strong> ${escapeHTML(b.customer_name)} (${escapeHTML(b.customer_email)})</div>
              <div><strong>Phone:</strong> ${escapeHTML(b.customer_phone)}</div>
              <div><strong>Vehicle:</strong> ${b.cars ? `${b.cars.brand} ${b.cars.model}` : 'Showroom Visit'}</div>
              <div><strong>Status:</strong> <span class="badge badge-gold">${b.booking_status}</span></div>
              <div><strong>Appointment:</strong> ${b.appointment_date ? `${formatDate(b.appointment_date)} at ${formatTime(b.appointment_time)}` : 'Inquiry / Flexible'}</div>
              <div><strong>Client Message:</strong> ${escapeHTML(b.customer_message || 'None')}</div>
              <div><strong>Internal Admin Notes:</strong> ${escapeHTML(b.admin_notes || 'None')}</div>
            </div>
          `,
          footer: `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>`
        });
      };
    });
  }
}
