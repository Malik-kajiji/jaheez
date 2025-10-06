const Report = require('../../models/reports');

// Get all reports with filters
const getAllReports = async (req, res) => {
    try {
        const { reporter, state, search } = req.query;
        
        const query = {};
        
        // Filter by reporter type
        if (reporter && reporter !== 'all') {
            query.reporter = reporter;
        }
        
        // Filter by state
        if (state && state !== 'all') {
            query.state = state;
        }
        
        // Search by trip number, user phone, or driver phone
        if (search && search.trim()) {
            query.$or = [
                { tripNumber: isNaN(search) ? -1 : Number(search) },
                { userPhoneNumber: { $regex: search, $options: 'i' } },
                { driverPhoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        const reports = await Report.find(query).sort({ createdAt: -1 });
        
        res.status(200).json(reports);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new report
const createReport = async (req, res) => {
    try {
        const {
            reporter,
            tripId,
            tripNumber,
            userId,
            userName,
            userPhoneNumber,
            driverId,
            driverName,
            driverPhoneNumber,
            message,
            attachedFiles
        } = req.body;
        
        // Validation
        if (!reporter || !tripId || !tripNumber || !userId || !userName || !userPhoneNumber || 
            !driverId || !driverName || !driverPhoneNumber || !message) {
            throw Error('جميع الحقول المطلوبة يجب ملؤها');
        }
        
        if (!['user', 'driver'].includes(reporter)) {
            throw Error('نوع المبلغ غير صالح');
        }
        
        const report = await Report.create({
            reporter,
            tripId,
            tripNumber,
            userId,
            userName,
            userPhoneNumber,
            driverId,
            driverName,
            driverPhoneNumber,
            message,
            attachedFiles: attachedFiles || []
        });
        
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update report state
const updateReportState = async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body;
        
        if (!['pending', 'closed'].includes(state)) {
            throw Error('حالة غير صالحة');
        }
        
        const report = await Report.findById(id);
        
        if (!report) {
            throw Error('الشكوى غير موجودة');
        }
        
        report.state = state;
        await report.save();
        
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a report
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        
        const report = await Report.findByIdAndDelete(id);
        
        if (!report) {
            throw Error('الشكوى غير موجودة');
        }
        
        res.status(200).json({ message: 'تم حذف الشكوى بنجاح' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get report statistics
const getReportStats = async (req, res) => {
    try {
        const total = await Report.countDocuments();
        const pending = await Report.countDocuments({ state: 'pending' });
        const closed = await Report.countDocuments({ state: 'closed' });
        const userReports = await Report.countDocuments({ reporter: 'user' });
        const driverReports = await Report.countDocuments({ reporter: 'driver' });
        
        res.status(200).json({
            total,
            pending,
            closed,
            userReports,
            driverReports
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllReports,
    createReport,
    updateReportState,
    deleteReport,
    getReportStats
};