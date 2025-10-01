const VoucherType = require('../../models/voucherType')
const Voucher = require('../../models/voucher')

// Get all voucher types with available voucher counts
const getVoucherTypes = async (req, res) => {
    try {
        const voucherTypes = await VoucherType.find({}).sort({ voucherValue: 1 })
        
        // Get available voucher counts for each type
        const typesWithCounts = await Promise.all(voucherTypes.map(async (type) => {
            const availableCount = await Voucher.countDocuments({
                value: type.voucherValue,
                isUsed: false
            })
            
            return {
                ...type.toObject(),
                availableCount
            }
        }))
        
        res.status(200).json(typesWithCounts)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Create a new voucher type
const createVoucherType = async (req, res) => {
    const { voucherValue } = req.body

    try {
        if (!voucherValue) {
            throw Error('قيمة الكرت مطلوبة')
        }

        if (voucherValue <= 0) {
            throw Error('قيمة الكرت يجب أن تكون أكبر من 0')
        }

        const voucherType = await VoucherType.createNewVoucherType(voucherValue)
        res.status(200).json(voucherType)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Delete a voucher type
const deleteVoucherType = async (req, res) => {
    const { id } = req.params

    try {
        const voucherType = await VoucherType.findOneAndDelete({ _id: id })
        
        if (!voucherType) {
            throw Error('فئة الكرت غير موجودة')
        }

        res.status(200).json(voucherType)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getVoucherTypes,
    createVoucherType,
    deleteVoucherType
}