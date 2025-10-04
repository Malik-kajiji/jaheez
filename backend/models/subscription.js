const mongoose = require('mongoose');

const schema = mongoose.Schema;

const subscriptionSchema = new schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userPhoneNumber: {
        type: String,
        required: true
    },
    packageId: {
        type: String,
        required: true
    },
    packageName: {
        type: String,
        required: true
    },
    packagePrice: {
        type: Number,
        required: true
    },
    packagePeriod: {
        type: Number, // in days
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active',
        required: true
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'voucher'],
        default: 'cash'
    }
}, { timestamps: true });

// Index for faster queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Static method to create a new subscription
subscriptionSchema.statics.createSubscription = async function(subscriptionData) {
    const { userId, userName, userPhoneNumber, packageId, packageName, packagePrice, packagePeriod, startDate } = subscriptionData;
    
    if (!userId || !userName || !userPhoneNumber || !packageId || !packageName || !packagePrice || !packagePeriod) {
        throw Error('جميع الحقول مطلوبة');
    }

    if (packagePrice <= 0) {
        throw Error('سعر الباقة يجب أن يكون أكبر من 0');
    }

    if (packagePeriod <= 0) {
        throw Error('مدة الباقة يجب أن تكون أكبر من 0');
    }

    // Calculate end date
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + packagePeriod);

    const subscription = await this.create({
        userId,
        userName,
        userPhoneNumber,
        packageId,
        packageName,
        packagePrice,
        packagePeriod,
        startDate: start,
        endDate: end,
        ...subscriptionData
    });

    return subscription;
};

// Method to check if subscription is expired
subscriptionSchema.methods.isExpired = function() {
    return new Date() > this.endDate;
};

// Method to get remaining days
subscriptionSchema.methods.getRemainingDays = function() {
    const now = new Date();
    const diff = this.endDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model('subscription', subscriptionSchema);