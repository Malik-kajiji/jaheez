const express = require('express');
const router = express.Router();
const driverMiddleware = require('../../middlewares/driverMiddleware');


const {
    signup,
    login,
    getData,
    verifyDriver,
    submitVerification,
    sendResetMessage,
    resendMessage,
    checkResetCode,
    resetPassword
} = require('../../controllers/driverControlers/driverController');

router.post('/login',login);
router.post('/signup',signup);
router.post('/send-reset-message',sendResetMessage);
router.post('/resend-message',resendMessage);
router.post('/check-reset-code',checkResetCode);
router.post('/reset-password',resetPassword);

router.use(async (req,res,next)=>{await driverMiddleware(req,res,next)})
router.get('/get-data',getData);
router.put('/verify-driver',verifyDriver);
router.post('/submit-verification',submitVerification);

module.exports = router;