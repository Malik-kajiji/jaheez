const express = require('express');
const router = express.Router();
const {
    getAllSubscriptions,
    getSubscriptionsByStatus,
    searchSubscriptions,
    createSubscription,
    updateSubscriptionStatus,
    deleteSubscription,
    getSubscriptionStats
} = require('../../controllers/adminControllers/subscriptionController');
const adminMiddleware = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use((req, res, next) => adminMiddleware(req, res, next, 'subscriptions'));

// GET all subscriptions
router.get('/', getAllSubscriptions);

// GET subscriptions by status
router.get('/status', getSubscriptionsByStatus);

// GET subscription statistics
router.get('/stats', getSubscriptionStats);

// GET search subscriptions
router.get('/search', searchSubscriptions);

// POST create a new subscription
router.post('/', createSubscription);

// PATCH update subscription status
router.patch('/:id/status', updateSubscriptionStatus);

// DELETE a subscription
router.delete('/:id', deleteSubscription);

module.exports = router;