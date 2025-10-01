const mongoose = require('mongoose');

const schema = mongoose.Schema

const voucherSchema = new schema({
    secretNumber: {
        type:String,
        required:true,
    },
    serialNumber: {
        type:String,
        required:true,
    },
    value: {
        type:Number,
        required:true,
    },
    excelSheetVersion: {
        type:Number,
        required:true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    useDate: {
        type: Date,
        default: null
    }
}, {timestamps: true})

// Add index for search performance
voucherSchema.index({ serialNumber: 1, secretNumber: 1 })

// Update isUsed and set useDate
voucherSchema.methods.markAsUsed = function() {
    this.isUsed = true
    this.useDate = new Date()
    return this.save()
}

module.exports = mongoose.model('voucher',voucherSchema)