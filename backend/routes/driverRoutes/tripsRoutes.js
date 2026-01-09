const express = require('express');
const router = express.Router();
const driverMiddleware = require('../../middlewares/driverMiddleware');

const { getDriverTrips } = require('../../controllers/driverControlers/tripsController');

router.use(async (req,res,next)=>{await driverMiddleware(req,res,next)})
router.get('/trips', getDriverTrips);

module.exports = router;