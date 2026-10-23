/**
 * AUTOELITE — Customer Profile View
 */

import { AuthService } from '../auth.js';
import { CustomerService } from '../services/customer-service.js';
import { BookingService } from '../services/booking-service.js';
import { UI } from '../ui.js';

export class ProfileView {
  static async render() {
    const user = AuthService.getUser();
    const role = AuthService.getRole();
    const bookings = await BookingService.getMyBookings(user?.id, user?.email);

    return `
      <div class="container section" style="padding-top: calc(var(--header-height) + 2rem); max-width: 800px;">
        <div class="section-header" style="margin-bottom: 2rem;">
          <div class="section-tag">Account Credentials</div>
          <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem;">Client Profile</h1>
          <p>Manage your contact details and active membership preferences.</p>
        </div>

        <div class="glass-panel" style="padding: 2.5rem; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle);">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--accent-gold-subtle); border: 2px solid var(--accent-primary); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700;">
              ${(user?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style="font-size: 1.4rem; margin-bottom: 0.25rem;">${user?.full_name || 'Member'}</h2>
              <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${user?.email}</div>
              <span class="badge ${role === 'admin' ? 'badge-gold' : 'badge-confirmed'}">
                ${role === 'admin' ? 'Executive Administrator' : 'Verified Client Member'}
              </span>
            </div>
          </div>

          <form id="profile-form">
            <div class="form-group">
              <label class="form-label" for="prof-name">Full Name</label>
              <input type="text" id="prof-name" class="form-control" value="${user?.full_name || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address (Read-Only)</label>
              <input type="email" class="form-control" value="${user?.email || ''}" disabled style="opacity: 0.6; cursor: not-allowed;">
              <div class="input-feedback" style="color:var(--text-muted);">Primary login identity cannot be modified directly.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="prof-phone">Phone Number</label>
              <input type="tel" id="prof-phone" class="form-control" value="${user?.phone || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">Assigned Authorization Role</label>
              <input type="text" class="form-control" value="${role}" disabled style="opacity: 0.6; cursor: not-allowed;">
              <div class="input-feedback" style="color:var(--text-muted);">Security Policy: Roles are controlled via backend provisioning.</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
              <button type="button" class="btn btn-danger btn-sm" id="btn-profile-logout">
                Sign Out
              </button>
              <button type="submit" class="btn btn-primary" id="btn-save-profile">
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        <!-- QUICK BOOKING SHORTCUT -->
        <div class="glass-panel" style="padding: 1.75rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Active Bookings (${bookings.length})</h4>
            <p style="font-size: 0.85rem; margin: 0;">Review your upcoming test drives and showroom visits.</p>
          </div>
          <a href="/my-bookings" data-link class="btn btn-secondary">
            View My Bookings
          </a>
        </div>
      </div>
    `;
  }

  static afterRender() {
    const form = document.getElementById('profile-form');
    const logoutBtn = document.getElementById('btn-profile-logout');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('prof-name').value.trim();
        const phone = document.getElementById('prof-phone').value.trim();
        const user = AuthService.getUser();

        try {
          await CustomerService.updateProfile(user.id, { full_name: fullName, phone });
          user.full_name = fullName;
          user.phone = phone;
          UI.showToast('Profile Updated', 'Your contact details have been saved.', 'success');
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
        }
      };
    }

    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await AuthService.logout();
        UI.showToast('Signed Out', 'You have been safely signed out.', 'info');
        window.appRouter.navigate('/');
      };
    }
  }
}
