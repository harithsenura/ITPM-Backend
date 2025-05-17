import express from "express"
import mongoose from "mongoose"

const router = express.Router()

// Health check endpoint
router.get("/", async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState
    const dbStatus = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    // Get server information
    const serverInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    }

    // Return health status
    res.status(200).json({
      success: true,
      server: {
        status: "up",
        ...serverInfo,
      },
      database: {
        status: dbStatus[dbState],
        connected: dbState === 1,
      },
      environment: process.env.NODE_ENV || "development",
    })
  } catch (err) {
    console.error("Health check error:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: err.message,
    })
  }
})

export default router
