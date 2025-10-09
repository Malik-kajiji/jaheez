const express = require('express')
const router = express.Router()
const adminMiddleware = require('../../middlewares/adminMiddleware')

const {
    loginAsAdmin,
    getAdminAccess
} = require('../../controllers/adminControllers/adminController')

router.post('/login',loginAsAdmin)
router.use(async (req,res,next)=>{await adminMiddleware(req,res,next,'home')})
router.get('/get-access',getAdminAccess)

module.exports = router