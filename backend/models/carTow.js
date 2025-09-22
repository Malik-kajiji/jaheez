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
        required:true
    },
    vechicleModel: {
        type:String,
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
    numberOfTrips: {
        type:Number,
        default:0,
        required:true
    }
},  { timestamps: true })

carTowSchema.statics.signup = async function(driverName, phoneNumber, password, vechicleType, vechicleModel) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt)
    const driver = await this.create({
        driverName,
        phoneNumber,
        vechicleType,
        vechicleModel,
        password:hash,
    })

    return driver
}

carTowSchema.statics.login = async function(phoneNumber,password) {
    const driver = await this.findOne({phoneNumber})
    if(!driver){
        throw Error('رقم الهاتف غير موجود')
    }

    const match = await bcrypt.compare(password,driver.password)

    if(!match){
        throw Error('كلمة مرور غير صحيحة')
    }

    return driver
}

module.exports = mongoose.model('carTow',carTowSchema)