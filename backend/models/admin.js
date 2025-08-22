const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = mongoose.Schema

const adminSchema = new schema({
    username: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    access: {
        type:Array,
        default:[],
        required:true
    }
})

adminSchema.statics.createAdmin = async function(username,password,access) {
    const exists = await this.findOne({username})
    if(exists){
        throw Error('الاسم موجود بالفعل')
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt)
    const admin = await this.create({
        username,
        password:hash,
        access
    })
    return admin
}

adminSchema.statics.deleteAdmin = async function(id){
    const exists = await this.findOne({_id:id})
    if(!exists){
        throw Error('المسؤول غير موجود')
    }else {
        const product = await this.findOneAndDelete({_id:id});
        return product
    }
}

adminSchema.statics.loginAsAdmin = async function(username,password) {
    const admin = await this.findOne({username})
    if(!admin){
        throw Error('الاسم غير موجود')
    }

    const match = await bcrypt.compare(password,admin.password)

    if(!match){
        throw Error('كلمة مرور غير صحيحة')
    }

    return admin
}

adminSchema.statics.checkPassword = async function(_id,password){
    const admin = await this.findOne({_id})
    if(!admin){
        throw Error('الحساب غير موجود')
    }

    const match = await bcrypt.compare(password,admin.password)

    if(!match){
        throw Error('كلمة مرور غير صحيحة')
    }

    return true
}

adminSchema.statics.editAccess = async function(_id,access) {
    const admin = await this.findOne({_id})
    if(!admin){
        throw Error('الاسم غير موجود')
    }

    await this.findOneAndUpdate({_id},{access})

    return {...admin._doc,access}
}

adminSchema.statics.changePassword = async function(_id,password) {
    const virus = await this.findOne({_id})
    if(!virus){
        throw Error('الحساب غير موجود يرجى انشاء حساب')
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt);

    await this.findOneAndUpdate({_id},{password:hash})

    return {...virus._doc,password:hash}
}

adminSchema.statics.getAllAdmins = async function() {
    const admins = await this.find()

    return admins
}

module.exports = mongoose.model('admin',adminSchema)