import express from 'express';
import Leave from '../models/Leave.js';

const router = express.Router();

// Route to add a new leave request
router.post("/add", (req, res) => {
    const { empid, email, startdate, enddate, reason } = req.body;

    const newLeave = new Leave({
        empid,
        email,
        startdate: Date.parse(startdate),
        enddate: Date.parse(enddate),
        reason,
        // No need to specify approval; it defaults to 'Pending'
    });

    newLeave.save()
        .then(() => {
            res.json("Leave Added with approval status Pending");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send({ status: "Error adding leave", error: err.message });
        });
});

// Route to get all leave requests for a specific employee based on email
router.get("/", (req, res) => {
    const { email } = req.query; // Get email from query params

    if (!email) {
        return res.status(400).send({ status: "Email is required" });
    }

    Leave.find({ email })
        .then((leaves) => {
            res.json(leaves); // Send matching leaves to the client
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send({ status: "Error fetching leaves", error: err.message });
        });
});


// Route to get all leave requests
router.get("/all", (req, res) => {
    Leave.find()
        .then((leaves) => {
            res.json(leaves);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send({ status: "Error fetching leaves", error: err.message });
        });
});

// Route to update a leave request (excluding approval)
router.put("/update/:id", async (req, res) => {
    const leaveID = req.params.id;
    const { empid, email, startdate, enddate, reason } = req.body;

    const updateLeave = {
        empid,
        email,
        startdate,
        enddate,
        reason
    };

    try {
        await Leave.findByIdAndUpdate(leaveID, updateLeave, { new: true });
        res.status(200).send({ status: "Leave Updated" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "Error updating data", error: err.message });
    }
});

// Route to delete a leave request
router.delete("/delete/:id", async (req, res) => {
    const leaveID = req.params.id;

    try {
        await Leave.findByIdAndDelete(leaveID);
        res.status(200).send({ status: "Leave Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "Error deleting leave", error: err.message });
    }
});

// Route to get a specific leave request by ID
router.get("/get/:id", async (req, res) => {
    const leaveID = req.params.id;

    try {
        const leave = await Leave.findById(leaveID);
        res.status(200).send({ status: "Leave fetched", leave });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "Error fetching leave", error: err.message });
    }
});

// Route to update the approval status of a leave request
// Route to update the approval status of a leave request
router.put("/update-approval/:id", async (req, res) => {
    const leaveID = req.params.id;
    const { approval } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(approval)) {
        return res.status(400).send({ 
            status: "Invalid approval status. Valid statuses are Pending, Approved, Rejected." 
        });
    }

    try {
        const updatedLeave = await Leave.findByIdAndUpdate(
            leaveID, 
            { approval }, 
            { new: true }
        );

        if (!updatedLeave) {
            return res.status(404).send({ status: "Leave request not found." });
        }

        res.status(200).send({ status: `Leave ${approval.toLowerCase()} successfully.`, leave: updatedLeave });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "Error updating approval status", error: err.message });
    }
});


export default router;
