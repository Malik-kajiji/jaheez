const express = require('express');
const router = express.Router();
const {
    getSettings,
    updatePriceRanges,
    updateMaxSearchRange,
    updateReferralPrize,
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage
} = require('../../controllers/adminControllers/settingsController');
const requireAuth = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use(requireAuth);

// GET settings
router.get('/', getSettings);

// PATCH update price ranges
router.patch('/price-ranges', updatePriceRanges);

// PATCH update max search range
router.patch('/max-search-range', updateMaxSearchRange);

// PATCH update referral prize
router.patch('/referral-prize', updateReferralPrize);

// Package routes
router.get('/packages', getAllPackages);
router.post('/packages', createPackage);
router.patch('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

module.exports = router;