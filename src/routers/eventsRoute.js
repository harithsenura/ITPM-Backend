import express from 'express';
import { Event } from '../models/eventModel.js';

const router = express.Router();

// Middleware for validating event data
const validateEvent = (req, res, next) => {
    console.log('Validating Event data:', req.body); // Debugging: log incoming data
    const { Event, Date, Venue, EventPlanner, StartTime, EndTime, Decorations, NoOfGuests } = req.body;

    if (!Event || !Date || !Venue || !EventPlanner || !StartTime || !EndTime || !Decorations || !NoOfGuests) {
        return res.status(400).json({
            message: 'All fields are required: Event, Date, Venue, EventPlanner, StartTime, EndTime, Decorations, NoOfGuests'
        });
    }
    next();
};

// POST Route to save a new Event (with `/add` endpoint)
router.post('/add', validateEvent, async (req, res, next) => {
    try {
        console.log('Received data:', req.body); // Debugging: log incoming data
        const newEvent = await Event.create(req.body);
        return res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
});

// GET Route to retrieve all events
router.get('/', async (req, res, next) => {
    try {
        const events = await Event.find({});
        return res.status(200).json({
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
});

// GET Route to retrieve an event by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.status(200).json(event);
    } catch (error) {
        next(error);
    }
});

// PUT Route to update an event by ID
router.put('/:id', validateEvent, async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.status(200).json({ message: 'Event updated successfully', updatedEvent });
    } catch (error) {
        next(error);
    }
});

// DELETE Route to remove an event by ID
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
