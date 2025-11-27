const userModel = require('../../models/users')
const JWT = require('jsonwebtoken');
const sendMessage = require('../../functions/sendMessage');

const createToken =  (_id)=>{
    return JWT.sign({_id},process.env.SECRET,{expiresIn:'365d'})
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

        const token = createToken(user._id)
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
        const token = createToken(user._id)
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

module.exports = {
    signup,
    login,
    getData,
    verifyUser
}