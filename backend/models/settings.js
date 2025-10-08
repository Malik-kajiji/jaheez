const mongoose = require('mongoose');

const schema = mongoose.Schema;

const priceRangeSchema = new schema({
    fromKm: {
        type: Number,
        required: true
    },
    toKm: {
        type: Number,
        required: true
    },
    startingPrice: {
        type: Number,
        required: true
    },
    pricePerKm: {
        type: Number,
        required: true
    }
}, { _id: false });

const settingsSchema = new schema({
    // Trip price calculation ranges
    priceRanges: {
        type: [priceRangeSchema],
        default: [{
            fromKm: 0,
            toKm: 10,
            startingPrice: 20,
            pricePerKm: 5
        }]
    },
    
    // Maximum search range for drivers
    maxSearchRangeKm: {
        type: Number,
        default: 50,
        required: true
    },
    
    // Referral prize amount
    referralPrize: {
        type: Number,
        default: 10,
        required: true
    },
    
    // Singleton pattern - only one settings document
    singleton: {
        type: Boolean,
        default: true,
        unique: true
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
    const count = await mongoose.model('settings').countDocuments();
    if (count > 0 && this.isNew) {
        throw new Error('Settings document already exists');
    }
    next();
});

module.exports = mongoose.model('settings', settingsSchema);