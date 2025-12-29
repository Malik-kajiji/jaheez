const JWT = require('jsonwebtoken');
const userModel = require('../models/users')


const userMiddleware = async (req,res,next)=>{
    const { authorization } = req.headers

    if(!authorization){
        return res.status(401).json({error:'لم تتم عملية التحقق بنجاح'});
    }

    try {
        const token = authorization.split(' ')[1];
        const { _id, tokenVersion = 0 } = JWT.verify(token, process.env.SECRET);
        const exists = await userModel.findOne({ _id });

        if (!exists) {
            throw Error('الحساب غير موجود')
        }

        if (exists.isBanned) {
            throw Error('الحساب محظور')
        }

        if ((exists.tokenVersion ?? 0) !== (tokenVersion ?? 0)) {
            throw Error('الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى')
        }

        const { userName,phoneNumber,numberOfTrips,warrnings,isBanned,isVerified } = exists
        req.user = {userId:_id,userName,phoneNumber,numberOfTrips,warrnings,isBanned,isVerified}
        next()
    }catch (err){
        return res.status(401).json({error:err.message});
    }
}

module.exports = userMiddleware