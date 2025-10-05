const express = require('express');
const router = express.Router();
const {
    getAllCoupons,
    createCoupon,
    updateCouponState,
    deleteCoupon,
    getCouponStats
} = require('../../controllers/adminControllers/couponController');
const requireAuth = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use(requireAuth);

// GET all coupons with sorting
router.get('/', getAllCoupons);

// GET coupon statistics
router.get('/stats', getCouponStats);

// POST create a new coupon
router.post('/', createCoupon);

// PATCH update coupon state
router.patch('/:id/state', updateCouponState);

// DELETE a coupon
router.delete('/:id', deleteCoupon);

module.exports = router;