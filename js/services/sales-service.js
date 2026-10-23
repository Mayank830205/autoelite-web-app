/**
 * AUTOELITE — Vehicle Sales & Verified Revenue Service
 * STRICT DEFINITION: Only verified sales in 'vehicle_sales' contribute to actual revenue.
 * Bookings, completed test drives, and enquiries NEVER represent revenue.
 */

import { getSupabase, isConnectedToSupabase, getLocalDb } from '../supabase.js';
import { generateUUID } from '../utils.js';

export class SalesService {
  /**
   * Fetches recorded sales with optional date filtering
   */
  static async getSales(dateRange = 'all') {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        let query = sb.from('vehicle_sales').select('*, cars(*)').order('recorded_at', { ascending: false });

        if (dateRange !== 'all') {
          const now = new Date();
          let startDate = new Date();
          if (dateRange === '7d') startDate.setDate(now.getDate() - 7);
          else if (dateRange === '30d') startDate.setDate(now.getDate() - 30);
          else if (dateRange === '90d') startDate.setDate(now.getDate() - 90);
          else if (dateRange === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          else if (dateRange === 'year') startDate = new Date(now.getFullYear(), 0, 1);

          query = query.gte('recorded_at', startDate.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('Supabase getSales error:', err);
      }
    }

    const db = getLocalDb();
    let list = [...db.vehicle_sales];

    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      if (dateRange === '7d') startDate.setDate(now.getDate() - 7);
      else if (dateRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (dateRange === '90d') startDate.setDate(now.getDate() - 90);
      else if (dateRange === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      else if (dateRange === 'year') startDate = new Date(now.getFullYear(), 0, 1);

      list = list.filter(s => new Date(s.recorded_at) >= startDate);
    }

    return list.map(s => ({
      ...s,
      cars: db.cars.find(c => c.id === s.car_id) || null
    })).sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  }

  /**
   * Records a verified vehicle sale (Admin only)
   */
  static async recordSale({
    car_id,
    customer_name,
    customer_contact,
    sale_amount,
    sale_status = 'completed',
    sales_rep_notes = '',
    booking_id = null
  }) {
    if (!car_id || !sale_amount || !customer_name) {
      throw new Error('Vehicle, customer name, and sale amount are required.');
    }

    const payload = {
      car_id,
      customer_name,
      customer_contact,
      sale_amount: Number(sale_amount),
      sale_status,
      sales_rep_notes,
      booking_id,
      recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('vehicle_sales').insert([payload]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase recordSale error:', err);
      }
    }

    const db = getLocalDb();
    const newSale = {
      ...payload,
      id: generateUUID()
    };
    db.vehicle_sales.unshift(newSale);
    return newSale;
  }

  /**
   * Calculates actual revenue strictly from verified vehicle sales
   */
  static async getRevenueMetrics(dateRange = 'all') {
    const sales = await this.getSales(dateRange);
    
    // Strict revenue: only completed or pending_delivery sales count
    const validSales = sales.filter(s => s.sale_status === 'completed' || s.sale_status === 'pending_delivery');
    const totalActualRevenue = validSales.reduce((acc, s) => acc + Number(s.sale_amount), 0);
    const completedSalesCount = validSales.filter(s => s.sale_status === 'completed').length;
    const pendingDeliveriesCount = validSales.filter(s => s.sale_status === 'pending_delivery').length;

    return {
      totalActualRevenue,
      salesCount: validSales.length,
      completedSalesCount,
      pendingDeliveriesCount
    };
  }
}
