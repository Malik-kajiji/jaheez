const JWT = require('jsonwebtoken');
const driverModel = require('../models/carTow')
const subscriptionModel = require('../models/subscription')
const packageModel = require('../models/package')


const computeRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const diff = new Date(endDate) - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const ensureDriverSubscriptionState = async (driver) => {
    let currentState = driver.state;
    let currentBalance = driver.balance || 0;
    let activeSub = await subscriptionModel.findOne({ driverId: driver._id, status: 'active' }).sort({ endDate: -1 });
    let scheduledSub = null;
    const now = new Date();

    if (activeSub && activeSub.endDate <= now) {
        activeSub.status = 'expired';
        await activeSub.save();
        activeSub = null;
    }

    if (!activeSub) {
        const scheduled = await subscriptionModel.findOne({ driverId: driver._id, status: 'scheduled' }).sort({ startDate: 1 });
        if (scheduled) {
            if (scheduled.startDate <= now) {
                // try to activate scheduled plan by charging at start time
                if (currentBalance >= scheduled.packagePrice) {
                    const session = await subscriptionModel.startSession();
                    session.startTransaction();
                    try {
                        await driverModel.findByIdAndUpdate(driver._id, {
                            $inc: { balance: -scheduled.packagePrice },
                            state: 'active',
                        }, { session });

                        scheduled.status = 'active';
                        await scheduled.save({ session });

                        activeSub = scheduled;
                        currentBalance -= scheduled.packagePrice;
                        currentState = 'active';
                        await session.commitTransaction();
                    } catch (err) {
                        await session.abortTransaction();
                        throw err;
                    } finally {
                        session.endSession();
                    }
                } else {
                    // insufficient balance; keep scheduled, mark driver inactive
                    if (currentState !== 'inactive') {
                        await driverModel.findByIdAndUpdate(driver._id, { state: 'inactive' });
                        currentState = 'inactive';
                    }
                    scheduledSub = {
                        id: scheduled._id,
                        packageId: scheduled.packageId,
                        packageName: scheduled.packageName,
                        packagePrice: scheduled.packagePrice,
                        packagePeriod: scheduled.packagePeriod,
                        startDate: scheduled.startDate,
                        endDate: scheduled.endDate,
                        status: scheduled.status,
                    };
                    return { currentState, activeSub: null, currentBalance, scheduledSub };
                }
            } else {
                if (currentState !== 'inactive') {
                    await driverModel.findByIdAndUpdate(driver._id, { state: 'inactive' });
                    currentState = 'inactive';
                }
                scheduledSub = {
                    id: scheduled._id,
                    packageId: scheduled.packageId,
                    packageName: scheduled.packageName,
                    packagePrice: scheduled.packagePrice,
                    packagePeriod: scheduled.packagePeriod,
                    startDate: scheduled.startDate,
                    endDate: scheduled.endDate,
                    status: scheduled.status,
                };
                return { currentState, activeSub: null, currentBalance, scheduledSub };
            }
        }

        if (!activeSub) {
            const lastSub = await subscriptionModel.findOne({ driverId: driver._id, status: { $in: ['active', 'expired', 'cancelled'] } }).sort({ endDate: -1, createdAt: -1 });
            if (lastSub) {
                const pkg = await packageModel.findById(lastSub.packageId);
                const renewalPrice = (pkg && pkg.price) || lastSub.packagePrice;
                const renewalPeriod = (pkg && pkg.durationInDays) || lastSub.packagePeriod;
                const canRenew = pkg && pkg.isActive !== false && renewalPrice > 0 && renewalPeriod > 0 && currentBalance >= renewalPrice;

                if (canRenew) {
                    const session = await subscriptionModel.startSession();
                    session.startTransaction();
                    try {
                        const start = new Date();
                        const end = new Date(start);
                        end.setDate(end.getDate() + renewalPeriod);

                        await driverModel.findByIdAndUpdate(driver._id, {
                            $inc: { balance: -renewalPrice },
                            state: 'active',
                        }, { session });

                        currentBalance -= renewalPrice;

                        activeSub = await subscriptionModel.create([{
                            entityType: 'driver',
                            driverId: driver._id,
                            driverName: driver.driverName,
                            driverPhoneNumber: driver.phoneNumber,
                            packageId: lastSub.packageId,
                            packageName: pkg?.name || lastSub.packageName,
                            packagePrice: renewalPrice,
                            packagePeriod: renewalPeriod,
                            startDate: start,
                            endDate: end,
                            autoRenew: true,
                            status: 'active',
                        }], { session });

                        activeSub = Array.isArray(activeSub) ? activeSub[0] : activeSub;
                        currentState = 'active';
                        await session.commitTransaction();
                    } catch (err) {
                        await session.abortTransaction();
                        throw err;
                    } finally {
                        session.endSession();
                    }
                } else if (currentState !== 'inactive') {
                    await driverModel.findByIdAndUpdate(driver._id, { state: 'inactive' });
                    currentState = 'inactive';
                }
            } else if (currentState !== 'inactive') {
                await driverModel.findByIdAndUpdate(driver._id, { state: 'inactive' });
                currentState = 'inactive';
            }
        }
    } else if (currentState !== 'active') {
        await driverModel.findByIdAndUpdate(driver._id, { state: 'active' });
        currentState = 'active';
    }

    const formattedSub = activeSub ? {
        id: activeSub._id,
        packageId: activeSub.packageId,
        packageName: activeSub.packageName,
        packagePrice: activeSub.packagePrice,
        packagePeriod: activeSub.packagePeriod,
        endDate: activeSub.endDate,
        remainingDays: computeRemainingDays(activeSub.endDate),
        status: activeSub.status,
    } : null;

    return { currentState, activeSub: formattedSub, currentBalance, scheduledSub };
}

const driverMiddleware = async (req,res,next)=>{
    const { authorization } = req.headers

    if(!authorization){
        return res.status(401).json({error:'لم تتم عملية التحقق بنجاح'});
    }

    try {
        const token = authorization.split(' ')[1];
        const { _id, tokenVersion = 0 } = JWT.verify(token, process.env.SECRET);
        const exists = await driverModel.findOne({ _id });

        if (!exists) {
            throw Error('الحساب غير موجود')
        }

        if (exists.isBanned) {
            throw Error('الحساب محظور')
        }

        if ((exists.tokenVersion ?? 0) !== (tokenVersion ?? 0)) {
            throw Error('الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى')
        }
        
        const { currentState, activeSub, currentBalance, scheduledSub } = await ensureDriverSubscriptionState(exists);
        const { driverName,phoneNumber,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,warrnings,isBanned,isVerified,verificationStatus,verificationReason } = exists
        req.driver = {driverId:_id,driverName,phoneNumber,state: currentState,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,balance: currentBalance,warrnings,isBanned,isVerified,verificationStatus,verificationReason, subscription: activeSub, scheduledSubscription: scheduledSub}
        next()
    }catch (err){
        return res.status(401).json({error:err.message});
    }
}

module.exports = driverMiddleware