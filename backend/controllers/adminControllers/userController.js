const User = require('../../models/users');
const bcrypt = require('bcrypt');

// Get all users with pagination
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await User.countDocuments();
        
        res.status(200).json({
            users,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Search users by phone number
const searchUsers = async (req, res) => {
    try {
        const { phoneNumber } = req.query;
        
        // If no phone number provided, return all users with pagination
        if (!phoneNumber || !phoneNumber.trim()) {
            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const skip = (page - 1) * limit;

            const users = await User.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            
            const total = await User.countDocuments();
            
            return res.status(200).json({
                users,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            });
        }

        // Search by phone number
        const users = await User.find({ 
            phoneNumber: { $regex: phoneNumber, $options: 'i' }
        }).sort({ createdAt: -1 });
        
        res.status(200).json({
            users,
            total: users.length,
            pages: 1,
            currentPage: 1
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Toggle user ban status
const toggleBan = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            throw Error('المستخدم غير موجود');
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({
            isBanned: user.isBanned
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update user warnings
const updateWarnings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { warnings } = req.body;

        if (warnings < 0) {
            throw Error('عدد التحذيرات يجب أن يكون 0 أو أكثر');
        }

        const user = await User.findById(userId);
        
        if (!user) {
            throw Error('المستخدم غير موجود');
        }

        user.warrnings = warnings;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    searchUsers,
    toggleBan,
    updateWarnings
};