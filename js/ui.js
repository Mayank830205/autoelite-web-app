/**
 * AUTOELITE — Global UI Helpers, Toasts, Modals & Navigation
 */

import { ConfigManager } from './config.js';
import { initSupabase } from './supabase.js';

export class UI {
  /**
   * Displays an elegant toast notification
   */
  static showToast(title, message = '', type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="modal-close" style="font-size:1.1rem;margin-left:auto;">&times;</button>
    `;

    toast.querySelector('.modal-close').addEventListener('click', () => {
      this._removeToast(toast);
    });

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        this._removeToast(toast);
      }, duration);
    }
  }

  static _removeToast(toast) {
    if (!toast || toast.classList.contains('toast-hiding')) return;
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }

  /**
   * Opens dynamic modal
   */
  static openModal({ title, body, footer = null, maxWidth = '560px' }) {
    let backdrop = document.getElementById('global-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'global-modal-backdrop';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="modal-container" style="max-width: ${maxWidth}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-x">&times;</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
    });

    const closeBtn = backdrop.querySelector('#modal-close-x');
    if (closeBtn) closeBtn.onclick = () => this.closeModal();

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.closeModal();
    };

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        window.removeEventListener('keydown', escHandler);
      }
    };
    window.addEventListener('keydown', escHandler);
  }

  static closeModal() {
    const backdrop = document.getElementById('global-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('is-open');
    }
  }

  /**
   * Opens Supabase Settings / Connection Modal
   */
  static openSupabaseConnectModal() {
    const config = ConfigManager.getConfig();
    const bodyHtml = `
      <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.25rem;">
        Connect your Supabase project to execute real database operations and Row Level Security policies.
      </p>
      <div class="form-group">
        <label class="form-label">Supabase Project URL <span class="required">*</span></label>
        <input type="url" id="cfg-supabase-url" class="form-control" placeholder="https://xyzcompany.supabase.co" value="${config.supabaseUrl}">
      </div>
      <div class="form-group">
        <label class="form-label">Supabase Anon / Public Key <span class="required">*</span></label>
        <textarea id="cfg-supabase-key" class="form-control" style="min-height:75px;" placeholder="eyJhbGciOi...">${config.supabaseAnonKey}</textarea>
        <div class="input-feedback" style="color:var(--text-muted);">Never paste your service_role secret key in browser applications.</div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-ghost" id="cfg-btn-demo">Reset to Demo Engine</button>
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="cfg-btn-save">Save & Connect</button>
    `;

    this.openModal({
      title: 'Database & Supabase Configuration',
      body: bodyHtml,
      footer: footerHtml,
      maxWidth: '540px'
    });

    document.getElementById('cfg-btn-save').onclick = async () => {
      const url = document.getElementById('cfg-supabase-url').value;
      const key = document.getElementById('cfg-supabase-key').value;
      try {
        ConfigManager.saveConfig(url, key);
        this.closeModal();
        this.showToast('Configuration Saved', 'Testing connection to Supabase...', 'info');
        await initSupabase();
        setTimeout(() => location.reload(), 600);
      } catch (err) {
        this.showToast('Validation Error', err.message, 'error');
      }
    };

    document.getElementById('cfg-btn-demo').onclick = () => {
      ConfigManager.resetToDemo();
      this.closeModal();
      this.showToast('Demo Database Active', 'Loaded built-in AUTOELITE showcase dataset.', 'success');
      setTimeout(() => location.reload(), 500);
    };
  }

  /**
   * Toggles mobile navigation drawer
   */
  static toggleMobileMenu(forceState) {
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const isOpen = typeof forceState === 'boolean' ? forceState : !drawer.classList.contains('is-open');
    if (isOpen) {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Initializes navbar scroll listener
   */
  static initNavbarScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
}

window.UI = UI;
