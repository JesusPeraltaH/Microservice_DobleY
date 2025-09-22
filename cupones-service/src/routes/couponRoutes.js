const express = require('express');
const couponController = require('../controllers/couponController');

const router = express.Router();

// Create a new coupon
router.post('/', couponController.createCoupon);

// Get all coupons (with optional filters)
router.get('/', couponController.getCoupons);

// Get coupon statistics
router.get('/stats', couponController.getCouponStats);

// Validate coupon by code
router.get('/validate/:code', couponController.validateCoupon);

// Apply coupon (increment usage)
router.post('/apply/:code', couponController.applyCoupon);

// Get coupon by ID
router.get('/:id', couponController.getCouponById);

// Update coupon
router.put('/:id', couponController.updateCoupon);

// Delete coupon
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;