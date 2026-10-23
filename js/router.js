/**
 * AUTOELITE — Vanilla JavaScript Single Page Application Router
 * Supports History API, parametric routes, query strings, and authorization guards.
 */

import { RouteGuards } from './guards.js';
import { HomeView } from './views/home.js';
import { CarsView } from './views/cars.js';
import { CarDetailsView } from './views/car-details.js';
import { CompareView } from './views/compare.js';
import { LoginView } from './views/login.js';
import { RegisterView } from './views/register.js';
import { ForgotPasswordView } from './views/forgot-password.js';
import { BookingView } from './views/booking.js';
import { MyBookingsView } from './views/my-bookings.js';
import { UserDashboardView } from './views/user-dashboard.js';
import { ProfileView } from './views/profile.js';
import { AdminDashboardView } from './views/admin-dashboard.js';
import { AdminCarsView } from './views/admin-cars.js';
import { AdminCarFormView } from './views/admin-car-form.js';
import { AdminBookingsView } from './views/admin-bookings.js';
import { AdminCustomersView } from './views/admin-customers.js';
import { AdminAnalyticsView } from './views/admin-analytics.js';
import { AdminSalesView } from './views/admin-sales.js';
import { AdminSettingsView } from './views/admin-settings.js';
import { UI } from './ui.js';

export class Router {
  constructor(routes, appContainer) {
    this.routes = routes;
    this.container = appContainer;
    this.currentView = null;
  }

  init() {
    // Intercept internal link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        const url = new URL(link.href);
        // If internal link and not opening in new tab
        if (url.origin === window.location.origin && !link.target && !e.ctrlKey && !e.metaKey) {
          // If pure hash on same page
          if (url.hash && url.pathname === window.location.pathname) {
            const targetEl = document.querySelector(url.hash);
            if (targetEl) {
              e.preventDefault();
              targetEl.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, '', url.pathname + url.search + url.hash);
              return;
            }
          }
          e.preventDefault();
          this.navigate(url.pathname + url.search + url.hash);
        }
      }
    });

    // Browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.resolve(window.location.pathname, this._parseQuery(window.location.search), window.location.hash);
    });

    // Initial resolution
    this.resolve(window.location.pathname, this._parseQuery(window.location.search), window.location.hash);
  }

  navigate(urlPath, pushToHistory = true) {
    const hashSplit = urlPath.split('#');
    const hash = hashSplit.length > 1 ? '#' + hashSplit[1] : '';
    const [path, search] = hashSplit[0].split('?');
    const query = this._parseQuery(search ? '?' + search : '');

    if (pushToHistory) {
      window.history.pushState(null, '', urlPath);
    }

    this.resolve(path, query, hash);
  }

  async resolve(path, query = {}, hash = '') {
    // Clean trailing slashes
    const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');

    let match = null;
    let params = {};

    for (const route of this.routes) {
      const routeRegex = this._pathToRegex(route.path);
      const result = cleanPath.match(routeRegex);
      if (result) {
        match = route;
        const paramNames = this._getParamNames(route.path);
        paramNames.forEach((name, i) => {
          params[name] = result[i + 1];
        });
        break;
      }
    }

    if (!match) {
      match = {
        path: '/404',
        view: {
          render: async () => `
            <div class="container section text-center" style="padding-top: calc(var(--header-height) + 4rem);">
              <h1 style="font-size: 4rem; color: var(--accent-primary);">404</h1>
              <h2 style="margin-bottom: 1rem;">Showroom Destination Not Found</h2>
              <p style="margin-bottom: 2rem;">The vehicle page or route you navigated to does not exist.</p>
              <a href="/" data-link class="btn btn-primary">Return to Showroom</a>
            </div>
          `,
          afterRender: () => {}
        }
      };
    }

    // Evaluate route guard
    const queryString = new URLSearchParams(query).toString();
    const fullPath = cleanPath + (queryString ? '?' + queryString : '');
    const guardResult = RouteGuards.evaluate(match, fullPath);
    if (!guardResult.allowed) {
      if (guardResult.reason) {
        UI.showToast('Notice', guardResult.reason, 'warning');
      }
      this.navigate(guardResult.redirect, true);
      return;
    }

    // Render loading indicator
    this.container.innerHTML = `
      <div style="min-height: 70vh; display: flex; align-items: center; justify-content: center;">
        <div class="spinner"></div>
      </div>
    `;

    try {
      const html = await match.view.render(params, query);
      this.container.innerHTML = html;
      if (hash) {
        setTimeout(() => {
          const anchorEl = document.querySelector(hash);
          if (anchorEl) {
            anchorEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo(0, 0);
          }
        }, 50);
      } else {
        window.scrollTo(0, 0);
      }

      // Trigger afterRender hook
      if (match.view.afterRender) {
        match.view.afterRender(params, query);
      }

      this._updateActiveNavLinks(cleanPath);
      UI.toggleMobileMenu(false);
    } catch (err) {
      console.error('Route rendering error:', err);
      this.container.innerHTML = `
        <div class="container section text-center" style="padding-top: calc(var(--header-height) + 4rem);">
          <h2>Failed to Load View</h2>
          <p style="color: var(--color-error); margin: 1rem 0;">${err.message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  _pathToRegex(path) {
    const pattern = path.replace(/:([^\/]+)/g, '([^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  _getParamNames(path) {
    const matches = path.match(/:([^\/]+)/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  }

  _parseQuery(searchStr) {
    if (!searchStr) return {};
    const params = new URLSearchParams(searchStr);
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  _updateActiveNavLinks(currentPath) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide/show navbar if in admin route
    const header = document.querySelector('.site-header');
    if (header) {
      if (currentPath.startsWith('/admin')) {
        header.style.display = 'none';
      } else {
        header.style.display = 'block';
      }
    }
  }
}

// Router table configuration
export const appRoutes = [
  { path: '/', view: HomeView },
  { path: '/cars', view: CarsView },
  { path: '/car/:id', view: CarDetailsView },
  { path: '/compare', view: CompareView },
  { path: '/login', view: LoginView, guestOnly: true },
  { path: '/register', view: RegisterView, guestOnly: true },
  { path: '/forgot-password', view: ForgotPasswordView, guestOnly: true },
  { path: '/dashboard', view: UserDashboardView, requireAuth: true },
  { path: '/booking', view: BookingView, requireAuth: true },
  { path: '/booking/:carId', view: BookingView, requireAuth: true },
  { path: '/my-bookings', view: MyBookingsView, requireAuth: true },
  { path: '/my-bookings/:bookingId', view: MyBookingsView, requireAuth: true },
  { path: '/profile', view: ProfileView, requireAuth: true },
  { path: '/admin', view: AdminDashboardView, requireAdmin: true },
  { path: '/admin/cars', view: AdminCarsView, requireAdmin: true },
  { path: '/admin/cars/new', view: AdminCarFormView, requireAdmin: true },
  { path: '/admin/cars/edit/:id', view: AdminCarFormView, requireAdmin: true },
  { path: '/admin/bookings', view: AdminBookingsView, requireAdmin: true },
  { path: '/admin/customers', view: AdminCustomersView, requireAdmin: true },
  { path: '/admin/analytics', view: AdminAnalyticsView, requireAdmin: true },
  { path: '/admin/sales', view: AdminSalesView, requireAdmin: true },
  { path: '/admin/settings', view: AdminSettingsView, requireAdmin: true }
];
