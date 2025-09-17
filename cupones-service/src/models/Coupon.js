const supabase = require('../config/supabase');

class Coupon {
  static async create(couponData) {
    const { data, error } = await supabase
      .from('coupons')
      .insert([couponData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findAll(filters = {}) {
    let query = supabase.from('coupons').select('*');
    
    if (filters.active !== undefined) {
      const now = new Date().toISOString();
      if (filters.active) {
        query = query
          .lte('valid_from', now)
          .gte('valid_until', now);
      }
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query.order('id', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByCode(code) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async incrementUsage(id) {
    // First get the current coupon
    const coupon = await this.findById(id);
    if (!coupon) throw new Error('Coupon not found');
    
    // Increment the usage count
    const { data, error } = await supabase
      .from('coupons')
      .update({ used_count: (coupon.used_count || 0) + 1 })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async validateCoupon(code) {
    const coupon = await this.findByCode(code);
    const now = new Date();
    
    // Check if coupon exists
    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }
    
    // Check if coupon is within valid date range
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, message: 'Coupon not yet active' };
    }
    
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, message: 'Coupon has expired' };
    }
    
    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }
    
    return { valid: true, coupon };
  }
}

module.exports = Coupon;