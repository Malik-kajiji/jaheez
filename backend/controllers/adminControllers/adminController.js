const adminController = require('../../models/admin')
const JWT = require('jsonwebtoken');
const CarTowRequest = require('../../models/carTowRequest');
const User = require('../../models/users');
const Trip = require('../../models/trips');
const Voucher = require('../../models/voucher');
const Subscription = require('../../models/subscription');
const Profit = require('../../models/profit');
const Coupon = require('../../models/coupons');
const Report = require('../../models/reports');
const Notification = require('../../models/notifications');

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
            // Add 'trips' access if not already present
            if (!admin.access.includes('trips')) {
                admin.access.push('trips');
                await adminController.editAccess(admin._id, admin.access);
            }
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

const getAdminAccess = async (req,res) => {
    admin = req.admin

    res.status(200).json(admin)
}

const getHomePageData = async (req,res) => {
    const { access } = req.admin

    try {
        let data = {}
        
        // Car Tow Requests - pending count
        if(access.includes('car-tows') || access.includes('owner')){
            data.pendingCarTowRequests = await CarTowRequest.countDocuments({ state: 'pending' })
        }
        
        // Users - total count
        if(access.includes('users') || access.includes('owner')){
            data.totalUsers = await User.countDocuments()
        }
        
        // Trips - total count
        if(access.includes('trips') || access.includes('owner')){
            data.totalTrips = await Trip.countDocuments()
        }
        
        // Vouchers - not used count
        if(access.includes('vouchers') || access.includes('owner')){
            data.notUsedVouchers = await Voucher.countDocuments({ isUsed: false })
        }
        
        // Subscriptions - active count
        if(access.includes('subscriptions') || access.includes('owner')){
            data.activeSubscriptions = await Subscription.countDocuments({
                state: 'active',
                endDate: { $gte: new Date() }
            })
        }
        
        // Profits - current month
        if(access.includes('profits') || access.includes('owner')){
            const currentDate = new Date()
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
            
            const monthProfits = await Profit.find({
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            })
            
            data.currentMonthProfit = monthProfits.reduce((sum, profit) => sum + profit.amount, 0)
        }
        
        // Coupons - active count
        if(access.includes('coupons') || access.includes('owner')){
            data.activeCoupons = await Coupon.countDocuments({ state: 'active' })
        }
        
        // Reports - pending count
        if(access.includes('reports') || access.includes('owner')){
            data.pendingReports = await Report.countDocuments({ state: 'pending' })
        }
        
        // Notifications - total count
        if(access.includes('notifications') || access.includes('owner')){
            data.totalNotifications = await Notification.countDocuments()
        }
        
        // Admins - total count
        if(access.includes('admins') || access.includes('owner')){
            data.totalAdmins = await adminController.countDocuments()
        }
        
        res.status(200).json({
            data
        })
    }catch(err){
        res.status(400).json({message:err.message});
    }
}


module.exports = {
    loginAsAdmin,
    getAdminAccess,
    getHomePageData
}