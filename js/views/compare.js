/**
 * AUTOELITE — Side-by-Side Vehicle Comparison Matrix
 */

import { CarService } from '../services/car-service.js';
import { formatINR } from '../utils.js';

export class CompareView {
  static selectedCarIds = [];

  static async render(params, query) {
    const { data: allCars } = await CarService.getCars({ pageSize: 50 });

    if (query && query.car1 && !this.selectedCarIds.includes(query.car1)) {
      this.selectedCarIds = [query.car1];
      if (query.car2) this.selectedCarIds.push(query.car2);
    }

    if (this.selectedCarIds.length === 0 && allCars.length >= 2) {
      this.selectedCarIds = [allCars[0].id, allCars[1].id];
    }

    const comparedCars = allCars.filter(c => this.selectedCarIds.includes(c.id));

    return `
      <div class="container section animate-fade-in" style="padding-top: calc(var(--header-height) + 2rem);">
        <div class="section-header">
          <div class="section-tag">Comparison Suite</div>
          <h1 style="font-size:clamp(2rem, 4vw, 3rem);margin-bottom:0.5rem;">Vehicle Side-by-Side Comparison</h1>
          <p>Evaluate technical distinctions, horsepower curves, dimensions, and specifications.</p>
        </div>

        <!-- VEHICLE SELECTION CONTROLS -->
        <div class="glass-panel" style="padding:1.5rem;margin-bottom:2.5rem;">
          <h4 style="font-size:1rem;margin-bottom:1rem;color:var(--accent-secondary);">Select Up to 3 Vehicles to Compare</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:1rem;">
            ${[0, 1, 2].map(slotIndex => {
              const currentId = this.selectedCarIds[slotIndex] || '';
              return `
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Position ${slotIndex + 1}</label>
                  <select class="form-control select-compare-car" data-slot="${slotIndex}">
                    <option value="">— Choose a vehicle —</option>
                    ${allCars.map(c => `
                      <option value="${c.id}" ${c.id === currentId ? 'selected' : ''}>
                        ${c.brand} ${c.model} (${formatINR(c.ex_showroom_price, true)})
                      </option>
                    `).join('')}
                  </select>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- COMPARISON MATRIX TABLE -->
        ${comparedCars.length === 0 ? `
          <div class="glass-panel text-center" style="padding:3rem;">
            <h3>Please select at least one vehicle to evaluate</h3>
          </div>
        ` : `
          <div class="comparison-table-wrap">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th class="comparison-param-name" style="width:240px;">Vehicle Profile</th>
                  ${comparedCars.map(car => `
                    <th style="min-width:280px;text-align:left;">
                      <img src="${car.main_image_url}" alt="${car.model}" style="width:100%;height:160px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:0.75rem;">
                      <div class="car-card-brand">${car.brand}</div>
                      <div style="font-size:1.3rem;font-weight:700;margin-bottom:0.25rem;">${car.model}</div>
                      <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;">${car.variant || ''}</div>
                      <div style="font-family:var(--font-serif);font-size:1.3rem;color:var(--accent-primary);font-weight:700;margin-bottom:1rem;">
                        ${formatINR(car.ex_showroom_price)}
                      </div>
                      <div style="display:flex;gap:0.5rem;">
                        <a href="/car/${car.id}" data-link class="btn btn-secondary btn-sm" style="flex:1;">Details</a>
                        <a href="/booking/${car.id}?type=test_drive" data-link class="btn btn-primary btn-sm" style="flex:1;">Test Drive</a>
                      </div>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="comparison-param-name">Ex-Showroom Price</td>
                  ${comparedCars.map(c => `<td><strong style="color:var(--accent-primary);font-size:1.1rem;">${formatINR(c.ex_showroom_price)}</strong></td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Engine</td>
                  ${comparedCars.map(c => `<td>${c.engine || '—'}</td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Horsepower</td>
                  ${comparedCars.map(c => `<td><span class="badge badge-gold">${c.horsepower} HP</span></td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Torque</td>
                  ${comparedCars.map(c => `<td>${c.torque || '—'}</td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Transmission</td>
                  ${comparedCars.map(c => `<td>${c.transmission}</td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Fuel Type</td>
                  ${comparedCars.map(c => `<td>${c.fuel_type}</td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Body Architecture</td>
                  ${comparedCars.map(c => `<td>${c.body_type}</td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Seating Capacity</td>
                  ${comparedCars.map(c => `<td>${c.seating_capacity} Seats</td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Fuel Efficiency / Range</td>
                  ${comparedCars.map(c => `<td>${c.mileage_or_range || '—'}</td>`).join('')}
                </tr>
                <tr>
                  <td class="comparison-param-name">Availability</td>
                  ${comparedCars.map(c => `
                    <td>
                      <span class="badge ${c.availability_status === 'in_stock' ? 'badge-stock-in' : 'badge-stock-open'}">
                        ${c.availability_status === 'in_stock' ? 'In Stock' : 'Booking Open'}
                      </span>
                    </td>
                  `).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  static afterRender() {
    const selects = document.querySelectorAll('.select-compare-car');
    selects.forEach(select => {
      select.onchange = (e) => {
        const slot = Number(select.dataset.slot);
        const val = e.target.value;
        if (val) {
          this.selectedCarIds[slot] = val;
        } else {
          this.selectedCarIds.splice(slot, 1);
        }
        this.selectedCarIds = [...new Set(this.selectedCarIds.filter(Boolean))];
        window.appRouter.navigate('/compare', false);
      };
    });
  }
}
