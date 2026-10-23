/**
 * AUTOELITE — Admin Vehicle Create & Edit Form View
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { CarService } from '../services/car-service.js';
import { UI } from '../ui.js';

export class AdminCarFormView {
  static async render(params) {
    const isEdit = !!params?.id;
    let car = null;
    if (isEdit) {
      car = await CarService.getCarById(params.id);
    }

    const title = isEdit ? `Edit ${car?.brand} ${car?.model}` : 'Add New Showroom Vehicle';

    const content = `
      <div style="max-width: 900px; margin-bottom: 3rem;">
        <div style="margin-bottom: 1.5rem;">
          <a href="/admin/cars" data-link style="font-size: 0.85rem; color: var(--accent-primary);">&larr; Back to Inventory</a>
        </div>

        <div class="glass-panel" style="padding: 2.5rem;">
          <form id="car-form">
            <!-- BASIC IDENTIFICATION -->
            <h3 style="font-size: 1.25rem; margin-bottom: 1.25rem; color: var(--accent-secondary);">Vehicle Identification & Pricing</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="car-brand">Manufacturer / Brand <span class="required">*</span></label>
                <input type="text" id="car-brand" class="form-control" placeholder="e.g. BMW, Porsche" value="${car?.brand || ''}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="car-model">Model Name <span class="required">*</span></label>
                <input type="text" id="car-model" class="form-control" placeholder="e.g. M4 Competition" value="${car?.model || ''}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="car-variant">Variant / Trim</label>
                <input type="text" id="car-variant" class="form-control" placeholder="e.g. M xDrive Coupé" value="${car?.variant || ''}">
              </div>

              <div class="form-group">
                <label class="form-label" for="car-year">Model Year <span class="required">*</span></label>
                <input type="number" id="car-year" class="form-control" min="2000" max="2030" value="${car?.model_year || 2025}" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="car-price">Ex-Showroom Price (INR) <span class="required">*</span></label>
                <input type="number" id="car-price" class="form-control" placeholder="15300000" value="${car?.ex_showroom_price || ''}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="car-on-road">Estimated On-Road Price (INR)</label>
                <input type="number" id="car-on-road" class="form-control" placeholder="17850000" value="${car?.on_road_price || ''}">
              </div>
            </div>

            <div class="gold-divider"></div>

            <!-- POWERTRAIN & MECHANICAL SPECS -->
            <h3 style="font-size: 1.25rem; margin-bottom: 1.25rem; color: var(--accent-secondary);">Powertrain & Architecture</h3>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="car-body">Body Type <span class="required">*</span></label>
                <select id="car-body" class="form-control" required>
                  <option value="Coupe" ${car?.body_type === 'Coupe' ? 'selected' : ''}>Coupe</option>
                  <option value="Sedan" ${car?.body_type === 'Sedan' ? 'selected' : ''}>Sedan</option>
                  <option value="SUV" ${car?.body_type === 'SUV' ? 'selected' : ''}>SUV</option>
                  <option value="Convertible" ${car?.body_type === 'Convertible' ? 'selected' : ''}>Convertible</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="car-fuel">Fuel Type <span class="required">*</span></label>
                <select id="car-fuel" class="form-control" required>
                  <option value="Petrol" ${car?.fuel_type === 'Petrol' ? 'selected' : ''}>Petrol</option>
                  <option value="Diesel" ${car?.fuel_type === 'Diesel' ? 'selected' : ''}>Diesel</option>
                  <option value="Hybrid" ${car?.fuel_type === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                  <option value="Electric" ${car?.fuel_type === 'Electric' ? 'selected' : ''}>Electric</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="car-trans">Transmission <span class="required">*</span></label>
                <input type="text" id="car-trans" class="form-control" placeholder="e.g. Steptronic, PDK, Automatic" value="${car?.transmission || 'Automatic'}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="car-hp">Horsepower (HP) <span class="required">*</span></label>
                <input type="number" id="car-hp" class="form-control" placeholder="503" value="${car?.horsepower || ''}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="car-torque">Peak Torque</label>
                <input type="text" id="car-torque" class="form-control" placeholder="650 Nm @ 2750 rpm" value="${car?.torque || ''}">
              </div>

              <div class="form-group">
                <label class="form-label" for="car-seats">Seating Capacity</label>
                <input type="number" id="car-seats" class="form-control" min="2" max="9" value="${car?.seating_capacity || 5}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="car-engine">Engine Technical Description</label>
              <input type="text" id="car-engine" class="form-control" placeholder="3.0L M TwinPower Turbo Inline 6-Cylinder" value="${car?.engine || ''}">
            </div>

            <div class="gold-divider"></div>

            <!-- MEDIA & ASSETS -->
            <h3 style="font-size: 1.25rem; margin-bottom: 1.25rem; color: var(--accent-secondary);">Imagery & 3D Assets</h3>

            <div class="form-group">
              <label class="form-label" for="car-image">Main Vehicle Photography URL <span class="required">*</span></label>
              <input type="url" id="car-image" class="form-control" placeholder="https://images.unsplash.com/..." value="${car?.main_image_url || ''}" required>
              <div class="input-feedback" style="color:var(--text-muted);">Stored in Supabase 'car-media' bucket or licensed high-res URL.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="car-3d">Optional 3D Model Asset URL (glTF / GLB)</label>
              <input type="url" id="car-3d" class="form-control" placeholder="https://.../model.glb" value="${car?.model_3d_url || ''}">
            </div>

            <div class="form-group">
              <label class="form-label" for="car-desc">Curator's Description</label>
              <textarea id="car-desc" class="form-control" placeholder="Vehicle narrative, design heritage, and driving dynamics...">${car?.description || ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
              <div class="form-group">
                <label class="form-label" for="car-status">Availability Status</label>
                <select id="car-status" class="form-control">
                  <option value="in_stock" ${car?.availability_status === 'in_stock' ? 'selected' : ''}>In Stock / Showroom</option>
                  <option value="booking_open" ${car?.availability_status === 'booking_open' ? 'selected' : ''}>Booking Open</option>
                  <option value="reserved" ${car?.availability_status === 'reserved' ? 'selected' : ''}>Reserved</option>
                  <option value="sold_out" ${car?.availability_status === 'sold_out' ? 'selected' : ''}>Sold Out</option>
                </select>
              </div>

              <div class="form-group" style="display: flex; align-items: center; margin-top: 1.75rem;">
                <label class="form-checkbox">
                  <input type="checkbox" id="car-featured" ${car?.is_featured ? 'checked' : ''}>
                  <span>Display on Homepage Featured Showcase</span>
                </label>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
              <a href="/admin/cars" data-link class="btn btn-secondary">Cancel</a>
              <button type="submit" id="btn-save-car" class="btn btn-primary">
                ${isEdit ? 'Update Vehicle Profile' : 'Publish to Showroom'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    return renderAdminLayout('cars', title, content);
  }

  static afterRender(params) {
    initAdminLayoutListeners();

    const isEdit = !!params?.id;
    const form = document.getElementById('car-form');
    const submitBtn = document.getElementById('btn-save-car');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const payload = {
          brand: document.getElementById('car-brand').value.trim(),
          model: document.getElementById('car-model').value.trim(),
          variant: document.getElementById('car-variant').value.trim(),
          model_year: Number(document.getElementById('car-year').value),
          ex_showroom_price: Number(document.getElementById('car-price').value),
          on_road_price: document.getElementById('car-on-road').value ? Number(document.getElementById('car-on-road').value) : null,
          body_type: document.getElementById('car-body').value,
          fuel_type: document.getElementById('car-fuel').value,
          transmission: document.getElementById('car-trans').value.trim(),
          horsepower: Number(document.getElementById('car-hp').value),
          torque: document.getElementById('car-torque').value.trim(),
          seating_capacity: Number(document.getElementById('car-seats').value),
          engine: document.getElementById('car-engine').value.trim(),
          main_image_url: document.getElementById('car-image').value.trim(),
          model_3d_url: document.getElementById('car-3d').value.trim() || null,
          description: document.getElementById('car-desc').value.trim(),
          availability_status: document.getElementById('car-status').value,
          is_featured: document.getElementById('car-featured').checked
        };

        try {
          if (isEdit) {
            await CarService.updateCar(params.id, payload);
            UI.showToast('Vehicle Updated', `${payload.brand} ${payload.model} updated successfully.`, 'success');
          } else {
            await CarService.createCar(payload);
            UI.showToast('Vehicle Added', `${payload.brand} ${payload.model} added to showroom inventory.`, 'success');
          }
          window.appRouter.navigate('/admin/cars');
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = isEdit ? 'Update Vehicle Profile' : 'Publish to Showroom';
        }
      };
    }
  }
}
