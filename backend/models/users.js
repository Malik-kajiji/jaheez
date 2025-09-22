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
    }
},  { timestamps: true })

userSchema.statics.signup = async function(userName, phoneNumber, password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt)
    const user = await this.create({
        userName,
        phoneNumber,
        password:hash,
    })

    return user
}

userSchema.statics.login = async function(phoneNumber,password) {
    const user = await this.findOne({phoneNumber})
    if(!user){
        throw Error('رقم الهاتف غير موجود')
    }

    const match = await bcrypt.compare(password,user.password)

    if(!match){
        throw Error('كلمة مرور غير صحيحة')
    }

    return user
}

module.exports = mongoose.model('user',userSchema)