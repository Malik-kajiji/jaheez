const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');

const app = express()
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json())
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true
}))

// owner routes
const ownerLoginRoutes = require('./routes/ownerRoutes/ownerLoginRoutes')
const ownerAdminRoutes = require('./routes/ownerRoutes/ownerAdminRoutes')
// owner end points
app.use('/owner',ownerLoginRoutes)
app.use('/owner-admin',ownerAdminRoutes)


// admin routes
const adminRoutes = require('./routes/adminRoutes/adminRoutes')
const carTowRequestRoutes = require('./routes/adminRoutes/carTowRequestRoutes')
const userRoutes = require('./routes/adminRoutes/userRoutes')
const tripRoutes = require('./routes/adminRoutes/tripRoutes')
const voucherTypeRoutes = require('./routes/adminRoutes/voucherTypeRoutes')
const voucherRoutes = require('./routes/adminRoutes/voucherRoutes')
const subscriptionRoutes = require('./routes/adminRoutes/subscriptionRoutes')


// admin end points
app.use('/admin', adminRoutes)
app.use('/api/admin', carTowRequestRoutes)
app.use('/api/admin', userRoutes)
app.use('/api/admin/trips', tripRoutes)
app.use('/api/admin/voucher-types', voucherTypeRoutes)
app.use('/api/admin/vouchers', voucherRoutes)
app.use('/api/admin/subscriptions', subscriptionRoutes)

mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`listening to port ${process.env.PORT} & connected to mongodb`)
    })
})
.catch((err)=>{
    console.log(err)
})