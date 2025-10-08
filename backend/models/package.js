const mongoose = require('mongoose');

const schema = mongoose.Schema

const packageSchema = new schema({
    name: {
        type:String,
        required: true
    },
    price: {
        type:Number,
        required: true
    },
    durationInDays: {
        type:Number,
        required: true
    },
    isThereDiscount: {
        type:Boolean,
        default: false,
        required: true
    },
    priceAfterDiscount: {
        type:Number,
    },
    packageImage: {
        type:String,
        required: true
    }
})


module.exports = mongoose.model('package',packageSchema)