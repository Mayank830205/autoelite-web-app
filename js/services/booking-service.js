/**
 * AUTOELITE — Booking & Appointment Management Service
 * Primary business workflow for test drives, showroom visits & purchase enquiries.
 */

import { getSupabase, isConnectedToSupabase, getLocalDb } from '../supabase.js';
import { generateBookingRef, generateUUID } from '../utils.js';

export class BookingService {
  /**
   * Creates a new booking reservation
   */
  static async createBooking(bookingData) {
    const reference = generateBookingRef();
    const payload = {
      ...bookingData,
      booking_reference: reference,
      booking_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('bookings').insert([payload]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase createBooking error, using local database:', err);
      }
    }

    const db = getLocalDb();
    const newBooking = {
      ...payload,
      id: generateUUID()
    };
    db.bookings.unshift(newBooking);
    return newBooking;
  }

  /**
   * Fetches customer's own bookings
   */
  static async getMyBookings(userId, userEmail) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        let query = sb.from('bookings').select('*, cars(*)').order('created_at', { ascending: false });
        if (userId) {
          query = query.eq('user_id', userId);
        } else if (userEmail) {
          query = query.eq('customer_email', userEmail);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('Supabase getMyBookings error:', err);
      }
    }

    const db = getLocalDb();
    return db.bookings
      .filter(b => (userId && b.user_id === userId) || (userEmail && b.customer_email === userEmail))
      .map(b => ({
        ...b,
        cars: db.cars.find(c => c.id === b.car_id) || null
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Fetches single booking by ID
   */
  static async getBookingById(id) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('bookings').select('*, cars(*)').eq('id', id).single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase getBookingById error:', err);
      }
    }

    const db = getLocalDb();
    const booking = db.bookings.find(b => b.id === id || b.booking_reference === id);
    if (!booking) return null;
    return {
      ...booking,
      cars: db.cars.find(c => c.id === booking.car_id) || null
    };
  }

  /**
   * Customer cancellation (only eligible when status is 'pending' or 'confirmed')
   */
  static async cancelBooking(id, userId) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('bookings')
          .update({ booking_status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', id)
          .in('booking_status', ['pending', 'confirmed'])
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase cancelBooking error:', err);
      }
    }

    const db = getLocalDb();
    const booking = db.bookings.find(b => b.id === id);
    if (booking && (booking.booking_status === 'pending' || booking.booking_status === 'confirmed')) {
      booking.booking_status = 'cancelled';
      booking.updated_at = new Date().toISOString();
      return booking;
    }
    throw new Error('Booking cannot be cancelled in its current state.');
  }

  /**
   * Admin: Fetch all bookings with filtering & pagination
   */
  static async getAllBookings({
    status = '',
    bookingType = '',
    search = '',
    date = '',
    page = 1,
    pageSize = 15
  } = {}) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        let query = sb.from('bookings').select('*, cars(*)', { count: 'exact' });

        if (status) query = query.eq('booking_status', status);
        if (bookingType) query = query.eq('booking_type', bookingType);
        if (date) query = query.eq('appointment_date', date);
        if (search) {
          query = query.or(`booking_reference.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false });

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0, page, pageSize };
      } catch (err) {
        console.warn('Supabase getAllBookings error:', err);
      }
    }

    const db = getLocalDb();
    let list = [...db.bookings];

    if (status) list = list.filter(b => b.booking_status === status);
    if (bookingType) list = list.filter(b => b.booking_type === bookingType);
    if (date) list = list.filter(b => b.appointment_date === date);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.booking_reference.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_email.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = list.slice(startIndex, startIndex + pageSize).map(b => ({
      ...b,
      cars: db.cars.find(c => c.id === b.car_id) || null
    }));

    return { data: paginated, total, page, pageSize };
  }

  /**
   * Admin: Update booking status with state transition validation
   */
  static async updateBookingStatus(id, newStatus, adminNotes = null) {
    const validTransitions = {
      pending: ['confirmed', 'rejected', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      rejected: [],
      cancelled: []
    };

    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const updatePayload = { booking_status: newStatus, updated_at: new Date().toISOString() };
        if (adminNotes !== null) updatePayload.admin_notes = adminNotes;

        const { data, error } = await sb.from('bookings').update(updatePayload).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateBookingStatus error:', err);
      }
    }

    const db = getLocalDb();
    const booking = db.bookings.find(b => b.id === id);
    if (!booking) throw new Error('Booking not found.');

    const allowed = validTransitions[booking.booking_status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition booking from '${booking.booking_status}' to '${newStatus}'.`);
    }

    booking.booking_status = newStatus;
    if (adminNotes !== null) booking.admin_notes = adminNotes;
    booking.updated_at = new Date().toISOString();
    return booking;
  }

  /**
   * Slot Capacity & Availability Checker
   */
  static async checkSlotAvailability(date, time) {
    const db = getLocalDb();
    const settings = db.showroom_settings;

    // Check closed dates
    if (settings.closed_dates && settings.closed_dates.includes(date)) {
      return { available: false, reason: 'Showroom is closed on this date' };
    }

    // Count existing active bookings in this slot
    const count = db.bookings.filter(b =>
      b.appointment_date === date &&
      b.appointment_time === time &&
      (b.booking_status === 'pending' || b.booking_status === 'confirmed')
    ).length;

    const maxPerSlot = settings.max_bookings_per_slot || 3;
    const available = count < maxPerSlot;

    return {
      available,
      currentCount: count,
      maxPerSlot,
      reason: available ? null : 'All slots full for this time'
    };
  }
}
