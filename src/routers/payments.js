import express from "express"
import mongoose from "mongoose"

const router = express.Router()

// Define a schema for gift orders
const GiftOrderSchema = new mongoose.Schema({
  items: [
    {
      giftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gift",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      giftType: {
        type: String,
        enum: ["individual", "group"],
        required: true,
      },
      groupSize: {
        type: Number,
        default: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentDetails: {
    cardName: {
      type: String,
      required: true,
    },
    cardNumber: {
      type: String, // Last 4 digits only
      required: true,
    },
    expiryMonth: {
      type: String,
      required: true,
    },
    expiryYear: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create the model
const GiftOrder = mongoose.model("GiftOrder", GiftOrderSchema)

// Process payment
router.post("/", async (req, res) => {
  try {
    const { items, totalAmount, paymentDetails } = req.body

    // Validate the request
    if (!items || !items.length || !totalAmount || !paymentDetails) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
      })
    }

    // Create a new order
    const order = new GiftOrder({
      items,
      totalAmount,
      paymentDetails,
    })

    // In a real application, you would process the payment with a payment gateway here
    // For this example, we'll simulate a successful payment

    // Save the order
    order.status = "completed" // Mark as completed
    await order.save()

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
      },
    })
  } catch (err) {
    console.error("Error processing payment:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await GiftOrder.find().sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    })
  } catch (err) {
    console.error("Error fetching orders:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

// Get a single order
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await GiftOrder.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      })
    }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (err) {
    console.error("Error fetching order:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

export default router
