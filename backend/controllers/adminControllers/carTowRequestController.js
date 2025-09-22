const CarTowRequest = require('../../models/carTowRequest');
const CarTow = require('../../models/carTow');

// Get all car tow drivers with pagination
const getAllDrivers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const skip = (page - 1) * limit;

        const drivers = await CarTow.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await CarTow.countDocuments();
        
        res.status(200).json({
            drivers,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get driver's requests
const getDriverRequests = async (req, res) => {
    try {
        const { driverId } = req.params;
        const requests = await CarTowRequest.find({ driverId })
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all requests with pending count
const getAllRequests = async (req, res) => {
    try {
        const requests = await CarTowRequest.find()
            .sort({ createdAt: -1 });
        
        const pendingCount = await CarTowRequest.countDocuments({ state: 'pending' });
        
        res.status(200).json({
            requests,
            total: pendingCount
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Search drivers by phone number
const searchDrivers = async (req, res) => {
    try {
        const { phoneNumber } = req.query;
        if (!phoneNumber) {
            throw Error('رقم الهاتف مطلوب للبحث');
        }
        const drivers = await CarTow.find({ 
            phoneNumber: { $regex: phoneNumber, $options: 'i' }
        }).sort({ createdAt: -1 });
        res.status(200).json(drivers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Handle request approval
const approveRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await CarTowRequest.approveRequest(requestId);
        res.status(200).json(request);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Handle request rejection
const rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reasonForRejection } = req.body;
        
        if (!reasonForRejection) {
            throw Error('سبب الرفض مطلوب');
        }

        const request = await CarTowRequest.rejectRequest(requestId, reasonForRejection);
        res.status(200).json(request);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Toggle driver ban status
const toggleBan = async (req, res) => {
    try {
        const { driverId } = req.params;
        const driver = await CarTow.findById(driverId);
        
        if (!driver) {
            throw Error('السائق غير موجود');
        }

        driver.isBanned = !driver.isBanned;
        await driver.save();

        res.status(200).json(driver);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update driver warnings
const updateWarnings = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { warnings } = req.body;

        if (warnings < 0) {
            throw Error('عدد التحذيرات يجب أن يكون 0 أو أكثر');
        }

        const driver = await CarTow.findById(driverId);
        
        if (!driver) {
            throw Error('السائق غير موجود');
        }

        driver.warrnings = warnings;
        await driver.save();

        res.status(200).json(driver);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllDrivers,
    getDriverRequests,
    getAllRequests,
    searchDrivers,
    approveRequest,
    rejectRequest,
    toggleBan,
    updateWarnings
};