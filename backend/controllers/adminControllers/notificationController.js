const Notification = require('../../models/notifications');
const User = require('../../models/users');
const CarTow = require('../../models/carTow');
const { sendNotification } = require('../../functions/sendNotification');

// Get all notifications with filters
const getAllNotifications = async (req, res) => {
    try {
        const { notificationType } = req.query;
        
        const query = {};
        
        if (notificationType && notificationType !== 'all') {
            query.notificationType = notificationType;
        }
        
        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        
        res.status(200).json(notifications);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Send notification
const createAndSendNotification = async (req, res) => {
    try {
        const {
            title,
            body,
            notificationType,
            isForOneUser,
            targetPhoneNumber
        } = req.body;
        
        if (!title || !body || !notificationType) {
            throw Error('العنوان والمحتوى ونوع الإشعار مطلوبة');
        }
        
        if (!['for-users', 'for-drivers'].includes(notificationType)) {
            throw Error('نوع إشعار غير صالح');
        }
        
        let expoTokens = [];
        let userName = null;
        let userPhoneNumber = null;
        
        if (isForOneUser) {
            if (!targetPhoneNumber) {
                throw Error('رقم الهاتف مطلوب للإرسال لمستخدم محدد');
            }
            
            // Find specific user or driver
            if (notificationType === 'for-users') {
                const user = await User.findOne({ phoneNumber: targetPhoneNumber });
                if (!user) {
                    throw Error('المستخدم غير موجود');
                }
                if (user.expoToken) {
                    expoTokens.push(user.expoToken);
                }
                userName = user.userName;
                userPhoneNumber = user.phoneNumber;
            } else {
                const driver = await CarTow.findOne({ phoneNumber: targetPhoneNumber });
                if (!driver) {
                    throw Error('السائق غير موجود');
                }
                if (driver.expoToken) {
                    expoTokens.push(driver.expoToken);
                }
                userName = driver.driverName;
                userPhoneNumber = driver.phoneNumber;
            }
        } else {
            // Get all users or drivers with expo tokens
            if (notificationType === 'for-users') {
                const users = await User.find({ expoToken: { $exists: true, $ne: null } });
                expoTokens = users.map(user => user.expoToken).filter(token => token);
            } else {
                const drivers = await CarTow.find({ expoToken: { $exists: true, $ne: null } });
                expoTokens = drivers.map(driver => driver.expoToken).filter(token => token);
            }
        }
        
        // Send notification
        let isSuccessful = false;
        try {
            if (expoTokens.length > 0) {
                await sendNotification(title, body, expoTokens);
                isSuccessful = true;
            } else {
                throw Error('لا توجد رموز إشعارات متاحة');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            isSuccessful = false;
        }
        
        // Save notification record
        const notification = await Notification.create({
            title,
            body,
            notificationType,
            isForOneUser: isForOneUser || false,
            userName,
            userPhoneNumber,
            isSuccessful
        });
        
        res.status(201).json({
            notification,
            sentTo: expoTokens.length,
            isSuccessful
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findByIdAndDelete(id);
        
        if (!notification) {
            throw Error('الإشعار غير موجود');
        }
        
        res.status(200).json({ message: 'تم حذف الإشعار بنجاح' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
    try {
        const total = await Notification.countDocuments();
        const successful = await Notification.countDocuments({ isSuccessful: true });
        const failed = await Notification.countDocuments({ isSuccessful: false });
        const forUsers = await Notification.countDocuments({ notificationType: 'for-users' });
        const forDrivers = await Notification.countDocuments({ notificationType: 'for-drivers' });
        
        res.status(200).json({
            total,
            successful,
            failed,
            forUsers,
            forDrivers
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllNotifications,
    createAndSendNotification,
    deleteNotification,
    getNotificationStats
};