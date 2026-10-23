/**
 * AUTOELITE — Configuration & Supabase Connection Settings
 */

const STORAGE_KEY = 'AUTOELITE_SUPABASE_CONFIG';

// Default / fallback configuration
// Users can provide their Supabase credentials via:
// 1. window.__AUTOELITE_CONFIG__ injected at runtime
// 2. localStorage saved via the in-app "Connect Supabase" modal
// 3. Or use the built-in live demonstration data engine
const DEFAULT_CONFIG = {
  supabaseUrl: 'https://demo-autoelite.supabase.co',
  supabaseAnonKey: 'demo-anon-key-autoelite-luxury-showroom',
  isDemoMode: true
};

export class ConfigManager {
  static getConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
          return {
            ...parsed,
            isDemoMode: parsed.supabaseUrl.includes('demo-autoelite')
          };
        }
      }
    } catch (e) {
      console.warn('Could not read stored Supabase config:', e);
    }

    if (window.__AUTOELITE_CONFIG__ && window.__AUTOELITE_CONFIG__.supabaseUrl) {
      return {
        ...window.__AUTOELITE_CONFIG__,
        isDemoMode: false
      };
    }

    return DEFAULT_CONFIG;
  }

  static saveConfig(supabaseUrl, supabaseAnonKey) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Both Supabase URL and Anon Key are required.');
    }
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const cleanKey = supabaseAnonKey.trim();
    const config = {
      supabaseUrl: cleanUrl,
      supabaseAnonKey: cleanKey,
      isDemoMode: cleanUrl.includes('demo-autoelite')
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return config;
  }

  static resetToDemo() {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_CONFIG;
  }
}
