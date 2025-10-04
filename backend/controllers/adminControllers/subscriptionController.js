const Subscription = require('../../models/subscription');

// Get all subscriptions with pagination
const getAllSubscriptions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const skip = (page - 1) * limit;

        const subscriptions = await Subscription.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Subscription.countDocuments();
        
        res.status(200).json({
            subscriptions,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get subscriptions by status
const getSubscriptionsByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const skip = (page - 1) * limit;

        const query = status ? { status } : {};
        
        const subscriptions = await Subscription.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Subscription.countDocuments(query);
        
        res.status(200).json({
            subscriptions,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Search subscriptions by phone number or username
const searchSubscriptions = async (req, res) => {
    try {
        const { search } = req.query;
        
        if (!search || !search.trim()) {
            return getAllSubscriptions(req, res);
        }

        const subscriptions = await Subscription.find({
            $or: [
                { userPhoneNumber: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        
        res.status(200).json({
            subscriptions,
            total: subscriptions.length,
            pages: 1,
            currentPage: 1
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new subscription
const createSubscription = async (req, res) => {
    try {
        const subscriptionData = req.body;
        const subscription = await Subscription.createSubscription(subscriptionData);
        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update subscription status
const updateSubscriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'expired', 'cancelled'].includes(status)) {
            throw Error('حالة غير صالحة');
        }

        const subscription = await Subscription.findById(id);
        
        if (!subscription) {
            throw Error('الاشتراك غير موجود');
        }

        subscription.status = status;
        await subscription.save();

        res.status(200).json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a subscription
const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        
        const subscription = await Subscription.findByIdAndDelete(id);
        
        if (!subscription) {
            throw Error('الاشتراك غير موجود');
        }

        res.status(200).json({ message: 'تم حذف الاشتراك بنجاح' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get subscription statistics
const getSubscriptionStats = async (req, res) => {
    try {
        const total = await Subscription.countDocuments();
        const active = await Subscription.countDocuments({ status: 'active' });
        const expired = await Subscription.countDocuments({ status: 'expired' });
        const cancelled = await Subscription.countDocuments({ status: 'cancelled' });

        res.status(200).json({
            total,
            active,
            expired,
            cancelled
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllSubscriptions,
    getSubscriptionsByStatus,
    searchSubscriptions,
    createSubscription,
    updateSubscriptionStatus,
    deleteSubscription,
    getSubscriptionStats
};