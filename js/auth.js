/**
 * AUTOELITE — Authentication & Role Authorization System
 * Implements Supabase Auth with secure role checking and demo evaluation support.
 */

import { getSupabase, isConnectedToSupabase, getLocalDb } from './supabase.js';

const AUTH_USER_KEY = 'AUTOELITE_AUTH_USER';

export class AuthService {
  static currentUser = null;
  static currentRole = 'guest'; // 'guest', 'customer', 'admin'
  static listeners = [];

  /**
   * Initializes auth state from storage or Supabase session
   */
  static async init() {
    // Check if connected to real Supabase
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data: { session } } = await sb.auth.getSession();
        if (session && session.user) {
          await this._loadUserProfile(session.user);
          this._setupSupabaseListener();
          return this.currentUser;
        }
      } catch (err) {
        console.warn('Supabase auth check error:', err);
      }
    }

    // Check local storage for persistent session
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentUser = parsed.user;
        this.currentRole = parsed.role;
        this._notify();
        return this.currentUser;
      }
    } catch (e) {
      console.warn('Could not read stored auth user:', e);
    }

    this.currentUser = null;
    this.currentRole = 'guest';
    this._notify();
    return null;
  }

  static _setupSupabaseListener() {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        await this._loadUserProfile(session.user);
      } else {
        this.currentUser = null;
        this.currentRole = 'guest';
        localStorage.removeItem(AUTH_USER_KEY);
        this._notify();
      }
    });
  }

  static async _loadUserProfile(user) {
    const sb = getSupabase();
    // Query role from user_roles table
    const { data: roleData } = await sb.from('user_roles').select('role').eq('user_id', user.id).single();
    const role = roleData ? roleData.role : 'customer';

    // Query profile
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();

    this.currentUser = {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
      phone: profile?.phone || user.user_metadata?.phone || '',
      avatar_url: profile?.avatar_url || ''
    };
    this.currentRole = role;

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
      user: this.currentUser,
      role: this.currentRole
    }));

    this._notify();
  }

  /**
   * Customer Registration
   */
  static async register({ fullName, email, phone, password }) {
    if (!fullName || !email || !password) {
      throw new Error('Please fill in all required fields.');
    }

    if (isConnectedToSupabase()) {
      const sb = getSupabase();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || ''
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        await this._loadUserProfile(data.user);
        return this.currentUser;
      }
    }

    // Local / Demo registration
    const newUser = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      full_name: fullName,
      email,
      phone: phone || '',
      avatar_url: ''
    };

    // Save in localDb customers
    const db = getLocalDb();
    db.customers.push({ ...newUser, role: 'customer', created_at: new Date().toISOString() });

    this.currentUser = newUser;
    this.currentRole = 'customer';
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ user: this.currentUser, role: 'customer' }));
    this._notify();
    return this.currentUser;
  }

  /**
   * User Login
   */
  static async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter your email and password.');
    }

    if (isConnectedToSupabase()) {
      const sb = getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        await this._loadUserProfile(data.user);
        return { user: this.currentUser, role: this.currentRole };
      }
    }

    // Local / Demo authentication logic
    // Admin check
    if (email.toLowerCase() === 'admin@autoelite.luxury' || email.toLowerCase() === 'admin@autoelite.com') {
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000099',
        full_name: 'Showroom Executive Admin',
        email: 'admin@autoelite.luxury',
        phone: '+91 98765 00001',
        avatar_url: ''
      };
      this.currentUser = adminUser;
      this.currentRole = 'admin';
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ user: adminUser, role: 'admin' }));
      this._notify();
      return { user: adminUser, role: 'admin' };
    }

    // Customer check
    const db = getLocalDb();
    const existing = db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    const customerUser = existing || {
      id: 'usr-customer-1',
      full_name: email.split('@')[0],
      email: email,
      phone: '+91 98111 22334',
      avatar_url: ''
    };

    this.currentUser = customerUser;
    this.currentRole = 'customer';
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ user: customerUser, role: 'customer' }));
    this._notify();
    return { user: customerUser, role: 'customer' };
  }

  /**
   * Logout
   */
  static async logout() {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        await sb.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }

    this.currentUser = null;
    this.currentRole = 'guest';
    localStorage.removeItem(AUTH_USER_KEY);
    this._notify();
  }

  /**
   * Password Reset
   */
  static async resetPassword(email) {
    if (!email) throw new Error('Please enter your registered email address.');
    if (isConnectedToSupabase()) {
      const sb = getSupabase();
      const { error } = await sb.auth.resetPasswordForEmail(email);
      if (error) throw error;
    }
    return true;
  }

  /**
   * Demo Quick-Login Helpers
   */
  static async loginAsDemoCustomer() {
    return this.login('vikram.singhania@example.com', 'demoPass123!');
  }

  static async loginAsDemoAdmin() {
    return this.login('admin@autoelite.luxury', 'adminPass123!');
  }

  static isAuthenticated() {
    return !!this.currentUser;
  }

  static isAdmin() {
    return this.currentUser && this.currentRole === 'admin';
  }

  static getUser() {
    return this.currentUser;
  }

  static getRole() {
    return this.currentRole;
  }

  static subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  static _notify() {
    this.listeners.forEach(fn => fn(this.currentUser, this.currentRole));
  }
}
