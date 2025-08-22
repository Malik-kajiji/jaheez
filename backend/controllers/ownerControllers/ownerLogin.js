const JWT = require('jsonwebtoken');

const createToken =  (_id)=>{
    return JWT.sign({_id},process.env.SECRET,{expiresIn:'30d'})
}

const loginAsOwner = async (req,res) => {
    const { username,password } = req.body
    try {
        if(username === '' || password === ''){
            res.status(400).json({message:'الرجاء ملئ الحقول'})
        }
        if(username === process.env.OWNER_EMAIL && password === process.env.OWNER_PASS){
            const token = createToken(process.env.OWNER_ID)
            res.status(200).json({
                username:process.env.OWNER_EMAIL,
                access:['owner'],
                token
            })
        }else {
            res.status(400).json({message:'خطأ في تسجيل الدخول'});
        }
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

module.exports = {loginAsOwner}