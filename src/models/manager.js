import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for a manager
const managerSchema = new Schema({
    managerId: {
        type: String,
        required: true,
        unique: true,
        trim: true // Trims whitespace from the string
    },
    managerName: {
        type: String,
        required: true,
        trim: true // Trims whitespace from the string
    },
    role: {
        type: String,
        required: true,
        trim: true // Trims whitespace from the string
    },
    department: {
        type: String,
        required: true,
        trim: true // Trims whitespace from the string
    },
    contactNo: {
        type: String, // Using String to handle leading zeros
        required: true,
    }
});

// Create a model from the schema
const Manager = mongoose.model('Manager', managerSchema);

export default Manager;
