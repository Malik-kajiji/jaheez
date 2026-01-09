const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = mongoose.Schema;

const carTowSchema = new schema({
    driverName: {
        type:String,
        required:true,
    },
    phoneNumber: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    state: {
        type:String,
        default:'inactive',
        enum:['active','inactive'],
        required:true
    },
    carPlate: {
        type:String,
    },
    carImage: {
        type:String,
    },
    // the rating should be an array of objects each object contains userId,username,phoneNumber,review and rating
    ratings: {
        type:Array,
        default:[],
        required:true
    },
    vechicleType: {
        type:String,
        enum:['ساحبة','رافعة'],
    },
    vechicleModel: {
        type:String,
    },
    warrnings: {
        type:Number,
        default:0,
        required:true
    },
    isBanned: {
        type:Boolean,
        default:false,
        required:true
    },
    numberOfTrips: {
        type:Number,
        default:0,
        required:true
    },
    balance: {
        type: Number,
        default: 0,
        required: true,
    },
    isVerified: {
        type:Boolean,
        default:false,
        required:true
    },
    verificationStatus: {
        type:String,
        enum:['didnt-apply','pending','rejected','approved'],
        default:'didnt-apply',
        required:true
    },
    verificationReason: {
        type:String,
        default:'',
    },
    otpCode: {
        type: String,
    },
    resetOtpCode: {
        type: String,
    },
    expoToken: {
        type: String,
    },
    tokenVersion: {
        type: Number,
        default: 0,
    }
},  { timestamps: true })

function generateRandomCode() {
    const characters = '0123456789';
    let code = '';

    for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
}

carTowSchema.statics.signup = async function(driverName, phoneNumber, password, expoToken) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt)
    const driver = await this.create({
        driverName,
        phoneNumber,
        password:hash,
        otpCode:generateRandomCode(),
        expoToken
    })

    return driver
}

carTowSchema.statics.login = async function(phoneNumber,password,expoToken) {
    const driver = await this.findOne({phoneNumber})
    if(!driver){
        throw Error('رقم الهاتف غير موجود')
    }

    const match = await bcrypt.compare(password,driver.password)

    if(!match){
        throw Error('كلمة مرور غير صحيحة')
    }

    await this.findOneAndUpdate({_id:driver._id},{expoToken})
    
    return driver
}

carTowSchema.statics.verifyDriver = async function(driverId,OTPCode) {
    const driver = await this.findOne({_id:driverId})
    if(!driver){
        throw Error('السائق غير موجود')
    }

    if(OTPCode == driver.otpCode){
        await this.findOneAndUpdate({_id:driver._id},{isVerified:true,verificationReason:''})
        return {...driver._doc,isVerified:true,verificationReason:''}
    }else {
        throw Error('رمز otp خاطئ')
    }

}

carTowSchema.statics.createOtpResetCode = async function(phoneNumber) {
    const driver = await this.findOne({phoneNumber})
    if(!driver){
        throw Error('رقم الهاتف غير موجود')
    }
    const newOtpCode = generateRandomCode()
    await this.findOneAndUpdate({phoneNumber},{resetOtpCode:newOtpCode})

    return newOtpCode
}

carTowSchema.statics.getResetOtpCode = async function(phoneNumber) {
    const driver = await this.findOne({phoneNumber})
    if(!driver){
        throw Error('رقم الهاتف غير موجود')
    }
    const otpResetCode = driver.resetOtpCode;
    if(!otpResetCode){
        throw Error('لا يوجد رمز لإعادة التعيين. الرجاء طلب رمز جديد.')
    }
    return otpResetCode
}

carTowSchema.statics.checkResetCode = async function(phoneNumber,resetOtpCode) {
    const driver = await this.findOne({phoneNumber})
    if(!driver){
        throw Error('رقم الهاتف غير موجود')
    }
    if(resetOtpCode == driver.resetOtpCode){
        return true
    }else {
        throw Error('رمز otp خاطئ')
    }
}

carTowSchema.statics.resetPassword = async function(phoneNumber,resetOtpCode,newPassword) {
    const driver = await this.findOne({phoneNumber})
    if(!driver){
        throw Error('رقم الهاتف غير موجود')
    }
    if(resetOtpCode != driver.resetOtpCode){
        throw Error('رمز otp خاطئ')
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword,salt);
    const nextTokenVersion = (driver.tokenVersion || 0) + 1;

    await this.findOneAndUpdate({ phoneNumber }, {
        password: hash,
        resetOtpCode: null,
        tokenVersion: nextTokenVersion,
    })

    return true
}

module.exports = mongoose.model('carTow',carTowSchema)