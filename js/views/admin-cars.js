/**
 * AUTOELITE — Admin Vehicle Inventory Management View
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { CarService } from '../services/car-service.js';
import { formatINR, escapeHTML } from '../utils.js';
import { UI } from '../ui.js';

export class AdminCarsView {
  static async render() {
    const { data: cars } = await CarService.getCars({ pageSize: 100, includeArchived: true });

    const content = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.4rem; margin-bottom: 0.25rem;">Showroom Fleet Inventory</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Manage high-resolution vehicle profiles, gallery angles, pricing, and availability.</p>
        </div>
        <a href="/admin/cars/new" data-link class="btn btn-primary">
          + Add New Vehicle
        </a>
      </div>

      <div class="data-table-container">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Body / Year</th>
                <th>Ex-Showroom Price</th>
                <th>Engine & Power</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${cars.map(c => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:1rem;">
                      <img src="${c.main_image_url}" alt="${c.model}" style="width:65px;height:42px;object-fit:cover;border-radius:4px;">
                      <div>
                        <div style="font-size:0.75rem;color:var(--accent-primary);text-transform:uppercase;font-weight:600;">${c.brand}</div>
                        <div style="font-weight:600;font-size:0.95rem;color:var(--text-primary);">${c.model}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${c.variant || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>${c.body_type}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${c.model_year}</div>
                  </td>
                  <td>
                    <strong style="color:var(--accent-primary);">${formatINR(c.ex_showroom_price)}</strong>
                  </td>
                  <td>
                    <div>${c.horsepower} HP</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${c.fuel_type} · ${c.transmission}</div>
                  </td>
                  <td>
                    <span class="badge ${c.is_archived ? 'badge-cancelled' : c.availability_status === 'in_stock' ? 'badge-stock-in' : 'badge-stock-open'}">
                      ${c.is_archived ? 'Archived' : c.availability_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    ${c.is_featured ? '<span class="badge badge-gold">Featured</span>' : '<span style="color:var(--text-muted);">No</span>'}
                  </td>
                  <td>
                    <div class="table-actions">
                      <a href="/admin/cars/edit/${c.id}" data-link class="btn-icon-sm" title="Edit Vehicle">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </a>
                      <a href="/car/${c.id}" target="_blank" class="btn-icon-sm" title="View Public Page">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </a>
                      ${!c.is_archived ? `
                        <button class="btn-icon-sm btn-archive-car" data-id="${c.id}" data-model="${c.model}" title="Archive Vehicle" style="color:var(--color-error);">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return renderAdminLayout('cars', 'Vehicle Inventory Management', content);
  }

  static afterRender() {
    initAdminLayoutListeners();

    document.querySelectorAll('.btn-archive-car').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const model = btn.dataset.model;
        if (confirm(`Archive ${model}? It will remain stored for past booking records but hidden from active showroom listings.`)) {
          try {
            await CarService.archiveCar(id);
            UI.showToast('Vehicle Archived', `${model} is now archived.`, 'info');
            window.appRouter.navigate('/admin/cars', false);
          } catch (err) {
            UI.showToast('Error', err.message, 'error');
          }
        }
      };
    });
  }
}
