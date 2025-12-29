const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = mongoose.Schema;

const userSchema = new schema({
    userName: {
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
    numberOfTrips: {
        type:Number,
        default:0,
        required:true
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
    isVerified: {
        type:Boolean,
        default:false,
        required:true
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

userSchema.statics.signup = async function(userName, phoneNumber, password,expoToken) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt)
    const user = await this.create({
        userName,
        phoneNumber,
        password:hash,
        otpCode:generateRandomCode(),
        expoToken
    })

    return user
}

userSchema.statics.login = async function(phoneNumber,password,expoToken) {
    const user = await this.findOne({phoneNumber})
    if(!user){
        throw Error('رقم الهاتف غير موجود')
    }

    const match = await bcrypt.compare(password,user.password)

    if(!match){
        throw Error('كلمة مرور غير صحيحة')
    }

    this.findOneAndUpdate({_id:user._id},{expoToken})
    return user
}

userSchema.statics.verifyUser = async function(userId,OTPCode) {
    const user = await this.findOne({_id:userId})
    if(!user){
        throw Error('المستخدم غير موجود')
    }

    if(OTPCode == user.otpCode){
        await this.findOneAndUpdate({_id:user._id},{isVerified:true})

        return {...user._doc,isVerified:true}
    }else {
        throw Error('رمز otp خاطئ')
    }

}

userSchema.statics.createOtpResetCode = async function(phoneNumber) {
    const user = await this.findOne({phoneNumber})
    if(!user){
        throw Error('رقم الهاتف غير موجود')
    }
    const newOtpCode = generateRandomCode()
    await this.findOneAndUpdate({phoneNumber},{resetOtpCode:newOtpCode})

    return newOtpCode
}

userSchema.statics.getResetOtpCode = async function(phoneNumber) {
    const user = await this.findOne({phoneNumber})
    if(!user){
        throw Error('رقم الهاتف غير موجود')
    }
    const otpResetCode = user.resetOtpCode;
    if(!otpResetCode){
        throw Error('لا يوجد رمز لإعادة التعيين. الرجاء طلب رمز جديد.')
    }
    return otpResetCode
}

userSchema.statics.checkResetCode = async function(phoneNumber,resetOtpCode) {
    const user = await this.findOne({phoneNumber})
    if(!user){
        throw Error('رقم الهاتف غير موجود')
    }
    if(resetOtpCode == user.resetOtpCode){
        return true
    }else {
        throw Error('رمز otp خاطئ')
    }
}

userSchema.statics.resetPassword = async function(phoneNumber,resetOtpCode,newPassword) {
    const user = await this.findOne({phoneNumber})
    if(!user){
        throw Error('رقم الهاتف غير موجود')
    }
    if(resetOtpCode != user.resetOtpCode){
        throw Error('رمز otp خاطئ')
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword,salt);
    const nextTokenVersion = (user.tokenVersion || 0) + 1;

    await this.findOneAndUpdate({ phoneNumber }, {
        password: hash,
        resetOtpCode: null,
        tokenVersion: nextTokenVersion,
    })

    return true
}


module.exports = mongoose.model('user',userSchema)