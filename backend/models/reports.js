const mongoose = require('mongoose');

const schema = mongoose.Schema

const reportSchema = new schema({
    // the reporter
    reporter: {
        type:String,
        enum: ['user', 'driver'],
        required: true
    },
    // trip information
    tripId: {
        type:String,
        required: true
    },
    tripNumber:{
        type:Number,
        required:true
    },

    // user information
    userId: {
        type:String,
        required: true
    },
    userName: {
        type:String,
        required:true,
    },
    userPhoneNumber: {
        type:String,
        required:true,
    },
    // driver information
    driverId: {
        type:String,
        required: true
    },
    driverName: {
        type:String,
        required:true,
    },
    driverPhoneNumber: {
        type:String,
        required:true,
    },

    state: {
        type: String,
        enum: ['pending', 'closed'],
        default: 'pending',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // it can be image urls of any other files in a form of a URL
    attachedFiles: {
        type: Array,
        default:[],
        required: true
    }
},{timestamps:true})


module.exports = mongoose.model('report',reportSchema)