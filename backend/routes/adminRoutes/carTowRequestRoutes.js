const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');

const {
    getAllDrivers,
    getDriverRequests,
    getAllRequests,
    searchDrivers,
    approveRequest,
    rejectRequest,
    generateTestData,
    toggleBan,
    updateWarnings
} = require('../../controllers/adminControllers/carTowRequestController');

// Generate test data (no auth required)
router.get('/generate-test-data', generateTestData);

// Middleware to verify admin authentication for protected routes
router.use(async (req, res, next) => {
    await adminMiddleware(req, res, next, 'car-tows')
});

// Get all car tow drivers with pagination
router.get('/drivers', getAllDrivers);

// Get all requests with count
router.get('/all-requests', getAllRequests);

// Get driver's requests
router.get('/driver-requests/:driverId', getDriverRequests);

// Search drivers by phone number
router.get('/search-drivers', searchDrivers);

// Approve a request
router.patch('/approve/:requestId', approveRequest);

// Reject a request
router.patch('/reject/:requestId', rejectRequest);

// Toggle driver ban status
router.patch('/toggle-ban/:driverId', toggleBan);

// Update driver warnings
router.patch('/update-warnings/:driverId', updateWarnings);

module.exports = router;