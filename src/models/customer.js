import mongoose from 'mongoose';

const { Schema } = mongoose;

const customerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    nicPassport: {
        type: String,  // Changed from Number to String for more flexibility
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    roomType: {
        type: String,
        required: true
    },
    roomNumber: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
