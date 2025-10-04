const mongoose = require('mongoose');

const schema = mongoose.Schema

const profitSchema = new schema({
    // to detect the type of the profit if it is a package subscription or wallet charge
    type: {
        type: String,
        enum: ['subscription', 'balance-charge'],
        required: true
    },
    amount: {
        type:Number,
        required: true
    },
    // if the type of the profit is subscription this feild should show the package the user have choosen
    packageName: {
        type: String,
    },
    // if the type of the profit is balance-charge this feild should show the type of the voucher in this format: "فئة 5 دينار"
    voucherType: {
        type: String,
    }
},{timestamps:true})


module.exports = mongoose.model('profit',profitSchema)