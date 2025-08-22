const express = require('express')
const router = express.Router()
const adminMiddleware = require('../../middlewares/adminMiddleware')

const {
    createAdmin,
    deleteAdmin,
    editAccess,
    changePassword,
    getAllAdmins,
} = require('../../controllers/ownerControllers/ownerAdminController')

router.use(async (req,res,next)=>{await adminMiddleware(req,res,next,'admins')})
router.post('/create',createAdmin)
router.delete('/delete',deleteAdmin)
router.put('/edit',editAccess)
router.put('/change-password',changePassword)
router.get('/get-all',getAllAdmins)

module.exports = router