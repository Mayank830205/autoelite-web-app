/**
 * AUTOELITE — Authentication & Role Authorization System
 * Implements Supabase Auth with secure role checking and demo evaluation support.
 */

import { getSupabase, isConnectedToSupabase, getLocalDb } from './supabase.js';

const AUTH_USER_KEY = 'AUTOELITE_AUTH_USER';
const LOCAL_ACCOUNTS_KEY = 'AUTOELITE_LOCAL_ACCOUNTS';

// Default built-in demonstration accounts
const DEFAULT_ACCOUNTS = [
  {
    id: '00000000-0000-0000-0000-000000000099',
    full_name: 'Showroom Executive Admin',
    email: 'admin@autoelite.luxury',
    phone: '+91 98765 00001',
    password: 'adminPass123!',
    role: 'admin',
    avatar_url: ''
  },
  {
    id: '00000000-0000-0000-0000-000000000098',
    full_name: 'Showroom Admin',
    email: 'admin@autoelite.com',
    phone: '+91 98765 00001',
    password: 'adminPass123!',
    role: 'admin',
    avatar_url: ''
  },
  {
    id: 'demo-user-1',
    full_name: 'Vikramaditya Singhania',
    email: 'vikram.singhania@example.com',
    phone: '+91 98111 22334',
    password: 'demoPass123!',
    role: 'customer',
    avatar_url: ''
  },
  {
    id: 'demo-user-2',
    full_name: 'Aanya Kapoor',
    email: 'aanya.kapoor@example.com',
    phone: '+91 98222 33445',
    password: 'demoPass123!',
    role: 'customer',
    avatar_url: ''
  },
  {
    id: 'demo-user-3',
    full_name: 'Rajesh Malhotra',
    email: 'rajesh.malhotra@example.com',
    phone: '+91 98333 44556',
    password: 'demoPass123!',
    role: 'customer',
    avatar_url: ''
  },
  {
    id: 'demo-user-4',
    full_name: 'Dr. Rohan Mukherjee',
    email: 'dr.rohan@example.com',
    phone: '+91 98444 55667',
    password: 'demoPass123!',
    role: 'customer',
    avatar_url: ''
  },
  {
    id: 'demo-user-5',
    full_name: 'Pooja Nambiar',
    email: 'pooja.nambiar@example.com',
    phone: '+91 98555 66778',
    password: 'demoPass123!',
    role: 'customer',
    avatar_url: ''
  }
];

export class AuthService {
  static currentUser = null;
  static currentRole = 'guest'; // 'guest', 'customer', 'admin'
  static listeners = [];

  static _getLocalAccounts() {
    try {
      const stored = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read stored local accounts:', e);
    }
    try {
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    } catch (e) {}
    return [...DEFAULT_ACCOUNTS];
  }

  static _saveLocalAccounts(accounts) {
    try {
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save local accounts:', e);
    }
  }

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

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isConnectedToSupabase()) {
      const sb = getSupabase();
      const { data, error } = await sb.auth.signUp({
        email: cleanEmail,
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
    const accounts = this._getLocalAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const newUser = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      full_name: fullName,
      email: cleanEmail,
      phone: phone || '',
      password: password,
      role: 'customer',
      avatar_url: '',
      created_at: new Date().toISOString()
    };

    accounts.push(newUser);
    this._saveLocalAccounts(accounts);

    // Also register in in-memory localDb customers
    const db = getLocalDb();
    if (db && Array.isArray(db.customers)) {
      db.customers.push({
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: 'customer',
        created_at: newUser.created_at
      });
    }

    const safeUser = {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      avatar_url: newUser.avatar_url
    };

    this.currentUser = safeUser;
    this.currentRole = 'customer';
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ user: safeUser, role: 'customer' }));
    this._notify();
    return safeUser;
  }

  /**
   * User Login
   */
  static async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isConnectedToSupabase()) {
      const sb = getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid email or password. If you have not created an account yet, please register.');
        }
        throw error;
      }
      if (data.user) {
        await this._loadUserProfile(data.user);
        return { user: this.currentUser, role: this.currentRole };
      }
    }

    // Local / Demo authentication logic
    const accounts = this._getLocalAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    // 1. Account Existence Validation
    if (!account) {
      throw new Error('No account found with this email. Please click "Create Account" below to register.');
    }

    // 2. Password Validation
    if (account.password !== password) {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }

    const safeUser = {
      id: account.id,
      full_name: account.full_name,
      email: account.email,
      phone: account.phone || '',
      avatar_url: account.avatar_url || ''
    };

    this.currentUser = safeUser;
    this.currentRole = account.role;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ user: safeUser, role: account.role }));
    this._notify();
    return { user: safeUser, role: account.role };
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
    const cleanEmail = email.toLowerCase().trim();

    if (isConnectedToSupabase()) {
      const sb = getSupabase();
      const { error } = await sb.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      return true;
    }

    const accounts = this._getLocalAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      throw new Error('No account found with this email address.');
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
