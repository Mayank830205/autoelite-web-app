/**
 * AUTOELITE — Forgot Password View
 */

import { AuthService } from '../auth.js';
import { UI } from '../ui.js';

export class ForgotPasswordView {
  static async render() {
    return `
      <div class="container section" style="padding-top: calc(var(--header-height) + 3rem); min-height: 85vh; display: flex; align-items: center; justify-content: center;">
        <div class="glass-panel" style="width: 100%; max-width: 480px; padding: 2.5rem;">
          <div class="text-center" style="margin-bottom: 2rem;">
            <div class="brand-logo-text" style="font-size: 1.75rem; margin-bottom: 0.5rem;">AUTO<span>ELITE</span></div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Reset Credentials</h2>
            <p style="font-size: 0.9rem;">Enter your email to receive a password reset verification link.</p>
          </div>

          <form id="forgot-form">
            <div class="form-group">
              <label class="form-label" for="forgot-email">Registered Email Address <span class="required">*</span></label>
              <input type="email" id="forgot-email" class="form-control" placeholder="name@example.com" required>
            </div>

            <button type="submit" id="btn-forgot-submit" class="btn btn-primary w-full" style="padding: 0.9rem; margin-top: 1rem;">
              Send Recovery Link
            </button>
          </form>

          <div class="text-center" style="margin-top: 2rem; font-size: 0.875rem; color: var(--text-secondary);">
            Remember your credentials? 
            <a href="/login" data-link style="color: var(--accent-primary); font-weight: 600;">Back to Sign In</a>
          </div>
        </div>
      </div>
    `;
  }

  static afterRender() {
    const form = document.getElementById('forgot-form');
    const submitBtn = document.getElementById('btn-forgot-submit');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Transmitting...';

        try {
          await AuthService.resetPassword(email);
          UI.showToast('Instructions Sent', `Password reset link dispatched to ${email}`, 'success');
          setTimeout(() => window.appRouter.navigate('/login'), 1500);
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Recovery Link';
        }
      };
    }
  }
}
