import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: true, // Optional, defaults to true if verification isn't needed
    },
}, { timestamps: true });

const Users = mongoose.model("users", userSchema);

export default Users;
