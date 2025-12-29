const userModel = require('../../models/users')
const JWT = require('jsonwebtoken');
const sendMessage = require('../../functions/sendMessage');

const createToken = (_id, tokenVersion = 0) => {
    return JWT.sign({_id, tokenVersion}, process.env.SECRET, { expiresIn: '365d' });
}

const signup = async (req,res) => {
    const { firstName,lastName,phoneNumber,password,expoToken } = req.body
    try {
        if(firstName === '' || password === '' || phoneNumber === ''){
            res.status(400).json({message:'الرجاء ملئ الحقول'})
        }
        const user = await userModel.signup(`${firstName} ${lastName}`,phoneNumber,password,expoToken)

        // Send OTP message
        const otpMessage = `رمز التحقق الخاص بك في جاهز هو: ${user.otpCode}`;
        await sendMessage(otpMessage, phoneNumber);

        const token = createToken(user._id, user.tokenVersion || 0)
        res.status(200).json({
            username:user.userName,
            phoneNumber:user.phoneNumber,
            numberOfTrips:user.numberOfTrips,
            warrnings:user.warrnings,
            isBanned:user.isBanned,
            isVerified:user.isVerified,
            token
        })
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const login = async (req,res) => {
    const { phoneNumber,password,expoToken } = req.body
    try {
        if(phoneNumber === '' || password === ''){
            res.status(400).json({message:'الرجاء ملئ الحقول'})
        }

        const user = await userModel.login(phoneNumber,password,expoToken)
        const token = createToken(user._id, user.tokenVersion || 0)
        res.status(200).json({
            username:user.userName,
            phoneNumber:user.phoneNumber,
            numberOfTrips:user.numberOfTrips,
            warrnings:user.warrnings,
            isBanned:user.isBanned,
            isVerified:user.isVerified,
            token
        })
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const getData = async (req,res) => {
    const {userName,phoneNumber,numberOfTrips,warrnings,isBanned,isVerified} = req.user

    res.status(200).json({
        userName,
        phoneNumber,
        numberOfTrips,
        warrnings,
        isBanned,
        isVerified
    })
}

const verifyUser = async (req,res) => {
    const { userId } = req.user
    const { OTPCode } = req.body


    try {
        const user = await userModel.verifyUser(userId,OTPCode)
        res.status(200).json({
            username:user.userName,
            phoneNumber:user.phoneNumber,
            numberOfTrips:user.numberOfTrips,
            warrnings:user.warrnings,
            isBanned:user.isBanned,
            isVerified:user.isVerified,
        })
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const sendResetMessage = async (req,res) => {
    const { phoneNumber } = req.body
    try {
        const newOtpCode = await userModel.createOtpResetCode(phoneNumber)
        const otpMessage = `رمز التحقق الخاص بك في جاهز هو: ${newOtpCode}`;
        await sendMessage(otpMessage, phoneNumber);
        res.status(200).json({message:'تم إرسال رمز التحقق إلى رقم هاتفك'});
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const resendMessage = async (req,res) => {
    const { phoneNumber } = req.body
    const resendOtpCode = await userModel.getResetOtpCode(phoneNumber);
    try {
        const otpMessage = `رمز التحقق الخاص بك في جاهز هو: ${resendOtpCode}`;
        await sendMessage(otpMessage, phoneNumber);
        res.status(200).json({message:'تم إعادة إرسال رمز التحقق إلى رقم هاتفك'});
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const checkResetCode = async (req,res) => {
    const { phoneNumber,OTPCode } = req.body
    try {
        const user = await userModel.checkResetCode(phoneNumber,OTPCode);
        res.status(200).json({valid:user});
    }catch(err){
        res.status(400).json({message:err.message});
    }
}


const resetPassword = async (req,res) => {
    const { phoneNumber,resetOtpCode,newPassword } = req.body
    try {
        const user = await userModel.resetPassword(phoneNumber,resetOtpCode,newPassword);
        res.status(200).json({message:'تم تغيير كلمة المرور بنجاح'});
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

module.exports = {
    signup,
    login,
    getData,
    verifyUser,
    sendResetMessage,
    resendMessage,
    checkResetCode,
    resetPassword
}