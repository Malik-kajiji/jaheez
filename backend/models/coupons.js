const mongoose = require('mongoose');

const schema = mongoose.Schema

const copounSchema = new schema({
    // should be random string with the length of at least two and contains only number and chars from A-Z (the letter can be capital and small)
    couponCode: {
        type:String,
        required: true
    },
    // to detect the discount type, etheir amount which discount in LYD or percentage that discounts in %
    discountype: {
        type: String,
        enum: ['amount', 'percentage'],
        required: true
    },
    // if the type is amount then this field is in LYD and if it is percentage this field would be %
    discountValue: {
        type: Number,
        required: true
    },
    expireType: {
        type: String,
        enum: ['usage', 'date'],
        required: true
    },
    // if the expire type is usage then this field should not be empty
    allowedUsageTimes: {
        type: Number,
    },
    // if the expire type is date then this field should not be empty
    expireDate: {
        type:Date
    },
    state: {
        type: String,
        enum: ['active','paused', 'expired'],
        default: 'active',
        required: true
    },
    usedTimes: {
        type: Number,
        default: 0,
        required: true
    },
    // each time a user use this coupon the discounted value increases
    totalSavedUsingCoupon: {
        type: Number,
        default: 0,
        required: true
    }
},{timestamps:true})


module.exports = mongoose.model('copoun',copounSchema)