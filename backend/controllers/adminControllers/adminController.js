const adminController = require('../../models/admin')
const JWT = require('jsonwebtoken');

const createToken =  (_id)=>{
    return JWT.sign({_id},process.env.SECRET,{expiresIn:'30d'})
}

const loginAsAdmin = async (req,res) => {
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
        }else if(username === process.env.OWNER_EMAIL && password === !process.env.OWNER_PASS){
            res.status(400).json({message:'خطأ في تسجيل الدخول'});
        }else {
            const admin = await adminController.loginAsAdmin(username,password)
            const token = createToken(admin._id)
            res.status(200).json({
                username:admin.username,
                access:admin.access,
                token
            })
        }
    }catch(err){
        res.status(400).json({message:err.message});
    }
}



// const getHomePageData = async (req,res) => {
//     const { access } = req.admin
//     try {
//         let data = {}
//         if(access.includes('vendors') || access.includes('owner')){
//             data.vendorsCount = await vendorModel.countDocuments()
//         }
//         if(access.includes('sections') || access.includes('owner')){
//             data.productsCount = await productModel.countDocuments()
//         }
//         if(access.includes('users') || access.includes('owner')){
//             data.usersCount = await userModel.countDocuments()
//         }
//         if(access.includes('orders') || access.includes('owner')){
//             const onGoingOrders = await orderModel.getOnGoingOrders()
//             let pending = []
//             let accepted = []
//             let ready = []
//             let added = []
//             let delivering = []
//             onGoingOrders.forEach(e => {
//                 if(e.state === 'pending'){
//                     pending.push(e)
//                 }else if(e.state === 'accepted'){
//                     accepted.push(e)
//                 }else if(e.state === 'ready'){
//                     ready.push(e)
//                 }else if(e.state === 'added'){
//                     added.push(e)
//                 }else if(e.state === 'delivering'){
//                     delivering.push(e)
//                 }
//             })
//             data.onGoingOrders = {
//                 pending,
//                 accepted,
//                 ready,
//                 added,
//                 delivering
//             }
//         }
//         if(access.includes('orders') || access.includes('owner')){
//             const vendorOrders = await vendorOrderModel.getOnGoingOrders()
//             let pending = []
//             let ready = []
//             let taken = []
//             let toReturn = []
//             vendorOrders.forEach(e => {
//                 if(e.state === 'pending'){
//                     pending.push(e)
//                 }else if(e.state === 'ready'){
//                     ready.push(e)
//                 }else if(e.state === 'taken'){
//                     taken.push(e)
//                 }else if(e.state === 'return'){
//                     toReturn.push(e)
//                 }
//             })
//             data.vendorOrders = {
//                 pending,
//                 ready,
//                 taken,
//                 toReturn
//             }
//         }
        
//         res.status(200).json({
//             data
//         })
//     }catch(err){
//         res.status(400).json({message:err.message});
//     }
// }


module.exports = {
    loginAsAdmin
}