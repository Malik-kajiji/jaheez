const mongoose = require('mongoose');

const schema = mongoose.Schema

const voucherTypeSchema = new schema({
    voucherValue: {
        type:Number,
        required:true,
        unique:true
    },
})

voucherTypeSchema.statics.createNewVoucherType = async function(voucherValue) {
    const exists = await this.findOne({voucherValue})
    if(exists){
        throw Error('الفئة موجودة بالفعل')
    }

    const voucherType = await this.create({
        voucherValue
    })
    return voucherType
}

module.exports = mongoose.model('voucherType',voucherTypeSchema)