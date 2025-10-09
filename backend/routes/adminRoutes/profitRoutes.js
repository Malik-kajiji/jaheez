const express = require('express');
const router = express.Router();
const {
    getProfits,
    getDailyProfits,
    getDistribution,
    getProfitStats,
    createProfit
} = require('../../controllers/adminControllers/profitController');
const adminMiddleware = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use((req, res, next) => adminMiddleware(req, res, next, 'profits'));

// GET all profits with filters
router.get('/', getProfits);

// GET daily profits aggregated
router.get('/daily', getDailyProfits);

// GET distribution by package or voucher type
router.get('/distribution', getDistribution);

// GET profit statistics
router.get('/stats', getProfitStats);

// POST create a new profit entry
router.post('/', createProfit);

module.exports = router;