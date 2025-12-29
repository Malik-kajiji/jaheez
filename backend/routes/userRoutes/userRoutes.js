const express = require('express')
const router = express.Router()
const userMiddleware = require('../../middlewares/userMiddleware')

const {
    signup,
    login,
    getData,
    verifyUser,
    sendResetMessage,
    resendMessage,
    checkResetCode,
    resetPassword
} = require('../../controllers/userControllers/userController')

router.post('/login',login)
router.post('/signup',signup)
router.post('/send-reset-message',sendResetMessage)
router.post('/resend-message',resendMessage)
router.post('/check-reset-code',checkResetCode)
router.post('/reset-password',resetPassword)

router.use(async (req,res,next)=>{await userMiddleware(req,res,next)})
router.get('/get-data',getData)
router.put('/verify-user',verifyUser)

module.exports = router