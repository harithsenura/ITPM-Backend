import express from 'express';
import Manager from '../models/manager.js';

const router = express.Router();

// Middleware for catching async errors
const catchAsync = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Add a new manager (POST request)
router.post('/Add', catchAsync(async (req, res) => {
    const { managerId, managerName, role, department, contactNo } = req.body;

    // Validate required fields
    if (!managerId || !managerName || !role || !department || !contactNo) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newManager = new Manager({
        managerId,
        managerName,
        role,
        department,
        contactNo
    });

    await newManager.save();
    res.status(201).json({ success: true, message: "Manager added successfully!", manager: newManager });
}));

// Get all managers (GET request)
router.get('/Get', catchAsync(async (req, res) => {
    const managers = await Manager.find();
    res.status(200).json({ success: true, data: managers });
}));

// Get a specific manager by managerId (GET request)
router.get('/:managerId', catchAsync(async (req, res) => {
    const manager = await Manager.findOne({ managerId: req.params.managerId });
    if (!manager) {
        return res.status(404).json({ success: false, message: "Manager not found." });
    }
    res.status(200).json({ success: true, data: manager });
}));

// Update a manager (PUT request)
router.put('/Update/:managerId', catchAsync(async (req, res) => {
    const updatedManager = await Manager.findOneAndUpdate(
        { managerId: req.params.managerId },
        req.body,
        { new: true, runValidators: true }
    );
    if (!updatedManager) {
        return res.status(404).json({ success: false, message: "Manager not found." });
    }
    res.status(200).json({ success: true, message: "Manager updated successfully.", data: updatedManager });
}));

// Delete a manager (DELETE request)
router.delete('/Delete/:managerId', catchAsync(async (req, res) => {
    const deletedManager = await Manager.findOneAndDelete({ managerId: req.params.managerId });
    if (!deletedManager) {
        return res.status(404).json({ success: false, message: "Manager not found." });
    }
    res.status(200).json({ success: true, message: "Manager deleted successfully." });
}));

export default router;
