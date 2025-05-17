import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    Event: {
        type: String,
        required: true,
    },
    Date: {
        type: String,
        required: true,
    },
    Venue: {
        type: String,
        required: true,
    },
    EventPlanner: {
        type: String,
        required: true,
    },
    StartTime: {
        type: String,
        required: true,
    },
    EndTime: {
        type: String,
        required: true,
    },
    Decorations: {
        type: String,
        required: true,
    },
    NoOfGuests: {
        type: String,  
        required: true,
    },
});

export const Event = mongoose.model('Event', eventSchema);
