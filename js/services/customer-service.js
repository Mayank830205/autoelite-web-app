/**
 * AUTOELITE — Customer Management Service
 */

import { getSupabase, isConnectedToSupabase, getLocalDb } from '../supabase.js';

export class CustomerService {
  /**
   * Fetches customer list with booking counts and registration dates
   */
  static async getCustomers({ search = '', page = 1, pageSize = 15 } = {}) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        let query = sb.from('profiles').select('*, bookings(id, created_at)');
        if (search) {
          query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        
        const mapped = (data || []).map(p => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email || 'customer@autoelite.luxury',
          phone: p.phone,
          created_at: p.created_at,
          total_bookings: p.bookings ? p.bookings.length : 0,
          last_booking_date: p.bookings && p.bookings.length > 0
            ? p.bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].created_at
            : null
        }));

        const total = mapped.length;
        const startIndex = (page - 1) * pageSize;
        return { data: mapped.slice(startIndex, startIndex + pageSize), total, page, pageSize };
      } catch (err) {
        console.warn('Supabase getCustomers error, using local fallback:', err);
      }
    }

    const db = getLocalDb();
    let list = db.customers.map(c => {
      const customerBookings = db.bookings.filter(b => b.user_id === c.id || b.customer_email === c.email);
      const sortedBookings = [...customerBookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return {
        ...c,
        total_bookings: customerBookings.length,
        last_booking_date: sortedBookings.length > 0 ? sortedBookings[0].created_at : null
      };
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.full_name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)));
    }

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    return { data: list.slice(startIndex, startIndex + pageSize), total, page, pageSize };
  }

  /**
   * Updates user profile
   */
  static async updateProfile(id, profileData) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('profiles').update(profileData).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateProfile error:', err);
      }
    }

    const db = getLocalDb();
    const customer = db.customers.find(c => c.id === id);
    if (customer) {
      Object.assign(customer, profileData);
      return customer;
    }
    return null;
  }
}
