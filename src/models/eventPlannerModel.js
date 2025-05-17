import mongoose from "mongoose";

const eventPlannerSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    AssignedEvent: {
        type: String,
        required: true,
    },
    SalaryForTheEvent: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    ContactNumber: {
        type: String,
        required: true,
    },
    
});

export const EventPlanner = mongoose.model('eventPlanner', eventPlannerSchema);
