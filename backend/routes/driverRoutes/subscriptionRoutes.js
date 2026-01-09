const express = require('express');
const router = express.Router();
const driverMiddleware = require('../../middlewares/driverMiddleware');
const { redeemVoucher, getPackages, getStatus, startSubscription } = require('../../controllers/driverControlers/subscriptionController');

router.use(async (req, res, next) => { await driverMiddleware(req, res, next); });
router.post('/voucher/redeem', redeemVoucher);
router.get('/packages', getPackages);
router.get('/status', getStatus);
router.post('/start', startSubscription);

module.exports = router;
