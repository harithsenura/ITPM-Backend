// Import necessary modules using ES6 syntax
import { Router } from 'express';
import Customer from '../models/customer.js'; // Ensure the correct path and file extension

const router = Router();

// Add a new customer
router.post("/add", async (req, res) => {
    console.log(req.body); // Log the incoming data
    const { name, contactNumber, email, gender, nationality, address,
        nicPassport, checkInDate, roomType, roomNumber, price } = req.body;

    const newCustomer = new Customer({
        name, contactNumber, email, gender, nationality, address,
        nicPassport, checkInDate, roomType, roomNumber, price
    });

    try {
        await newCustomer.save();
        res.json("Customer Added");
    } catch (err) {
        console.error("Error while saving customer:", err);
        res.status(400).json("Error: " + err);
    }
});


// Get all customers
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(400).json("Error: " + err);
    }
});

// Update a customer
router.put("/update/:id", async (req, res) => {
    const userId = req.params.id;
    const { name, contactNumber, email, gender, nationality, address,
        nicPassport, checkInDate, roomType, roomNumber, price } = req.body;

    const updateCustomer = {
        name, contactNumber, email, gender, nationality, address,
        nicPassport, checkInDate, roomType, roomNumber, price
    };

    try {
        await Customer.findByIdAndUpdate(userId, updateCustomer);
        res.status(200).send({ status: "Customer Updated" });
    } catch (err) {
        res.status(400).send({ status: "Error updating customer", error: err.message });
    }
});

// Delete a customer
router.delete("/delete/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        await Customer.findByIdAndDelete(userId);
        res.status(200).send({ status: "Customer deleted" });
    } catch (err) {
        res.status(500).send({ status: "Error deleting customer", error: err.message });
    }
});

// Get a specific customer
router.get("/get/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const customer = await Customer.findById(userId);
        res.status(200).send({ status: "Customer fetched", customer });
    } catch (err) {
        res.status(500).send({ status: "Error fetching customer", error: err.message });
    }
});

// Export the router using ES6 export
export default router;
