const express = require('express')
const router = express.Router()
const { 
    getVoucherTypes,
    createVoucherType,
    deleteVoucherType
} = require('../../controllers/adminControllers/voucherTypeController')
const requireAuth = require('../../middlewares/adminMiddleware')

// Require authentication for all routes
router.use(requireAuth)

// GET all voucher types
router.get('/', getVoucherTypes)

// POST a new voucher type
router.post('/', createVoucherType)

// DELETE a voucher type
router.delete('/:id', deleteVoucherType)

module.exports = router