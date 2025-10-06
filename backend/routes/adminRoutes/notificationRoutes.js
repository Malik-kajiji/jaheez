const express = require('express');
const router = express.Router();
const {
    getAllNotifications,
    createAndSendNotification,
    deleteNotification,
    getNotificationStats
} = require('../../controllers/adminControllers/notificationController');
const requireAuth = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use(requireAuth);

// GET all notifications with filters
router.get('/', getAllNotifications);

// GET notification statistics
router.get('/stats', getNotificationStats);

// POST create and send a new notification
router.post('/', createAndSendNotification);

// DELETE a notification
router.delete('/:id', deleteNotification);

module.exports = router;