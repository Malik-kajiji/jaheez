const express = require('express');
const { getTrips, getTrip, updateTripState, getAvailableMonths } = require('../../controllers/adminControllers/tripController');
const adminMiddleware = require('../../middlewares/adminMiddleware');

const router = express.Router();

// Protected routes - apply middleware to all routes
router.use((req, res, next) => adminMiddleware(req, res, next, 'trips'));

// Get available months
router.get('/months', getAvailableMonths);

// Get all trips with filtering
router.get('/', getTrips);

// Get single trip
router.get('/:id', getTrip);

// Update trip state
router.patch('/:id/state', updateTripState);

module.exports = router;