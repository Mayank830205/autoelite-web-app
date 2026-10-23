/**
 * AUTOELITE — Admin Verified Vehicle Sales & Actual Revenue Management
 * STRICT FINANCIAL SEPARATION: Only explicitly recorded sales in 'vehicle_sales' count towards revenue.
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { SalesService } from '../services/sales-service.js';
import { CarService } from '../services/car-service.js';
import { formatINR, formatDate, escapeHTML } from '../utils.js';
import { UI } from '../ui.js';

export class AdminSalesView {
  static async render() {
    const sales = await SalesService.getSales('all');
    const metrics = await SalesService.getRevenueMetrics('all');
    const { data: cars } = await CarService.getCars({ pageSize: 50 });

    const content = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; margin-bottom: 0.25rem;">Verified Vehicle Sales & Actual Revenue</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Commercial ledger of executed acquisitions. Revenue is calculated strictly from verified sales records.
          </p>
        </div>

        <button class="btn btn-primary" id="btn-open-record-sale">
          + Record Verified Vehicle Sale
        </button>
      </div>

      <!-- REVENUE METRICS ROW -->
      <div class="metrics-grid" style="margin-bottom: 2rem;">
        <div class="metric-card revenue-card">
          <div class="metric-card-header">
            <span class="metric-label">Total Recorded Revenue</span>
            <div class="metric-icon-wrap" style="color:var(--accent-primary);">₹</div>
          </div>
          <div class="metric-value">${formatINR(metrics.totalActualRevenue)}</div>
          <div class="metric-subtitle">
            <span class="badge badge-gold" style="font-size:0.7rem;">Verified Ledger</span>
            Derived strictly from ${metrics.salesCount} vehicle transactions
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Completed Deliveries</span>
            <div class="metric-icon-wrap" style="color:var(--color-success);">✓</div>
          </div>
          <div class="metric-value">${metrics.completedSalesCount}</div>
          <div class="metric-subtitle">Fully settled and handed over</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Pending Deliveries</span>
            <div class="metric-icon-wrap" style="color:var(--color-warning);">⏳</div>
          </div>
          <div class="metric-value">${metrics.pendingDeliveriesCount}</div>
          <div class="metric-subtitle">Awaiting registration & transport</div>
        </div>
      </div>

      <!-- SALES AUDIT TABLE -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.15rem;">Commercial Sales Registry</h3>
          <span style="font-size:0.8rem;color:var(--text-muted);">
            Note: Completed test drives do NOT appear here unless a contract was executed.
          </span>
        </div>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Vehicle Acquired</th>
                <th>Client Details</th>
                <th>Verified Sale Amount</th>
                <th>Delivery Status</th>
                <th>Date Recorded</th>
                <th>Sales Notes</th>
              </tr>
            </thead>
            <tbody>
              ${sales.length === 0 ? `
                <tr><td colspan="6" class="text-center" style="padding:3rem;">No vehicle sales have been recorded yet. Revenue is ₹0.</td></tr>
              ` : sales.map(s => `
                <tr>
                  <td>
                    ${s.cars ? `
                      <div style="font-weight:600;color:var(--text-primary);">${s.cars.brand} ${s.cars.model}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted);">${s.cars.variant || ''}</div>
                    ` : `
                      <span style="color:var(--text-muted);">Vehicle Record</span>
                    `}
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(s.customer_name)}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHTML(s.customer_contact || '—')}</div>
                  </td>
                  <td>
                    <strong style="font-family:var(--font-serif);font-size:1.1rem;color:var(--color-success);">
                      ${formatINR(s.sale_amount)}
                    </strong>
                  </td>
                  <td>
                    <span class="badge ${s.sale_status === 'completed' ? 'badge-completed' : 'badge-pending'}">
                      <span class="badge-dot"></span>
                      ${s.sale_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style="font-size:0.85rem;color:var(--text-secondary);">${formatDate(s.recorded_at)}</div>
                  </td>
                  <td>
                    <div style="font-size:0.8rem;color:var(--text-secondary);max-width:300px;line-height:1.4;">
                      ${escapeHTML(s.sales_rep_notes || '—')}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return renderAdminLayout('sales', 'Vehicle Sales & Revenue', content);
  }

  static afterRender() {
    initAdminLayoutListeners();

    const recordBtn = document.getElementById('btn-open-record-sale');
    if (recordBtn) {
      recordBtn.onclick = async () => {
        const { data: cars } = await CarService.getCars({ pageSize: 50 });

        const modalBody = `
          <div class="form-group">
            <label class="form-label">Vehicle Acquired <span class="required">*</span></label>
            <select id="modal-sale-car" class="form-control" required>
              ${cars.map(c => `
                <option value="${c.id}" data-price="${c.ex_showroom_price}">
                  ${c.brand} ${c.model} (${formatINR(c.ex_showroom_price, true)})
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <div class="form-group">
              <label class="form-label">Purchaser Full Name <span class="required">*</span></label>
              <input type="text" id="modal-sale-customer" class="form-control" placeholder="Harshvardhan Singhal" required>
            </div>
            <div class="form-group">
              <label class="form-label">Client Phone / Contact</label>
              <input type="tel" id="modal-sale-contact" class="form-control" placeholder="+91 98100 99887">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <div class="form-group">
              <label class="form-label">Executed Sale Price (INR) <span class="required">*</span></label>
              <input type="number" id="modal-sale-amount" class="form-control" value="${cars[0]?.ex_showroom_price || 6100000}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Sale Execution Status</label>
              <select id="modal-sale-status" class="form-control">
                <option value="completed">Completed & Delivered</option>
                <option value="pending_delivery">Pending Vehicle Delivery</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Commercial Notes & Invoice Reference</label>
            <textarea id="modal-sale-notes" class="form-control" style="min-height:75px;" placeholder="Full payment settled via RTGS. Invoice #INV-2026-092."></textarea>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-primary" id="btn-confirm-record-sale">Confirm & Record Sale</button>
        `;

        UI.openModal({
          title: 'Record Executed Vehicle Sale',
          body: modalBody,
          footer: modalFooter,
          maxWidth: '560px'
        });

        // Price auto-update on car change
        const carSelect = document.getElementById('modal-sale-car');
        const amountInput = document.getElementById('modal-sale-amount');
        carSelect.onchange = (e) => {
          const selectedOption = e.target.options[e.target.selectedIndex];
          const price = selectedOption.dataset.price;
          if (price) amountInput.value = price;
        };

        document.getElementById('btn-confirm-record-sale').onclick = async () => {
          const carId = document.getElementById('modal-sale-car').value;
          const name = document.getElementById('modal-sale-customer').value.trim();
          const contact = document.getElementById('modal-sale-contact').value.trim();
          const amount = document.getElementById('modal-sale-amount').value;
          const status = document.getElementById('modal-sale-status').value;
          const notes = document.getElementById('modal-sale-notes').value.trim();

          if (!name || !amount) {
            UI.showToast('Validation Error', 'Customer name and sale amount are required.', 'error');
            return;
          }

          try {
            await SalesService.recordSale({
              car_id: carId,
              customer_name: name,
              customer_contact: contact,
              sale_amount: amount,
              sale_status: status,
              sales_rep_notes: notes
            });
            UI.closeModal();
            UI.showToast('Sale Recorded', `Actual revenue increased by ${formatINR(amount)}.`, 'success');
            window.appRouter.navigate('/admin/sales', false);
          } catch (err) {
            UI.showToast('Error', err.message, 'error');
          }
        };
      };
    }
  }
}
