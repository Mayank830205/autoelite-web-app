/**
 * AUTOELITE — Vehicle Inventory Service
 * Interacts with Supabase 'cars' & 'car_images' tables with fallback.
 */

import { getSupabase, isConnectedToSupabase, getLocalDb } from '../supabase.js';
import { generateUUID } from '../utils.js';

export class CarService {
  /**
   * Fetches vehicles with filtering, sorting, and pagination
   */
  static async getCars({
    search = '',
    minPrice = null,
    maxPrice = null,
    fuelType = '',
    transmission = '',
    bodyType = '',
    seatingCapacity = null,
    availability = '',
    sortBy = 'price_asc',
    page = 1,
    pageSize = 12,
    includeArchived = false
  } = {}) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        let query = sb.from('cars').select('*, car_images(*)', { count: 'exact' });

        if (!includeArchived) {
          query = query.eq('is_archived', false);
        }

        if (search) {
          query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
        }

        if (minPrice) query = query.gte('ex_showroom_price', minPrice);
        if (maxPrice) query = query.lte('ex_showroom_price', maxPrice);
        if (fuelType) query = query.eq('fuel_type', fuelType);
        if (transmission) query = query.eq('transmission', transmission);
        if (bodyType) query = query.eq('body_type', bodyType);
        if (seatingCapacity) query = query.eq('seating_capacity', seatingCapacity);
        if (availability) query = query.eq('availability_status', availability);

        // Sorting
        if (sortBy === 'price_asc') query = query.order('ex_showroom_price', { ascending: true });
        else if (sortBy === 'price_desc') query = query.order('ex_showroom_price', { ascending: false });
        else if (sortBy === 'newest') query = query.order('model_year', { ascending: false });
        else if (sortBy === 'brand_asc') query = query.order('brand', { ascending: true });
        else query = query.order('created_at', { ascending: false });

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0, page, pageSize };
      } catch (err) {
        console.warn('Supabase getCars error, using local data:', err);
      }
    }

    // Local in-memory filtering
    const db = getLocalDb();
    let list = db.cars.filter(car => includeArchived ? true : !car.is_archived);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q));
    }
    if (minPrice) list = list.filter(c => c.ex_showroom_price >= minPrice);
    if (maxPrice) list = list.filter(c => c.ex_showroom_price <= maxPrice);
    if (fuelType) list = list.filter(c => c.fuel_type === fuelType);
    if (transmission) list = list.filter(c => c.transmission === transmission);
    if (bodyType) list = list.filter(c => c.body_type === bodyType);
    if (seatingCapacity) list = list.filter(c => c.seating_capacity === Number(seatingCapacity));
    if (availability) list = list.filter(c => c.availability_status === availability);

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'price_asc') return a.ex_showroom_price - b.ex_showroom_price;
      if (sortBy === 'price_desc') return b.ex_showroom_price - a.ex_showroom_price;
      if (sortBy === 'newest') return b.model_year - a.model_year;
      if (sortBy === 'brand_asc') return a.brand.localeCompare(b.brand);
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = list.slice(startIndex, startIndex + pageSize);

    // Attach images
    const enriched = paginated.map(car => ({
      ...car,
      car_images: db.car_images.filter(img => img.car_id === car.id)
    }));

    return { data: enriched, total, page, pageSize };
  }

  /**
   * Fetches featured vehicles for homepage
   */
  static async getFeaturedCars() {
    const res = await this.getCars({ pageSize: 6 });
    return res.data.filter(c => c.is_featured);
  }

  /**
   * Fetches a single vehicle by ID with full gallery & angles
   */
  static async getCarById(id) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('cars').select('*, car_images(*)').eq('id', id).single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase getCarById error:', err);
      }
    }

    const db = getLocalDb();
    const car = db.cars.find(c => c.id === id);
    if (!car) return null;
    return {
      ...car,
      car_images: db.car_images.filter(img => img.car_id === car.id)
    };
  }

  /**
   * Admin: Create new car
   */
  static async createCar(carData) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('cars').insert([carData]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase createCar error:', err);
      }
    }

    const db = getLocalDb();
    const newCar = {
      ...carData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.cars.unshift(newCar);
    return newCar;
  }

  /**
   * Admin: Update car
   */
  static async updateCar(id, carData) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('cars').update(carData).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateCar error:', err);
      }
    }

    const db = getLocalDb();
    const idx = db.cars.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.cars[idx] = { ...db.cars[idx], ...carData, updated_at: new Date().toISOString() };
      return db.cars[idx];
    }
    return null;
  }

  /**
   * Admin: Archive car (preserves booking history)
   */
  static async archiveCar(id) {
    return this.updateCar(id, { is_archived: true, availability_status: 'sold_out' });
  }

  /**
   * Admin: Save image for a car
   */
  static async addCarImage(carId, imageUrl, angleLabel = 'front', displayOrder = 0) {
    if (isConnectedToSupabase()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from('car_images').insert([{
          car_id: carId,
          image_url: imageUrl,
          angle_label: angleLabel,
          display_order: displayOrder
        }]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase addCarImage error:', err);
      }
    }

    const db = getLocalDb();
    const newImg = {
      id: generateUUID(),
      car_id: carId,
      image_url: imageUrl,
      angle_label: angleLabel,
      display_order: displayOrder
    };
    db.car_images.push(newImg);
    return newImg;
  }
}
