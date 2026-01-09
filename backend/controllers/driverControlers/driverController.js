const driverModel = require('../../models/carTow');
const carTowRequestModel = require('../../models/carTowRequest');
const JWT = require('jsonwebtoken');
const sendMessage = require('../../functions/sendMessage');
const base64ToAWS = require('../../functions/base64toAWS');

const createToken = (_id, tokenVersion = 0) => {
    return JWT.sign({_id, tokenVersion}, process.env.SECRET, { expiresIn: '365d' });
}

const signup = async (req,res) => {
    const { driverName, phoneNumber, password,expoToken } = req.body
    try {
        if(driverName === '' || password === '' || phoneNumber === ''){
            res.status(400).json({message:'الرجاء ملئ الحقول'})
        }
        const driver = await driverModel.signup(driverName, phoneNumber, password, expoToken);
        // Send OTP message
        const otpMessage = `رمز التحقق الخاص بك في جاهز هو: ${driver.otpCode}`;
        await sendMessage(otpMessage, phoneNumber);

        const token = createToken(driver._id, driver.tokenVersion || 0)
        res.status(200).json({
            driverName:driver.driverName,
            phoneNumber:driver.phoneNumber,
            state:driver.state,
            carPlate:driver.carPlate,
            carImage:driver.carImage,
            ratings:driver.ratings,
            vechicleType:driver.vechicleType,
            vechicleModel:driver.vechicleModel,
            warrnings:driver.warrnings,
            isBanned:driver.isBanned,
            numberOfTrips:driver.numberOfTrips,
            balance: driver.balance,
            isVerified:driver.isVerified,
            verificationStatus:driver.verificationStatus,
            verificationReason:driver.verificationReason,
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

        const driver = await driverModel.login(phoneNumber,password,expoToken)
        const token = createToken(driver._id, driver.tokenVersion || 0)
        
        res.status(200).json({
            driverName:driver.driverName,
            phoneNumber:driver.phoneNumber,
            state:driver.state,
            carPlate:driver.carPlate,
            carImage:driver.carImage,
            ratings:driver.ratings,
            vechicleType:driver.vechicleType,
            vechicleModel:driver.vechicleModel,
            warrnings:driver.warrnings,
            isBanned:driver.isBanned,
            numberOfTrips:driver.numberOfTrips,
            balance: driver.balance,
            isVerified:driver.isVerified,
            verificationStatus:driver.verificationStatus,
            verificationReason:driver.verificationReason,
            token
        })
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const getData = async (req,res) => {
    const {driverName,phoneNumber,state,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,balance,warrnings,isBanned,isVerified,verificationStatus,verificationReason} = req.driver


    res.status(200).json({
        driverName,
        phoneNumber,
        state,
        carPlate,
        carImage,
        ratings,
        vechicleType,
        vechicleModel,
        numberOfTrips,
        balance,
        warrnings,
        isBanned,
        isVerified,
        verificationStatus,
        verificationReason,
    })
}

const verifyDriver = async (req,res) => {
    const { driverId } = req.driver
    const { OTPCode } = req.body

    try {
        const driver = await driverModel.verifyDriver(driverId,OTPCode)
        res.status(200).json({
            driverName:driver.driverName,
            phoneNumber:driver.phoneNumber,
            state:driver.state,
            carPlate:driver.carPlate,
            carImage:driver.carImage,
            ratings:driver.ratings,
            vechicleType:driver.vechicleType,
            vechicleModel:driver.vechicleModel,
            warrnings:driver.warrnings,
            isBanned:driver.isBanned,
            numberOfTrips:driver.numberOfTrips,
            balance: driver.balance,
            isVerified:driver.isVerified,
            verificationStatus:driver.verificationStatus,
            verificationReason:driver.verificationReason
        })
    }catch(err){
        res.status(400).json({message:err.message});
    }
}   

const submitVerification = async (req,res) => {
    const { driverId, driverName, phoneNumber } = req.driver;
    const { carPlate, carImage, vechicleType, vechicleModel } = req.body;

    try {
        if(!carPlate || !carImage || !vechicleType || !vechicleModel){
            throw Error('الرجاء تعبئة جميع الحقول وإرفاق صورة المركبة');
        }

        const uploadedCarImage = await base64ToAWS(carImage);

        const updatedDriver = await driverModel.findByIdAndUpdate(
            driverId,
            {
                carPlate,
                carImage: uploadedCarImage,
                vechicleType,
                vechicleModel,
                verificationStatus: 'pending',
                verificationReason: ''
            },
            { new: true }
        );

        if(!updatedDriver){
            throw Error('السائق غير موجود');
        }

        await carTowRequestModel.findOneAndUpdate(
            { driverId },
            {
                driverId,
                driverName: driverName || updatedDriver.driverName,
                phoneNumber: phoneNumber || updatedDriver.phoneNumber,
                carPlate,
                carImage: uploadedCarImage,
                vechicleType,
                vechicleModel,
                state: 'pending',
                reasonForRejection: ''
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            message: 'تم إرسال طلب التوثيق بنجاح',
            driver: {
                driverName: updatedDriver.driverName,
                phoneNumber: updatedDriver.phoneNumber,
                state: updatedDriver.state,
                carPlate: updatedDriver.carPlate,
                carImage: updatedDriver.carImage,
                ratings: updatedDriver.ratings,
                vechicleType: updatedDriver.vechicleType,
                vechicleModel: updatedDriver.vechicleModel,
                warrnings: updatedDriver.warrnings,
                isBanned: updatedDriver.isBanned,
                numberOfTrips: updatedDriver.numberOfTrips,
                balance: updatedDriver.balance,
                isVerified: updatedDriver.isVerified,
                verificationStatus: updatedDriver.verificationStatus,
                verificationReason: updatedDriver.verificationReason
            }
        });
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}

const sendResetMessage = async (req,res) => {
    const { phoneNumber } = req.body
    try {
        const newOtpCode = await driverModel.createOtpResetCode(phoneNumber)
        const otpMessage = `رمز التحقق الخاص بك في جاهز هو: ${newOtpCode}`;
        await sendMessage(otpMessage, phoneNumber);
        res.status(200).json({message:'تم إرسال رمز التحقق إلى رقم هاتفك'});
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const resendMessage = async (req,res) => {
    const { phoneNumber } = req.body;
    try {
        const newOtpCode = await driverModel.getResetOtpCode(phoneNumber);
        const otpMessage = `رمز التحقق الخاص بك في جاهز هو: ${newOtpCode}`;
        await sendMessage(otpMessage, phoneNumber);
        res.status(200).json({ message: 'تم إعادة إرسال رمز التحقق إلى رقم هاتفك' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const checkResetCode = async (req,res) => {
    const { phoneNumber,OTPCode } = req.body
    try {
        const valid = await driverModel.checkResetCode(phoneNumber,OTPCode);
        res.status(200).json({valid});
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const resetPassword = async (req,res) => {
    const { phoneNumber,resetOtpCode,newPassword } = req.body
    try {
        await driverModel.resetPassword(phoneNumber,resetOtpCode,newPassword);
        res.status(200).json({message:'تم إعادة تعيين كلمة المرور بنجاح'});
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

module.exports = {
    signup,
    login,
    getData,
    verifyDriver,
    submitVerification,
    sendResetMessage,
    resendMessage,
    checkResetCode,
    resetPassword
}