import express from "express"
const router = express.Router()
import {
  addBillsController,
  getBillsController,
  getUserBillsController,
  deleteBillController,
} from "../controller/billsController.js"

// Route to add a bill
router.post("/add-bills", addBillsController)

// Route to get all bills
router.get("/get-bills", getBillsController)

// Route to get bills by user (name or phone number)
router.get("/get-user-bills/:userId", getUserBillsController)

// Route to delete a bill by ID
router.delete("/delete-bills/:id", deleteBillController)

export default router
