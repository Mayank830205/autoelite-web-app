/**
 * AUTOELITE — Main Application Entry Point
 * Orchestrates Supabase initialization, authentication listeners, navigation & router.
 */

import { initSupabase } from './supabase.js';
import { AuthService } from './auth.js';
import { Router, appRoutes } from './router.js';
import { UI } from './ui.js';

class App {
  static async init() {
    console.log('🏎️ Initializing AUTOELITE Luxury Showroom Platform...');

    // 1. Initialize Supabase / Database Engine
    await initSupabase();

    // 2. Initialize Authentication & Role State
    await AuthService.init();

    // 3. Navbar scroll & interactions
    UI.initNavbarScroll();
    this.setupNavbarAuthListener();
    this.setupMobileMenu();

    // 4. Handle 404.html redirect parameter if applicable
    if (sessionStorage.redirect) {
      const redirectUrl = sessionStorage.redirect;
      delete sessionStorage.redirect;
      const parsed = new URL(redirectUrl);
      window.history.replaceState(null, '', parsed.pathname + parsed.search);
    }

    // 5. Initialize Router
    const appContainer = document.getElementById('app');
    const router = new Router(appRoutes, appContainer);
    window.appRouter = router;
    router.init();

    console.log('✅ AUTOELITE Platform Ready.');
  }

  static setupNavbarAuthListener() {
    const updateNavbar = (user, role) => {
      const navActions = document.getElementById('nav-auth-actions');
      const mobileNavActions = document.getElementById('mobile-nav-actions');

      let authHtml = '';
      if (user) {
        if (role === 'admin') {
          authHtml = `
            <a href="/admin" data-link class="btn btn-outline-gold btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Admin Portal
            </a>
            <a href="/profile" data-link class="btn btn-secondary btn-sm" title="My Profile">
              <div class="sidebar-avatar" style="width:24px;height:24px;font-size:0.75rem;margin-right:4px;">
                ${(user.full_name || 'A').charAt(0).toUpperCase()}
              </div>
              Profile
            </a>
          `;
        } else {
          authHtml = `
            <a href="/dashboard" data-link class="btn btn-secondary btn-sm">
              Client Portal
            </a>
            <a href="/my-bookings" data-link class="btn btn-outline-gold btn-sm">
              My Bookings
            </a>
            <a href="/profile" data-link class="btn btn-secondary btn-sm" title="Profile">
              👤
            </a>
          `;
        }
      } else {
        authHtml = `
          <a href="/login" data-link class="btn btn-ghost btn-sm">
            Sign In
          </a>
          <a href="/register" data-link class="btn btn-outline-gold btn-sm">
            Register
          </a>
        `;
      }

      if (navActions) navActions.innerHTML = authHtml;
      if (mobileNavActions) mobileNavActions.innerHTML = authHtml;
    };

    AuthService.subscribe(updateNavbar);
    updateNavbar(AuthService.getUser(), AuthService.getRole());
  }

  static setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-drawer-close');
    const backdrop = document.getElementById('mobile-drawer-backdrop');

    if (toggleBtn) toggleBtn.onclick = () => UI.toggleMobileMenu(true);
    if (closeBtn) closeBtn.onclick = () => UI.toggleMobileMenu(false);
    if (backdrop) backdrop.onclick = () => UI.toggleMobileMenu(false);
  }
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
