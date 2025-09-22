const Trip = require('../../models/trips');

// Get available months
const getAvailableMonths = async (req, res) => {
    try {
        // Get current month as default
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

        // Check if there are any trips
        const tripCount = await Trip.countDocuments();
        
        if (tripCount === 0) {
            // If no trips exist, return current month
            return res.status(200).json({
                months: [currentMonth],
                message: 'لا توجد رحلات متاحة'
            });
        }

        // Get distinct year-month combinations
        const distinctMonths = await Trip.aggregate([
            {
                $group: {
                    _id: { year: "$year", month: "$month" }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            }
        ]);

        // Format the results as YYYY-MM strings
        const months = distinctMonths.map(item => {
            const year = item._id.year;
            const month = item._id.month.toString().padStart(2, '0');
            return `${year}-${month}`;
        });

        // Add current month if not in the list
        if (!months.includes(currentMonth)) {
            months.unshift(currentMonth);
        }

        res.status(200).json({ months });

    } catch (error) {
        // Return current month on error
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        res.status(200).json({
            months: [currentMonth],
            message: 'حدث خطأ في جلب الرحلات'
        });
    }
};

// Get trips with filtering options
const getTrips = async (req, res) => {
    try {
        const { month, driverPhone, userPhone } = req.query;
        
        let query = {};
        
        // Filter by month if provided
        if (month) {
            const [year, monthNum] = month.split('-').map(Number);
            query.year = year;
            query.month = monthNum;
        } else {
            // Default to current month
            const now = new Date();
            query.year = now.getFullYear();
            query.month = now.getMonth() + 1;
        }

        // Filter by driver phone if provided
        if (driverPhone) {
            query.driverPhoneNumber = { $regex: driverPhone, $options: 'i' };
        }

        // Filter by user phone if provided
        if (userPhone) {
            query.userPhoneNumber = { $regex: userPhone, $options: 'i' };
        }

        // Get trips based on query
        const trips = await Trip.find(query).sort({ createdAt: -1 });

        // Calculate total cost
        const totalCost = trips.reduce((sum, trip) => sum + trip.tripCost, 0);

        res.status(200).json({
            trips,
            count: trips.length,
            totalCost,
            message: trips.length === 0 ? 'لا توجد رحلات متاحة' : undefined
        });

    } catch (error) {
        res.status(200).json({
            trips: [],
            count: 0,
            totalCost: 0,
            message: 'حدث خطأ في جلب الرحلات'
        });
    }
};

// Get a single trip
const getTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await Trip.findById(id);
        
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.status(200).json(trip);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update trip state
const updateTripState = async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body;

        const trip = await Trip.findByIdAndUpdate(
            id,
            { state },
            { new: true }
        );

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.status(200).json(trip);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getTrips,
    getTrip,
    updateTripState,
    getAvailableMonths
};