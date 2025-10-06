const express = require('express');
const router = express.Router();
const {
    getAllReports,
    createReport,
    updateReportState,
    deleteReport,
    getReportStats
} = require('../../controllers/adminControllers/reportController');
const requireAuth = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use(requireAuth);

// GET all reports with filters
router.get('/', getAllReports);

// GET report statistics
router.get('/stats', getReportStats);

// POST create a new report
router.post('/', createReport);

// PATCH update report state
router.patch('/:id/state', updateReportState);

// DELETE a report
router.delete('/:id', deleteReport);

module.exports = router;