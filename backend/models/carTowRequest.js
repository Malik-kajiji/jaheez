const mongoose = require('mongoose');

const schema = mongoose.Schema;

const carTowRequestSchema = new schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carTow',
        required: true
    },
    driverName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    state: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected'],
        required: true
    },
    reasonForRejection: {
        type: String,
        default: ''
    },
    carPlate: {
        type: String,
        required: true
    },
    carImage: {
        type: String,
        required: true
    },
    vechicleType: {
        type: String,
        enum: ['ساحبة', 'رافعة'],
        required: true
    },
    vechicleModel: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Static method to create a new request
carTowRequestSchema.statics.createRequest = async function(driverId, driverName, phoneNumber, carPlate, carImage, vechicleType, vechicleModel) {
    const request = await this.create({
        driverId,
        driverName,
        phoneNumber,
        carPlate,
        carImage,
        vechicleType,
        vechicleModel
    });
    return request;
};

// Static method to handle request approval
carTowRequestSchema.statics.approveRequest = async function(requestId) {
    const request = await this.findById(requestId);
    if (!request) {
        throw Error('الطلب غير موجود');
    }
    
    request.state = 'approved';
    await request.save();
    
    // Update driver state to active
    await mongoose.model('carTow').findByIdAndUpdate(request.driverId, {
        state: 'active',
        carPlate: request.carPlate,
        carImage: request.carImage
    });
    
    return request;
};

// Static method to handle request rejection
carTowRequestSchema.statics.rejectRequest = async function(requestId, reasonForRejection) {
    const request = await this.findById(requestId);
    if (!request) {
        throw Error('الطلب غير موجود');
    }
    
    request.state = 'rejected';
    request.reasonForRejection = reasonForRejection;
    await request.save();
    
    return request;
};

// Static method to get all requests with pagination
carTowRequestSchema.statics.getAllRequests = async function(page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const requests = await this.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    const total = await this.countDocuments();
    
    return {
        requests,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
};

// Static method to search requests by phone number
carTowRequestSchema.statics.searchByPhone = async function(phoneNumber) {
    return await this.find({
        phoneNumber: { $regex: phoneNumber, $options: 'i' }
    }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('carTowRequest', carTowRequestSchema);