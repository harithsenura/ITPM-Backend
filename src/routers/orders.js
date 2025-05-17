import express from "express"
import Order from "../models/Order.js" // Make sure to add .js extension

const router = express.Router()

// Get all orders
router.get("/", async (req, res) => {
  try {
    // Add a cache-busting parameter to the query to prevent browser caching
    const orders = await Order.find().populate("user", "name email").populate("items.gift").sort({ createdAt: -1 })

    console.log("Fetched orders count:", orders.length) // Debug log

    // Log a sample order to check structure
    if (orders.length > 0) {
      console.log("Sample order structure:", JSON.stringify(orders[0], null, 2))
    }

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

// Get orders by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    console.log("Fetching orders for user ID:", req.params.userId)

    // Check if userId is valid
    if (!req.params.userId || req.params.userId === "undefined") {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID provided",
      })
    }

    // Try to find orders with the exact user ID
    let orders = []
    try {
      orders = await Order.find({ user: req.params.userId })
        .populate("user", "name email")
        .populate("items.gift")
        .sort({ createdAt: -1 })

      console.log(`Found ${orders.length} orders for user ${req.params.userId} with exact match`)
    } catch (findError) {
      console.error("Error in initial find query:", findError)
    }

    // If no orders found, try alternative approaches
    if (orders.length === 0) {
      console.log("No orders found with exact match, trying alternative approaches...")

      try {
        // Try with string comparison
        const allOrders = await Order.find()
          .populate("user", "name email")
          .populate("items.gift")
          .sort({ createdAt: -1 })

        console.log(`Found ${allOrders.length} total orders, filtering for user ${req.params.userId}`)

        // Filter orders where user._id or user.id matches userId as string
        orders = allOrders.filter((order) => {
          // Handle case where order.user is a string
          if (typeof order.user === "string") {
            return order.user === req.params.userId
          }

          // Handle case where order.user is an object
          if (order.user && (order.user._id || order.user.id)) {
            const orderUserId = order.user._id || order.user.id
            return orderUserId.toString() === req.params.userId.toString()
          }

          return false
        })

        console.log(`Found ${orders.length} orders after string comparison`)
      } catch (alternativeError) {
        console.error("Error in alternative find approach:", alternativeError)
      }
    }

    // Return the orders, even if empty
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    })
  } catch (err) {
    console.error("Error fetching user orders:", err)
    res.status(500).json({
      success: false,
      error: "Server Error: " + (err.message || "Unknown error"),
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    })
  }
})

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.gift")

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

// Create a new order
router.post("/", async (req, res) => {
  try {
    console.log("Creating new order with data:", req.body)
    const order = await Order.create(req.body)
    console.log("Order created successfully:", order)

    res.status(201).json({
      success: true,
      data: order,
    })
  } catch (err) {
    console.error("Error creating order:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

// Update order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      })
    }

    console.log(`Updating order ${req.params.id} status to ${status}`)
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      })
    }

    console.log("Order status updated successfully:", order)
    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (err) {
    console.error("Error updating order status:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (err) {
    console.error("Error deleting order:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

export default router
