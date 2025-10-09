const express = require('express')
const router = express.Router()
const { 
    getVoucherTypes,
    createVoucherType,
    deleteVoucherType
} = require('../../controllers/adminControllers/voucherTypeController')
const adminMiddleware = require('../../middlewares/adminMiddleware');

// Require authentication for all routes
router.use((req, res, next) => adminMiddleware(req, res, next, 'vouchers'));

// GET all voucher types
router.get('/', getVoucherTypes)

// POST a new voucher type
router.post('/', createVoucherType)

// DELETE a voucher type
router.delete('/:id', deleteVoucherType)

module.exports = router