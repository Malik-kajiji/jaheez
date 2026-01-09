const tripsModel = require('../../models/trips');

const getDriverTrips = async (req, res) => {
	const { driverId } = req.driver;

	try {
		const trips = await tripsModel.find({ driverId }).sort({ createdAt: -1 });
		res.status(200).json({ trips });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

module.exports = { getDriverTrips };
