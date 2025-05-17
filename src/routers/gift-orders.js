import express from "express"
import Order from "../models/Order.js"
import mongoose from "mongoose"

const router = express.Router()

// Add CORS middleware for this router
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

  // Cache control headers
  res.header("Cache-Control", "no-cache, no-store, must-revalidate")
  res.header("Pragma", "no-cache")
  res.header("Expires", "0")

  if (req.method === "OPTIONS") {
    return res.sendStatus(200)
  }

  next()
})

// Helper function to safely convert to ObjectId
const safeObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
  } catch (error) {
    console.error("Error converting to ObjectId:", error)
    return id
  }
}

// Get all gift orders
router.get("/", async (req, res) => {
  try {
    console.log("GET /gift-orders - Fetching all gift orders")

    // Don't use populate to avoid User model issues
    const orders = await Order.find({ orderType: "gift" }).sort({ createdAt: -1 })

    console.log(`Fetched ${orders.length} gift orders`)

    // Log all orders with their user IDs for debugging
    orders.forEach((order) => {
      console.log(`Order ID: ${order._id}, User ID: ${order.user}, Type: ${typeof order.user}`)
    })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    })
  } catch (err) {
    console.error("Error fetching gift orders:", err)
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    })
  }
})

// Get gift orders by user ID - IMPROVED VERSION
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId
    console.log(`GET /gift-orders/user/${userId} - Fetching gift orders for user`)

    // Check if userId is valid
    if (!userId || userId === "undefined") {
      console.log("Invalid user ID provided")
      return res.status(400).json({
        success: false,
        error: "Invalid user ID provided",
      })
    }

    // Get all gift orders first
    const allOrders = await Order.find({ orderType: "gift" }).sort({ createdAt: -1 })
    console.log(`Found ${allOrders.length} total gift orders`)

    // Log all orders with their user IDs for debugging
    allOrders.forEach((order) => {
      console.log(`Order ID: ${order._id}, User ID: ${order.user}, Type: ${typeof order.user}`)
    })

    // Filter orders by user ID manually
    const userOrders = allOrders.filter((order) => {
      // Check if the user ID matches (as string)
      if (typeof order.user === "string") {
        const match = order.user === userId
        if (match) console.log(`String match found for order: ${order._id}`)
        return match
      }
      // Check if the user ID matches (as ObjectId)
      else if (order.user) {
        const orderUserId = order.user.toString()
        const match = orderUserId === userId
        if (match) console.log(`ObjectId match found for order: ${order._id}`)
        return match
      }
      return false
    })

    console.log(`Returning ${userOrders.length} orders for user ${userId}`)

    res.status(200).json({
      success: true,
      count: userOrders.length,
      data: userOrders,
    })
  } catch (err) {
    console.error("Error fetching user gift orders:", err)
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    })
  }
})

// Get gift order by ID
router.get("/:id", async (req, res) => {
  try {
    const orderId = req.params.id
    console.log(`GET /gift-orders/${orderId} - Fetching gift order`)

    let order

    // Try with string ID
    order = await Order.findOne({
      _id: orderId,
      orderType: "gift",
    })
      // Remove populate to avoid User model issues
      .lean() // Use lean() for better performance

    // If not found and valid ObjectId, try with ObjectId
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findOne({
        _id: new mongoose.Types.ObjectId(orderId),
        orderType: "gift",
      })
        // Remove populate to avoid User model issues
        .lean() // Use lean() for better performance
    }

    if (!order) {
      console.log(`Gift order with ID ${orderId} not found`)
      return res.status(404).json({
        success: false,
        error: "Gift order not found",
      })
    }

    console.log(`Found gift order with ID ${orderId}`)
    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (err) {
    console.error("Error fetching gift order:", err)
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    })
  }
})

// Create a new gift order
router.post("/", async (req, res) => {
  try {
    console.log("POST /gift-orders - Creating new gift order")
    console.log("Request body:", req.body)

    // Process user ID - UPDATED to handle missing user ID
    let userData = req.body.user
    console.log("Original user data:", userData)

    if (!userData) {
      console.log("WARNING: No user ID provided in request body")

      // Create a temporary guest user ID instead of returning an error
      userData = "guest-user-" + Date.now()
      console.log("Created temporary guest user ID:", userData)
    }

    if (req.body.user && mongoose.Types.ObjectId.isValid(req.body.user)) {
      userData = new mongoose.Types.ObjectId(req.body.user)
      console.log("Converted user ID to ObjectId:", userData)
    }

    // Process gift IDs in items
    const items = Array.isArray(req.body.items)
      ? req.body.items.map((item) => {
          let giftId = item.gift
          if (item.gift && mongoose.Types.ObjectId.isValid(item.gift)) {
            giftId = new mongoose.Types.ObjectId(item.gift)
          }
          return {
            ...item,
            gift: giftId,
          }
        })
      : []

    // Create order data
    const orderData = {
      ...req.body,
      user: userData,
      items: items,
      orderType: "gift",
    }

    console.log("Final order data to be saved:", orderData)

    const order = await Order.create(orderData)
    console.log("Gift order created successfully:", order._id)
    console.log("Order user ID:", order.user)

    // Store the order in localStorage for backup (server-side logging only)
    console.log("Order should be stored in localStorage with user ID:", userData)

    res.status(201).json({
      success: true,
      data: order,
    })
  } catch (err) {
    console.error("Error creating gift order:", err)
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    })
  }
})

// Update gift order status
router.put("/:id/status", async (req, res) => {
  try {
    const orderId = req.params.id
    const { status } = req.body
    console.log(`PUT /gift-orders/${orderId}/status - Updating status to ${status}`)

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      })
    }

    let order

    // Try with string ID
    order = await Order.findOneAndUpdate(
      { _id: orderId, orderType: "gift" },
      { status },
      { new: true, runValidators: true },
    )

    // If not found and valid ObjectId, try with ObjectId
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(orderId), orderType: "gift" },
        { status },
        { new: true, runValidators: true },
      )
    }

    if (!order) {
      console.log(`Gift order with ID ${orderId} not found for status update`)
      return res.status(404).json({
        success: false,
        error: "Gift order not found",
      })
    }

    console.log(`Gift order ${orderId} status updated to ${status}`)
    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (err) {
    console.error("Error updating gift order status:", err)
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    })
  }
})

// Delete a gift order
router.delete("/:id", async (req, res) => {
  try {
    const orderId = req.params.id
    console.log(`DELETE /gift-orders/${orderId} - Deleting gift order`)

    let order

    // Try with string ID
    order = await Order.findOneAndDelete({
      _id: orderId,
      orderType: "gift",
    })

    // If not found and valid ObjectId, try with ObjectId
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(orderId),
        orderType: "gift",
      })
    }

    if (!order) {
      console.log(`Gift order with ID ${orderId} not found for deletion`)
      return res.status(404).json({
        success: false,
        error: "Gift order not found",
      })
    }

    console.log(`Gift order ${orderId} deleted successfully`)
    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (err) {
    console.error("Error deleting gift order:", err)
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    })
  }
})

export default router
