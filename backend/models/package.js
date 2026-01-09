const mongoose = require('mongoose');

const schema = mongoose.Schema

const packageSchema = new schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    durationInDays: {
        type: Number,
        required: true
    },
    description: {
        type: [String],
        default: []
    },
    badgeLabel: {
        type: String,
    },
    statusText: {
        type: String,
        default: 'متاح'
    },
    statusTone: {
        type: String,
        default: 'info'
    },
    ctaText: {
        type: String,
        default: 'اشتراك الان'
    },
    isThereDiscount: {
        type: Boolean,
        default: false,
        required: true
    },
    priceAfterDiscount: {
        type: Number,
    },
    packageImage: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
})


module.exports = mongoose.model('package', packageSchema)