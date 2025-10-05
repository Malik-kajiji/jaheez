const Coupon = require('../../models/coupons');

// Get all coupons with sorting
const getAllCoupons = async (req, res) => {
    try {
        const { sortBy, state } = req.query;
        
        const query = {};
        if (state && state !== 'all') {
            query.state = state;
        }
        
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sortBy === 'oldest') {
            sortOption = { createdAt: 1 };
        }
        
        const coupons = await Coupon.find(query).sort(sortOption);
        
        res.status(200).json(coupons);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new coupon
const createCoupon = async (req, res) => {
    try {
        const { couponCode, discountype, discountValue, expireType, allowedUsageTimes, expireDate } = req.body;
        
        if (!couponCode || !discountype || !discountValue || !expireType) {
            throw Error('جميع الحقول المطلوبة يجب ملؤها');
        }
        
        if (couponCode.trim().length < 2) {
            throw Error('كود الكوبون يجب أن يكون حرفين على الأقل');
        }
        
        // Check if coupon code already exists
        const existing = await Coupon.findOne({ couponCode: couponCode.trim() });
        if (existing) {
            throw Error('كود الكوبون موجود بالفعل');
        }
        
        if (discountValue <= 0) {
            throw Error('قيمة الخصم يجب أن تكون أكبر من 0');
        }
        
        if (discountype === 'percentage' && discountValue > 100) {
            throw Error('نسبة الخصم يجب أن تكون أقل من أو تساوي 100%');
        }
        
        if (expireType === 'usage' && (!allowedUsageTimes || allowedUsageTimes <= 0)) {
            throw Error('عدد مرات الاستخدام المسموحة مطلوب ويجب أن يكون أكبر من 0');
        }
        
        if (expireType === 'date' && !expireDate) {
            throw Error('تاريخ انتهاء الصلاحية مطلوب');
        }
        
        const coupon = await Coupon.create({
            couponCode: couponCode.trim(),
            discountype,
            discountValue,
            expireType,
            allowedUsageTimes,
            expireDate: expireDate ? new Date(expireDate) : undefined
        });
        
        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update coupon state
const updateCouponState = async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body;
        
        if (!['active', 'paused', 'expired'].includes(state)) {
            throw Error('حالة غير صالحة');
        }
        
        const coupon = await Coupon.findById(id);
        
        if (!coupon) {
            throw Error('الكوبون غير موجود');
        }
        
        coupon.state = state;
        await coupon.save();
        
        res.status(200).json(coupon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        
        const coupon = await Coupon.findByIdAndDelete(id);
        
        if (!coupon) {
            throw Error('الكوبون غير موجود');
        }
        
        res.status(200).json({ message: 'تم حذف الكوبون بنجاح' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get coupon statistics
const getCouponStats = async (req, res) => {
    try {
        const total = await Coupon.countDocuments();
        const active = await Coupon.countDocuments({ state: 'active' });
        const paused = await Coupon.countDocuments({ state: 'paused' });
        const expired = await Coupon.countDocuments({ state: 'expired' });
        
        const totalSavings = await Coupon.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalSavedUsingCoupon' }
                }
            }
        ]);
        
        res.status(200).json({
            total,
            active,
            paused,
            expired,
            totalSavings: totalSavings[0]?.total || 0
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllCoupons,
    createCoupon,
    updateCouponState,
    deleteCoupon,
    getCouponStats
};