const voucherModel = require('../../models/voucher');
const driverModel = require('../../models/carTow');
const profitModel = require('../../models/profit');
const packageModel = require('../../models/package');
const subscriptionModel = require('../../models/subscription');

const getPackages = async (req, res) => {
    try {
        const packages = await packageModel.find({ isActive: true }).sort({ price: 1, durationInDays: 1 });
        return res.status(200).json(packages);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

const redeemVoucher = async (req, res) => {
    const { driverId } = req.driver || {};
    const { voucherCode } = req.body || {};

    try {
        const code = (voucherCode || '').trim();
        if (!code) {
            return res.status(400).json({ message: 'الرجاء إدخال رقم القسيمة' });
        }

        const voucher = await voucherModel.findOne({ secretNumber: code });
        if (!voucher) {
            return res.status(404).json({ message: 'القسيمة غير صالحة' });
        }

        if (voucher.isUsed) {
            return res.status(400).json({ message: 'تم استخدام هذه القسيمة مسبقًا' });
        }

        const session = await voucherModel.startSession();
        session.startTransaction();
        try {
            const updatedDriver = await driverModel.findByIdAndUpdate(
                driverId,
                { $inc: { balance: voucher.value } },
                { new: true, session }
            );

            voucher.isUsed = true;
            voucher.useDate = new Date();
            await voucher.save({ session });

            await profitModel.create([
                {
                    type: 'balance-charge',
                    amount: voucher.value,
                    voucherType: `فئة ${voucher.value} دينار`,
                }
            ], { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: 'تم شحن الرصيد بنجاح',
                balance: updatedDriver?.balance || 0,
            });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

const formatSubscription = (sub) => {
    if (!sub) return null;
    const remainingDays = Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    return {
        id: sub._id,
        packageId: sub.packageId,
        packageName: sub.packageName,
        packagePrice: sub.packagePrice,
        packagePeriod: sub.packagePeriod,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: sub.status,
        remainingDays,
    };
};

const getStatus = async (req, res) => {
    try {
        const { driverId } = req.driver || {};
        let subscription = req.driver?.subscription || null;

        if (!subscription) {
            const active = await subscriptionModel.findOne({ driverId, status: 'active' }).sort({ endDate: -1 });
            if (active) {
                subscription = formatSubscription(active);
            }
        }

        const scheduled = req.driver?.scheduledSubscription
            ? await subscriptionModel.findById(req.driver.scheduledSubscription.id)
            : await subscriptionModel.findOne({ driverId, status: 'scheduled' }).sort({ startDate: 1 });
        const scheduledSubscription = scheduled ? formatSubscription(scheduled) : null;

        return res.status(200).json({
            subscription,
            scheduledSubscription,
            driverState: req.driver?.state,
            balance: req.driver?.balance ?? 0,
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

const startSubscription = async (req, res) => {
    const { driverId, driverName, phoneNumber } = req.driver || {};
    const { packageId, startFrom } = req.body || {};

    try {
        if (!packageId) {
            return res.status(400).json({ message: 'الرجاء اختيار الباقة' });
        }

        const pkg = await packageModel.findById(packageId);
        if (!pkg || pkg.isActive === false) {
            return res.status(404).json({ message: 'الباقة غير متاحة' });
        }

        const price = (pkg.isThereDiscount && pkg.priceAfterDiscount) ? pkg.priceAfterDiscount : pkg.price;
        const period = pkg.durationInDays;

        const driver = await driverModel.findById(driverId);
        if (!driver) {
            throw new Error('السائق غير موجود');
        }

        if (driver.balance < price) {
            return res.status(400).json({ message: 'الرصيد غير كاف للاشتراك في هذه الباقة' });
        }

        const activeSub = await subscriptionModel.findOne({ driverId, status: 'active' }).sort({ endDate: -1 });
        const normalizedStartFrom = startFrom === 'after-current' ? 'after-current' : 'now';

        const session = await subscriptionModel.startSession();
        session.startTransaction();
        try {
            let created;
            if (normalizedStartFrom === 'after-current' && activeSub) {
                // schedule new plan to start after current ends
                const start = new Date(activeSub.endDate);
                const end = new Date(start);
                end.setDate(end.getDate() + period);

                await subscriptionModel.updateMany({ driverId, status: 'scheduled' }, { status: 'cancelled' }, { session });

                created = await subscriptionModel.create([{
                    entityType: 'driver',
                    driverId,
                    driverName,
                    driverPhoneNumber: phoneNumber,
                    packageId: pkg._id,
                    packageName: pkg.name,
                    packagePrice: price,
                    packagePeriod: period,
                    startDate: start,
                    endDate: end,
                    autoRenew: true,
                    status: 'scheduled',
                }], { session });
            } else {
                // start now: cancel active and activate new plan
                await subscriptionModel.updateMany({ driverId, status: { $in: ['active', 'scheduled'] } }, { status: 'cancelled' }, { session });

                const start = new Date();
                const end = new Date(start);
                end.setDate(end.getDate() + period);

                await driverModel.findByIdAndUpdate(driverId, {
                    $inc: { balance: -price },
                    state: 'active',
                }, { session });

                created = await subscriptionModel.create([{
                    entityType: 'driver',
                    driverId,
                    driverName,
                    driverPhoneNumber: phoneNumber,
                    packageId: pkg._id,
                    packageName: pkg.name,
                    packagePrice: price,
                    packagePeriod: period,
                    startDate: start,
                    endDate: end,
                    autoRenew: true,
                    status: 'active',
                }], { session });
            }

            await session.commitTransaction();
            session.endSession();

            const createdDoc = formatSubscription(Array.isArray(created) ? created[0] : created);
            const updatedDriver = await driverModel.findById(driverId);

            return res.status(200).json({
                message: normalizedStartFrom === 'after-current' && activeSub
                    ? 'تم جدولة الباقة لتبدأ بعد انتهاء الحالية (سيتم الخصم لاحقًا)'
                    : 'تم تفعيل الاشتراك بنجاح',
                subscription: normalizedStartFrom === 'after-current' && activeSub
                    ? formatSubscription(activeSub)
                    : createdDoc,
                scheduledSubscription: normalizedStartFrom === 'after-current' && activeSub ? createdDoc : null,
                balance: updatedDriver?.balance ?? driver.balance,
                driverState: updatedDriver?.state ?? (normalizedStartFrom === 'after-current' ? driver.state : 'active'),
            });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

module.exports = { redeemVoucher, getPackages, getStatus, startSubscription };
