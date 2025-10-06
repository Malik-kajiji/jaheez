const mongoose = require('mongoose');

const schema = mongoose.Schema

const nitificationSchema = new schema({
    // the notifications data
    title: {
        type:String,
        required: true
    },
    body: {
        type:String,
        required: true
    },
    // who is sent for
    notificationType: {
        type:String,
        enum: ['for-users', 'for-drivers'],
        required: true
    },
    // if the notification is for specific user
    isForOneUser: {
        type:Boolean,
        default: false,
        required: true
    },
    // if the notification is for specific user the user data should go here
    userName: {
        type:String,
    },
    userPhoneNumber: {
        type:String,
    },
    // to check if the notification have been sent successfully
    isSuccessful: {
        type:Boolean,
        required: true
    }
},{timestamps:true})


module.exports = mongoose.model('nitification',nitificationSchema)