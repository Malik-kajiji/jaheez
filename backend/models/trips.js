const mongoose = require('mongoose');

const schema = mongoose.Schema;

const tripSchema = new schema({
    // starts from 935 and on each trip the next trip number increases by a random number from 1 to 5 from the previuos trip
    tripNumber:{
        type:Number,
        required:true
    },
    tripCost:{
        type:Number,
        required:true
    },
    state: {
        type: String,
        default:'pending',
        enum:['pending','completed','cancelled','faild'],
        required: true
    },
    // Added year and month fields for better filtering
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,  // 1-12
        required: true
    },
    // the start point and ending point data are taken from google maps
    startPoint: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    endingPoint: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    driverName: {
        type:String,
        required:true,
    },
    driverPhoneNumber:{
        type:String,
        required:true,
    },
    driverId: {
        type:String,
        required:true,
    },
    userName: {
        type:String,
        required:true,
    },
    userPhoneNumber:{
        type:String,
        required:true,
    },
    userId: {
        type:String,
        required:true,
    },
},  { timestamps: true })

// Pre-save middleware to set year and month
tripSchema.pre('save', function(next) {
    const date = this.createdAt || new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth() + 1;  // JavaScript months are 0-based
    next();
});

module.exports = mongoose.model('trip',tripSchema)