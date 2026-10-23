/**
 * AUTOELITE — Shared Administrator Layout Shell
 */

import { AuthService } from '../auth.js';

export function renderAdminLayout(activeRoute, pageTitle, contentHtml) {
  const user = AuthService.getUser();

  return `
    <div class="dashboard-layout animate-fade-in">
      <!-- ADMIN SIDEBAR -->
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="sidebar-header">
          <a href="/admin" data-link class="sidebar-brand-text">
            AUTO<span>ELITE</span>
          </a>
          <button class="sidebar-collapse-toggle" id="sidebar-toggle-btn" title="Toggle Sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-title">Core Operations</div>
          
          <a href="/admin" data-link class="sidebar-link ${activeRoute === 'overview' ? 'active' : ''}">
            <span class="sidebar-link-icon">📊</span>
            <span class="sidebar-link-text">Executive Overview</span>
          </a>

          <a href="/admin/bookings" data-link class="sidebar-link ${activeRoute === 'bookings' ? 'active' : ''}">
            <span class="sidebar-link-icon">📅</span>
            <span class="sidebar-link-text">Bookings & Test Drives</span>
          </a>

          <a href="/admin/cars" data-link class="sidebar-link ${activeRoute === 'cars' ? 'active' : ''}">
            <span class="sidebar-link-icon">🏎️</span>
            <span class="sidebar-link-text">Vehicle Inventory</span>
          </a>

          <a href="/admin/customers" data-link class="sidebar-link ${activeRoute === 'customers' ? 'active' : ''}">
            <span class="sidebar-link-icon">👥</span>
            <span class="sidebar-link-text">Client Registry</span>
          </a>

          <div class="sidebar-section-title">Commercial & BI</div>

          <a href="/admin/sales" data-link class="sidebar-link ${activeRoute === 'sales' ? 'active' : ''}">
            <span class="sidebar-link-icon">💰</span>
            <span class="sidebar-link-text">Recorded Sales & Revenue</span>
          </a>

          <a href="/admin/analytics" data-link class="sidebar-link ${activeRoute === 'analytics' ? 'active' : ''}">
            <span class="sidebar-link-icon">📈</span>
            <span class="sidebar-link-text">Business Analytics</span>
          </a>

          <div class="sidebar-section-title">Configuration</div>

          <a href="/admin/settings" data-link class="sidebar-link ${activeRoute === 'settings' ? 'active' : ''}">
            <span class="sidebar-link-icon">⚙️</span>
            <span class="sidebar-link-text">Showroom Schedule</span>
          </a>

          <a href="/" data-link class="sidebar-link" style="margin-top:auto;">
            <span class="sidebar-link-icon">🌐</span>
            <span class="sidebar-link-text">View Public Showroom</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user-pill">
            <div class="sidebar-avatar">
              ${(user?.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div class="sidebar-user-info" style="flex-grow:1;min-width:0;">
              <div class="sidebar-user-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${user?.full_name || 'Administrator'}
              </div>
              <div class="sidebar-user-role">Executive Admin</div>
            </div>
            <button class="btn-icon-sm" id="btn-admin-logout" title="Sign Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="dashboard-main">
        <div class="dashboard-topbar">
          <div class="dashboard-title-wrap">
            <h1>${pageTitle}</h1>
            <p style="color:var(--text-muted);font-size:0.9rem;">AUTOELITE Executive Management Portal · Real-time Showroom Data</p>
          </div>

          <div style="display:flex;align-items:center;gap:1rem;">
            <button class="btn btn-secondary btn-sm" onclick="UI.openSupabaseConnectModal()">
              <span class="badge-dot" style="background:#34D399;"></span>
              Database Connection
            </button>
          </div>
        </div>

        ${contentHtml}
      </main>
    </div>
  `;
}

export function initAdminLayoutListeners() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.onclick = () => {
      sidebar.classList.toggle('collapsed');
    };
  }

  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await AuthService.logout();
      window.appRouter.navigate('/');
    };
  }
}
