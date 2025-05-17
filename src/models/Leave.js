import mongoose from 'mongoose';

const { Schema } = mongoose;

const leaveSchema = new Schema({
    empid: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    startdate: {
        type: Date,
        required: true
    },
    enddate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    approval: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'], // Define allowed values
        default: 'Pending' // Default to 'Pending'
    }
});

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
