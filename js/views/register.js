/**
 * AUTOELITE — Customer Registration View
 */

import { AuthService } from '../auth.js';
import { UI } from '../ui.js';

export class RegisterView {
  static async render(params, query) {
    const redirectUrl = query?.redirect || '/dashboard';
    return `
      <div class="container section" style="padding-top: calc(var(--header-height) + 3rem); min-height: 85vh; display: flex; align-items: center; justify-content: center;">
        <div class="glass-panel" style="width: 100%; max-width: 520px; padding: 2.5rem;">
          <div class="text-center" style="margin-bottom: 2rem;">
            <div class="brand-logo-text" style="font-size: 1.75rem; margin-bottom: 0.5rem;">AUTO<span>ELITE</span></div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Client Membership</h2>
            <p style="font-size: 0.9rem;">Register to schedule priority test drives and track bespoke inquiries.</p>
          </div>

          <form id="register-form">
            <div class="form-group">
              <label class="form-label" for="reg-name">Full Name <span class="required">*</span></label>
              <input type="text" id="reg-name" class="form-control" placeholder="e.g. Vikramaditya Singhania" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Email Address <span class="required">*</span></label>
              <input type="email" id="reg-email" class="form-control" placeholder="name@example.com" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-phone">Phone Number <span class="required">*</span></label>
              <input type="tel" id="reg-phone" class="form-control" placeholder="+91 98765 43210" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="reg-password">Password <span class="required">*</span></label>
                <input type="password" id="reg-password" class="form-control" placeholder="••••••••" required minlength="6">
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-confirm">Confirm Password <span class="required">*</span></label>
                <input type="password" id="reg-confirm" class="form-control" placeholder="••••••••" required minlength="6">
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.5rem;">
              <label class="form-checkbox">
                <input type="checkbox" id="reg-terms" required>
                <span>I agree to the AUTOELITE Concierge Terms of Service and Privacy Policy.</span>
              </label>
            </div>

            <button type="submit" id="btn-reg-submit" class="btn btn-primary w-full" style="padding: 0.9rem; margin-top: 1rem;">
              Create Client Account
            </button>
          </form>

          <div class="text-center" style="margin-top: 1.75rem; font-size: 0.875rem; color: var(--text-secondary);">
            Already registered? 
            <a href="/login${redirectUrl && redirectUrl !== '/dashboard' ? '?redirect=' + encodeURIComponent(redirectUrl) : ''}" data-link style="color: var(--accent-primary); font-weight: 600;">Sign In</a>
          </div>
        </div>
      </div>
    `;
  }

  static afterRender(params, query) {
    const redirectUrl = query?.redirect || '/dashboard';
    const form = document.getElementById('register-form');
    const submitBtn = document.getElementById('btn-reg-submit');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (password !== confirm) {
          UI.showToast('Validation Error', 'Passwords do not match.', 'error');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        try {
          await AuthService.register({ fullName, email, phone, password });
          UI.showToast('Welcome to AUTOELITE', 'Your membership has been established.', 'success');
          window.appRouter.navigate(redirectUrl);
        } catch (err) {
          UI.showToast('Registration Error', err.message, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Client Account';
        }
      };
    }
  }
}
