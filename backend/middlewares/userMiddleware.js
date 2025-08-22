const JWT = require('jsonwebtoken');
const userModel = require('../models/user')


const vendorMiddleware = async (req,res,next)=>{
    const { authorization } = req.headers

    if(!authorization){
        return res.status(401).json({error:'لم تتم عملية التحقق بنجاح'});
    }

    try {
        const token = authorization.split(' ')[1];
        const {_id} = JWT.verify(token,process.env.SECRET)
        const exists = await userModel.findOne({_id});

        if(exists && !exists.isBanned){
            const { username,phoneNumber,locations,favorites,isBanned,isVerified } = exists
            req.user = {user_id:_id,username,phoneNumber,locations,favorites,isBanned,isVerified}
        }else if(exists?.isBanned) {    
            throw Error('الحساب محظور')
        }else {
            throw Error('الحساب غير موجود')
        }
        next()
    }catch (err){
        return res.status(401).json({error:err.message});
    }
}

module.exports = vendorMiddleware