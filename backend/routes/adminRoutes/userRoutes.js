const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middlewares/adminMiddleware');

const {
    getAllUsers,
    searchUsers,
    toggleBan,
    updateWarnings
} = require('../../controllers/adminControllers/userController');

// Middleware to verify admin authentication for protected routes
router.use(async (req, res, next) => {
    await adminMiddleware(req, res, next, 'users')
});

// Get all users with pagination
router.get('/users', getAllUsers);

// Search users by phone number
router.get('/search-users', searchUsers);

// Toggle user ban status
router.patch('/users/:userId/toggle-ban', toggleBan);

// Update user warnings
router.patch('/users/:userId/warnings', updateWarnings);

module.exports = router;