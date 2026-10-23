/**
 * AUTOELITE — Admin Showroom Availability & Schedule Settings View
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { getLocalDb } from '../supabase.js';
import { UI } from '../ui.js';

export class AdminSettingsView {
  static async render() {
    const db = getLocalDb();
    const settings = db.showroom_settings;

    const content = `
      <div style="max-width: 800px; margin-bottom: 3rem;">
        <div style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.4rem; margin-bottom: 0.25rem;">Showroom Operating Schedule & Capacity</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Configure appointment session durations, concurrency slot capacity limits, and blacked-out holidays.
          </p>
        </div>

        <div class="glass-panel" style="padding: 2.5rem;">
          <form id="settings-form">
            <h3 style="font-size: 1.25rem; margin-bottom: 1.25rem; color: var(--accent-secondary);">Appointment Capacity & Durations</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
              <div class="form-group">
                <label class="form-label" for="set-duration">Session Duration (Minutes)</label>
                <input type="number" id="set-duration" class="form-control" min="15" max="180" value="${settings.appointment_duration_minutes || 45}" required>
                <div class="input-feedback" style="color:var(--text-muted);">Default appointment length allocated per test drive.</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="set-capacity">Maximum Clients Per Slot</label>
                <input type="number" id="set-capacity" class="form-control" min="1" max="10" value="${settings.max_bookings_per_slot || 3}" required>
                <div class="input-feedback" style="color:var(--text-muted);">Enforced during booking checks to prevent overbooking.</div>
              </div>
            </div>

            <div class="gold-divider"></div>

            <h3 style="font-size: 1.25rem; margin-bottom: 1.25rem; color: var(--accent-secondary);">Operating Hours</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Monday – Friday</label>
                <input type="text" id="set-hours-mf" class="form-control" value="${settings.opening_hours?.monday?.open || '09:30'} – ${settings.opening_hours?.monday?.close || '19:30'}">
              </div>

              <div class="form-group">
                <label class="form-label">Saturday</label>
                <input type="text" id="set-hours-sat" class="form-control" value="${settings.opening_hours?.saturday?.open || '10:00'} – ${settings.opening_hours?.saturday?.close || '19:00'}">
              </div>

              <div class="form-group">
                <label class="form-label">Sunday</label>
                <input type="text" id="set-hours-sun" class="form-control" value="${settings.opening_hours?.sunday?.open || '11:00'} – ${settings.opening_hours?.sunday?.close || '17:00'}">
              </div>
            </div>

            <div class="gold-divider"></div>

            <h3 style="font-size: 1.25rem; margin-bottom: 1.25rem; color: var(--accent-secondary);">Showroom Concierge Contact Details</h3>

            <div class="form-group">
              <label class="form-label" for="set-phone">Concierge Helpline</label>
              <input type="tel" id="set-phone" class="form-control" value="${settings.contact_phone || '+91 98765 43210'}">
            </div>

            <div class="form-group">
              <label class="form-label" for="set-email">Official Showroom Email</label>
              <input type="email" id="set-email" class="form-control" value="${settings.contact_email || 'concierge@autoelite.luxury'}">
            </div>

            <div class="form-group">
              <label class="form-label" for="set-address">Flagship Showroom Address</label>
              <textarea id="set-address" class="form-control" style="min-height:75px;">${settings.showroom_address || 'AUTOELITE Experience Center, Sector 42, Golf Course Road, Gurugram, Delhi NCR - 122002'}</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
              <button type="submit" class="btn btn-primary" id="btn-save-settings">
                Update Showroom Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    return renderAdminLayout('settings', 'Showroom Operating Schedule', content);
  }

  static afterRender() {
    initAdminLayoutListeners();

    const form = document.getElementById('settings-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const duration = Number(document.getElementById('set-duration').value);
        const capacity = Number(document.getElementById('set-capacity').value);
        const phone = document.getElementById('set-phone').value.trim();
        const email = document.getElementById('set-email').value.trim();
        const address = document.getElementById('set-address').value.trim();

        const db = getLocalDb();
        db.showroom_settings.appointment_duration_minutes = duration;
        db.showroom_settings.max_bookings_per_slot = capacity;
        db.showroom_settings.contact_phone = phone;
        db.showroom_settings.contact_email = email;
        db.showroom_settings.showroom_address = address;

        UI.showToast('Settings Updated', 'Showroom appointment capacity and hours saved.', 'success');
      };
    }
  }
}
