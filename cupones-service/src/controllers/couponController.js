const Coupon = require('../models/Coupon');

const couponController = {
  // Create a new coupon
  async createCoupon(req, res) {
    try {
      const { code, discount, valid_from, valid_until, usage_limit } = req.body;
      
      // Validate required fields
      if (!code || !discount) {
        return res.status(400).json({
          error: 'Code and discount are required'
        });
      }
      
      // Validate discount value
      if (discount <= 0) {
        return res.status(400).json({
          error: 'Discount must be greater than 0'
        });
      }
      
      const couponData = {
        code: code.toUpperCase(),
        discount,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        usage_limit: usage_limit || null,
        used_count: 0
      };
      
      const coupon = await Coupon.create(couponData);
      
      res.status(201).json({
        message: 'Coupon created successfully',
        coupon
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Coupon code already exists'
        });
      }
      
      res.status(500).json({
        error: 'Failed to create coupon',
        details: error.message
      });
    }
  },

  // Get all coupons with optional filters
  async getCoupons(req, res) {
    try {
      const { active, limit } = req.query;
      
      const filters = {};
      if (active !== undefined) {
        filters.active = active === 'true';
      }
      if (limit) {
        filters.limit = parseInt(limit);
      }
      
      const coupons = await Coupon.findAll(filters);
      
      res.json({
        coupons,
        count: coupons.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch coupons',
        details: error.message
      });
    }
  },

  // Get coupon by ID
  async getCouponById(req, res) {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);
      
      if (!coupon) {
        return res.status(404).json({
          error: 'Coupon not found'
        });
      }
      
      res.json({ coupon });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch coupon',
        details: error.message
      });
    }
  },

  // Validate coupon by code
  async validateCoupon(req, res) {
    try {
      const { code } = req.params;
      const validation = await Coupon.validateCoupon(code.toUpperCase());
      
      if (!validation.valid) {
        return res.status(400).json({
          valid: false,
          message: validation.message
        });
      }
      
      res.json({
        valid: true,
        coupon: validation.coupon,
        message: 'Coupon is valid'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to validate coupon',
        details: error.message
      });
    }
  },

  // Apply coupon (increment usage)
  async applyCoupon(req, res) {
    try {
      const { code } = req.params;
      
      // First validate the coupon
      const validation = await Coupon.validateCoupon(code.toUpperCase());
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }
      
      // Increment usage count
      const updatedCoupon = await Coupon.incrementUsage(validation.coupon.id);
      
      res.json({
        success: true,
        message: 'Coupon applied successfully',
        coupon: updatedCoupon,
        discount: validation.coupon.discount
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to apply coupon',
        details: error.message
      });
    }
  },

  // Update coupon
  async updateCoupon(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.used_count;
      
      // Convert code to uppercase if provided
      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
      }
      
      const coupon = await Coupon.update(id, updateData);
      
      res.json({
        message: 'Coupon updated successfully',
        coupon
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Coupon code already exists'
        });
      }
      
      res.status(500).json({
        error: 'Failed to update coupon',
        details: error.message
      });
    }
  },

  // Delete coupon
  async deleteCoupon(req, res) {
    try {
      const { id } = req.params;
      
      // Check if coupon exists
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({
          error: 'Coupon not found'
        });
      }
      
      await Coupon.delete(id);
      
      res.json({
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete coupon',
        details: error.message
      });
    }
  },

  // Get coupon statistics
  async getCouponStats(req, res) {
    try {
      const allCoupons = await Coupon.findAll();
      const activeCoupons = await Coupon.findAll({ active: true });
      
      const totalUsage = allCoupons.reduce((sum, coupon) => sum + (coupon.used_count || 0), 0);
      const expiredCoupons = allCoupons.filter(coupon => {
        if (!coupon.valid_until) return false;
        return new Date(coupon.valid_until) < new Date();
      });
      
      res.json({
        stats: {
          total_coupons: allCoupons.length,
          active_coupons: activeCoupons.length,
          expired_coupons: expiredCoupons.length,
          total_usage: totalUsage
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch coupon statistics',
        details: error.message
      });
    }
  }
};

module.exports = couponController;