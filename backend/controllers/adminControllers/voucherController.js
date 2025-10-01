const Voucher = require('../../models/voucher')
const VoucherType = require('../../models/voucherType')

// Generate a unique secret number (13 digits, doesn't start with 0, not repetitive)
const generateSecretNumber = async () => {
    let secretNumber
    let attempts = 0
    const maxAttempts = 1000

    do {
        // Generate a 13-digit number that doesn't start with 0
        secretNumber = Math.floor(Math.random() * 9000000000000) + 1000000000000
        secretNumber = secretNumber.toString()

        // Check if this secret number already exists
        const existing = await Voucher.findOne({ secretNumber })
        if (!existing) {
            return secretNumber
        }

        attempts++
    } while (attempts < maxAttempts)

    throw new Error('فشل في إنشاء رقم سري فريد')
}

// Get all versions for a voucher type
const getVersions = async (req, res) => {
    const { voucherTypeId } = req.params

    try {
        // Verify voucher type exists
        const voucherType = await VoucherType.findById(voucherTypeId)
        if (!voucherType) {
            throw Error('فئة الكرت غير موجودة')
        }

        // Get distinct versions for this voucher type
        const versions = await Voucher.distinct('excelSheetVersion', { value: voucherType.voucherValue })

        // Sort versions in descending order (newest first)
        versions.sort((a, b) => b - a)

        res.status(200).json(versions)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get vouchers for a specific version
const getVouchersByVersion = async (req, res) => {
    const { voucherTypeId, version } = req.params
    const { search } = req.query

    try {
        // Verify voucher type exists
        const voucherType = await VoucherType.findById(voucherTypeId)
        if (!voucherType) {
            throw Error('فئة الكرت غير موجودة')
        }

        // Build query
        const query = {
            value: voucherType.voucherValue,
            excelSheetVersion: parseInt(version)
        }

        // Add search if provided
        if (search) {
            query.$or = [
                { serialNumber: { $regex: search, $options: 'i' } },
                { secretNumber: { $regex: search, $options: 'i' } }
            ]
        }

        // Get all vouchers for this version and value
        const vouchers = await Voucher.find(query).sort({ createdAt: -1 })

        res.status(200).json(vouchers)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Create new vouchers
const createVouchers = async (req, res) => {
    const { voucherTypeId } = req.params
    const { count } = req.body

    try {
        // Validate count
        if (!count || count <= 0 || count > 3000) {
            throw Error('عدد الكروت يجب أن يكون بين 1 و 3000')
        }

        // Verify voucher type exists
        const voucherType = await VoucherType.findById(voucherTypeId)
        if (!voucherType) {
            throw Error('فئة الكرت غير موجودة')
        }

        // Get the next version number
        const lastVersion = await Voucher.findOne({ value: voucherType.voucherValue })
            .sort({ excelSheetVersion: -1 })
            .select('excelSheetVersion')

        const nextVersion = lastVersion ? lastVersion.excelSheetVersion + 1 : 1

        // Generate vouchers
        const vouchers = []
        for (let i = 0; i < count; i++) {
            const secretNumber = await generateSecretNumber()
            const serialNumber = `${voucherType.voucherValue}-${nextVersion}-${String(i + 1).padStart(4, '0')}`

            vouchers.push({
                secretNumber,
                serialNumber,
                value: voucherType.voucherValue,
                excelSheetVersion: nextVersion
            })
        }

        // Save all vouchers
        const createdVouchers = await Voucher.insertMany(vouchers)

        res.status(200).json({
            message: `تم إنشاء ${count} كرت بنجاح`,
            version: nextVersion,
            count: createdVouchers.length
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Download vouchers as CSV
const downloadVouchersCSV = async (req, res) => {
    const { voucherTypeId, version } = req.params

    try {
        // Verify voucher type exists
        const voucherType = await VoucherType.findById(voucherTypeId)
        if (!voucherType) {
            throw Error('فئة الكرت غير موجودة')
        }

        // Get all vouchers for this version
        const vouchers = await Voucher.find({
            value: voucherType.voucherValue,
            excelSheetVersion: parseInt(version)
        }).sort({ serialNumber: 1 })

        // Create CSV content
        let csvContent = 'رقم التسلسلي,الرقم السري,القيمة,الحالة,تاريخ الاستخدام\n'

        vouchers.forEach(voucher => {
            const status = voucher.isUsed ? 'مستخدم' : 'متاح'
            const useDate = voucher.useDate ? new Date(voucher.useDate).toLocaleDateString('ar-LY') : ''
            // Add ="text" format to force Excel to treat it as text
            csvContent += `${voucher.serialNumber},="${voucher.secretNumber}",${voucher.value},${status},${useDate}\n`
        })

        // Set headers for CSV download
        const fileName = encodeURIComponent(`كروت فئة ${voucherType.voucherValue} النسخة رقم ${version}.csv`)

        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`)
        res.send('\uFEFF' + csvContent) // Add BOM for proper Arabic encoding
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getVersions,
    getVouchersByVersion,
    createVouchers,
    downloadVouchersCSV
}