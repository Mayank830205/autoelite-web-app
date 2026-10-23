/**
 * AUTOELITE — Login View
 * Supports Customer & Administrator login with quick demonstration shortcuts.
 */

import { AuthService } from '../auth.js';
import { UI } from '../ui.js';

export class LoginView {
  static async render(params, query) {
    const redirectUrl = query?.redirect || '/dashboard';

    return `
      <div class="container section" style="padding-top: calc(var(--header-height) + 3rem); min-height: 85vh; display: flex; align-items: center; justify-content: center;">
        <div class="glass-panel" style="width: 100%; max-width: 480px; padding: 2.5rem; position: relative;">
          <div class="text-center" style="margin-bottom: 2rem;">
            <div class="brand-logo-text" style="font-size: 1.75rem; margin-bottom: 0.5rem;">AUTO<span>ELITE</span></div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Welcome to the Showroom</h2>
            <p style="font-size: 0.9rem;">Sign in to access your appointments and private vehicle portfolio.</p>
          </div>

          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="login-email">Email Address <span class="required">*</span></label>
              <input type="email" id="login-email" class="form-control" placeholder="name@example.com" required autocomplete="email">
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="form-label" for="login-password" style="margin:0;">Password <span class="required">*</span></label>
                <a href="/forgot-password" data-link style="font-size: 0.8125rem; color: var(--accent-primary);">Forgot password?</a>
              </div>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
            </div>

            <button type="submit" id="btn-login-submit" class="btn btn-primary w-full" style="padding: 0.9rem; margin-top: 1rem;">
              Sign In
            </button>
          </form>

          <div style="margin: 1.5rem 0; display: flex; align-items: center; gap: 1rem;">
            <div style="height: 1px; flex-grow: 1; background: var(--border-subtle);"></div>
            <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted);">Quick Evaluation Access</span>
            <div style="height: 1px; flex-grow: 1; background: var(--border-subtle);"></div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <button class="btn btn-secondary btn-sm w-full" id="btn-demo-customer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Quick Demo: Login as Customer
            </button>
            <button class="btn btn-outline-gold btn-sm w-full" id="btn-demo-admin">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Quick Demo: Login as Showroom Administrator
            </button>
          </div>

          <div class="text-center" style="margin-top: 2rem; font-size: 0.875rem; color: var(--text-secondary);">
            Don't have an account yet? 
            <a href="/register${redirectUrl && redirectUrl !== '/dashboard' ? '?redirect=' + encodeURIComponent(redirectUrl) : ''}" data-link style="color: var(--accent-primary); font-weight: 600;">Create Account</a>
          </div>
        </div>
      </div>
    `;
  }

  static afterRender(params, query) {
    const redirectUrl = query?.redirect || '/dashboard';
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('btn-login-submit');

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';

        try {
          const res = await AuthService.login(email, password);
          UI.showToast('Welcome Back', `Signed in as ${res.user.full_name}`, 'success');

          if (res.role === 'admin') {
            window.appRouter.navigate('/admin');
          } else {
            window.appRouter.navigate(redirectUrl.includes('/admin') ? '/dashboard' : redirectUrl);
          }
        } catch (err) {
          UI.showToast('Sign In Failed', err.message, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      };
    }

    const demoCustBtn = document.getElementById('btn-demo-customer');
    if (demoCustBtn) {
      demoCustBtn.onclick = async () => {
        try {
          await AuthService.loginAsDemoCustomer();
          UI.showToast('Demo Customer Access', 'Logged in as Vikramaditya Singhania', 'success');
          window.appRouter.navigate(redirectUrl.includes('/admin') ? '/dashboard' : redirectUrl);
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
        }
      };
    }

    const demoAdminBtn = document.getElementById('btn-demo-admin');
    if (demoAdminBtn) {
      demoAdminBtn.onclick = async () => {
        try {
          await AuthService.loginAsDemoAdmin();
          UI.showToast('Administrator Access', 'Logged in with Executive Showroom Privileges', 'success');
          window.appRouter.navigate('/admin');
        } catch (err) {
          UI.showToast('Error', err.message, 'error');
        }
      };
    }
  }
}
