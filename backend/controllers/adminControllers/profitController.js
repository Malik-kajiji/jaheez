const Profit = require('../../models/profit');

// Get profits with filters
const getProfits = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        
        // Build query
        const query = {};
        
        if (type && type !== 'all') {
            query.type = type;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }
        
        const profits = await Profit.find(query).sort({ createdAt: 1 });
        
        res.status(200).json(profits);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get daily profits aggregated by date
const getDailyProfits = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        
        const matchStage = {};
        
        if (type && type !== 'all') {
            matchStage.type = type;
        }
        
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) {
                matchStage.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = end;
            }
        }
        
        const dailyProfits = await Profit.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    totalAmount: 1,
                    count: 1
                }
            },
            { $sort: { date: 1 } }
        ]);
        
        res.status(200).json(dailyProfits);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get distribution by package or voucher type
const getDistribution = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        
        if (!type || type === 'all') {
            return res.status(400).json({ error: 'يجب تحديد نوع الربح' });
        }
        
        const matchStage = { type };
        
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) {
                matchStage.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = end;
            }
        }
        
        const groupField = type === 'subscription' ? '$packageName' : '$voucherType';
        
        const distribution = await Profit.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupField,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: 1,
                    totalAmount: 1
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.status(200).json(distribution);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get profit statistics
const getProfitStats = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        
        const matchStage = {};
        
        if (type && type !== 'all') {
            matchStage.type = type;
        }
        
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) {
                matchStage.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = end;
            }
        }
        
        const stats = await Profit.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                    average: { $avg: '$amount' }
                }
            }
        ]);
        
        // Calculate percentage change if date range is provided
        let percentageChange = null;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const rangeDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            // Get profits from previous period
            const prevStart = new Date(start);
            prevStart.setDate(prevStart.getDate() - rangeDays);
            
            const prevMatchStage = { ...matchStage };
            prevMatchStage.createdAt = {
                $gte: prevStart,
                $lt: start
            };
            
            const prevStats = await Profit.aggregate([
                { $match: prevMatchStage },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);
            
            if (prevStats.length > 0 && prevStats[0].total > 0) {
                const currentTotal = stats[0]?.total || 0;
                const previousTotal = prevStats[0].total;
                percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
            }
        }
        
        res.status(200).json({
            total: stats[0]?.total || 0,
            count: stats[0]?.count || 0,
            average: stats[0]?.average || 0,
            percentageChange
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new profit entry
const createProfit = async (req, res) => {
    try {
        const { type, amount, packageName, voucherType } = req.body;
        
        if (!type || !amount) {
            throw Error('النوع والمبلغ مطلوبان');
        }
        
        if (amount <= 0) {
            throw Error('المبلغ يجب أن يكون أكبر من 0');
        }
        
        if (type === 'subscription' && !packageName) {
            throw Error('اسم الباقة مطلوب لأرباح الاشتراكات');
        }
        
        if (type === 'balance-charge' && !voucherType) {
            throw Error('نوع الكرت مطلوب لأرباح شحن الرصيد');
        }
        
        const profit = await Profit.create({
            type,
            amount,
            packageName,
            voucherType
        });
        
        res.status(201).json(profit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getProfits,
    getDailyProfits,
    getDistribution,
    getProfitStats,
    createProfit
};