const express = require('express')
const router = express.Router()
const {
    getVersions,
    getVouchersByVersion,
    createVouchers,
    downloadVouchersCSV
} = require('../../controllers/adminControllers/voucherController')
const adminMiddleware = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use((req, res, next) => adminMiddleware(req, res, next, 'vouchers'));

// GET all versions for a voucher type
router.get('/:voucherTypeId/versions', getVersions)

// POST create new vouchers for a voucher type
router.post('/:voucherTypeId/vouchers', createVouchers)

// GET vouchers for a specific version
router.get('/:voucherTypeId/versions/:version/vouchers', getVouchersByVersion)

// GET download vouchers as CSV
router.get('/:voucherTypeId/versions/:version/download', downloadVouchersCSV)

module.exports = router