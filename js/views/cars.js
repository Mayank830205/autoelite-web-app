/**
 * AUTOELITE — Vehicle Collection & Inventory Exploration View
 * Comprehensive search, multi-faceted filtering, sorting & pagination.
 */

import { CarService } from '../services/car-service.js';
import { formatINR, debounce, escapeHTML } from '../utils.js';
import { Animations } from '../animations.js';

export class CarsView {
  static filterState = {
    search: '',
    minPrice: null,
    maxPrice: null,
    fuelType: '',
    transmission: '',
    bodyType: '',
    seatingCapacity: null,
    availability: '',
    sortBy: 'price_asc',
    page: 1,
    pageSize: 9
  };

  static async render() {
    const { data: cars, total, page, pageSize } = await CarService.getCars(this.filterState);
    const totalPages = Math.ceil(total / pageSize) || 1;

    return `
      <div class="container section" style="padding-top: calc(var(--header-height) + 2rem);">
        <div class="section-header" style="margin-bottom: 2rem;">
          <div class="section-tag">Showroom Collection</div>
          <h1 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 0.5rem;">Explore Vehicles</h1>
          <p>Discover perfection in motion. Search and refine across engineering specs and availability.</p>
        </div>

        <!-- FILTERS BAR -->
        <div class="filters-bar">
          <div class="search-input-wrap">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="filter-search" class="form-control" placeholder="Search by brand or model (e.g. BMW, Porsche 911)..." value="${escapeHTML(this.filterState.search)}">
          </div>

          <div class="form-group" style="margin:0;">
            <label class="form-label">Body Type</label>
            <select id="filter-body" class="form-control">
              <option value="">All Body Types</option>
              <option value="Coupe" ${this.filterState.bodyType === 'Coupe' ? 'selected' : ''}>Coupe</option>
              <option value="Sedan" ${this.filterState.bodyType === 'Sedan' ? 'selected' : ''}>Sedan</option>
              <option value="SUV" ${this.filterState.bodyType === 'SUV' ? 'selected' : ''}>SUV</option>
            </select>
          </div>

          <div class="form-group" style="margin:0;">
            <label class="form-label">Fuel Type</label>
            <select id="filter-fuel" class="form-control">
              <option value="">All Fuels</option>
              <option value="Petrol" ${this.filterState.fuelType === 'Petrol' ? 'selected' : ''}>Petrol</option>
              <option value="Diesel" ${this.filterState.fuelType === 'Diesel' ? 'selected' : ''}>Diesel</option>
              <option value="Hybrid" ${this.filterState.fuelType === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
              <option value="Electric" ${this.filterState.fuelType === 'Electric' ? 'selected' : ''}>Electric</option>
            </select>
          </div>

          <div class="form-group" style="margin:0;">
            <label class="form-label">Price Range</label>
            <select id="filter-price" class="form-control">
              <option value="">Any Price</option>
              <option value="0-5000000" ${this.filterState.maxPrice === 5000000 ? 'selected' : ''}>Under ₹50 Lakh</option>
              <option value="5000000-10000000" ${this.filterState.minPrice === 5000000 && this.filterState.maxPrice === 10000000 ? 'selected' : ''}>₹50 Lakh – ₹1 Crore</option>
              <option value="10000000-30000000" ${this.filterState.minPrice === 10000000 ? 'selected' : ''}>Above ₹1 Crore</option>
            </select>
          </div>

          <div class="form-group" style="margin:0;">
            <label class="form-label">Sort By</label>
            <select id="filter-sort" class="form-control">
              <option value="price_asc" ${this.filterState.sortBy === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price_desc" ${this.filterState.sortBy === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="newest" ${this.filterState.sortBy === 'newest' ? 'selected' : ''}>Model Year</option>
              <option value="brand_asc" ${this.filterState.sortBy === 'brand_asc' ? 'selected' : ''}>Brand Name</option>
            </select>
          </div>
        </div>

        <!-- RESULTS INFO -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;font-size:0.9rem;color:var(--text-secondary);">
          <div>Showing <strong style="color:var(--text-primary);">${cars.length}</strong> of ${total} vehicles</div>
          <a href="/compare" data-link class="btn btn-ghost btn-sm" style="color:var(--accent-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
            Open Vehicle Comparison
          </a>
        </div>

        <!-- CARS GRID -->
        ${cars.length === 0 ? `
          <div class="glass-panel text-center" style="padding: 4rem 2rem;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--accent-primary);">🏎️</div>
            <h3 style="margin-bottom: 0.5rem;">No Vehicles Found</h3>
            <p style="margin-bottom: 1.5rem;">No cars matched your active filter criteria. Try resetting or broadening your search.</p>
            <button class="btn btn-outline-gold" id="btn-reset-filters">Reset All Filters</button>
          </div>
        ` : `
          <div class="car-grid">
            ${cars.map(car => `
              <div class="car-card tilt-card">
                <div class="car-card-img-wrap">
                  <img src="${car.main_image_url}" alt="${car.brand} ${car.model}" class="car-card-img" loading="lazy">
                  <div class="car-card-badges">
                    <span class="badge ${car.availability_status === 'in_stock' ? 'badge-stock-in' : 'badge-stock-open'}">
                      <span class="badge-dot"></span>
                      ${car.availability_status === 'in_stock' ? 'In Stock' : 'Booking Open'}
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

          <!-- PAGINATION -->
          ${totalPages > 1 ? `
            <div style="display:flex;justify-content:center;gap:0.5rem;margin-top:3rem;">
              ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                <button class="btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}" data-page="${p}">${p}</button>
              `).join('')}
            </div>
          ` : ''}
        `}
      </div>
    `;
  }

  static afterRender() {
    Animations.initCardTilt();

    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.filterState.search = e.target.value.trim();
        this.filterState.page = 1;
        window.appRouter.navigate('/cars', false);
      }, 350));
    }

    const bodySelect = document.getElementById('filter-body');
    if (bodySelect) {
      bodySelect.addEventListener('change', (e) => {
        this.filterState.bodyType = e.target.value;
        this.filterState.page = 1;
        window.appRouter.navigate('/cars', false);
      });
    }

    const fuelSelect = document.getElementById('filter-fuel');
    if (fuelSelect) {
      fuelSelect.addEventListener('change', (e) => {
        this.filterState.fuelType = e.target.value;
        this.filterState.page = 1;
        window.appRouter.navigate('/cars', false);
      });
    }

    const priceSelect = document.getElementById('filter-price');
    if (priceSelect) {
      priceSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) {
          this.filterState.minPrice = null;
          this.filterState.maxPrice = null;
        } else {
          const [min, max] = val.split('-').map(Number);
          this.filterState.minPrice = min;
          this.filterState.maxPrice = max;
        }
        this.filterState.page = 1;
        window.appRouter.navigate('/cars', false);
      });
    }

    const sortSelect = document.getElementById('filter-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.filterState.sortBy = e.target.value;
        window.appRouter.navigate('/cars', false);
      });
    }

    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.filterState = {
          search: '',
          minPrice: null,
          maxPrice: null,
          fuelType: '',
          transmission: '',
          bodyType: '',
          seatingCapacity: null,
          availability: '',
          sortBy: 'price_asc',
          page: 1,
          pageSize: 9
        };
        window.appRouter.navigate('/cars', false);
      };
    }

    document.querySelectorAll('[data-page]').forEach(btn => {
      btn.onclick = (e) => {
        this.filterState.page = Number(e.target.dataset.page);
        window.appRouter.navigate('/cars', false);
      };
    });
  }
}
