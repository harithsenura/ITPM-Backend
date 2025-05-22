import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

// Initialize app
const app = express()
dotenv.config()

// CORS configuration - THIS IS THE CRITICAL PART
app.use(
  cors({
    origin: ["https://hotel-management-system-red.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
)

// Add these headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin === "https://hotel-management-system-red.vercel.app" || origin === "http://localhost:3000") {
    res.header("Access-Control-Allow-Origin", origin)
  }
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Expires, Pragma",
  )

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).send()
  }
  next()
})

// Middleware
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err))

// Set up static files directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(express.static(path.join(__dirname, "public")))

// IMPORTANT: Make sure the static file middleware is correctly set up
// This line serves files from the uploads directory at the /uploads URL path
// Log the uploads directory path for debugging
console.log("Uploads directory path:", path.join(__dirname, "uploads"))

import foodRouter from "./routers/food.router.js"
import userRouter from "./routers/user.router.js"
import uploadRouter from "./routers/upload.router.js"
import eventsRoute from "./routers/eventsRoute.js"
import eventPlannerRoute from "./routers/eventPlannerRoute.js"
import customerRouter from "./routers/customers.js"
import roomRouter from "./routers/rooms.js"
import voucherRouter from "./routers/vouchers.js"

import { dbconnect } from "./config/database.config.js"
dbconnect()

app.use("/api/foods", foodRouter)
app.use("/api/users", userRouter)
app.use("/api/upload", uploadRouter)

// event management
app.use("/events", eventsRoute)
app.use("/eventplanners", eventPlannerRoute)

// Customer Management
app.use("/customer", customerRouter)
app.use("/room", roomRouter)

// employee
import EmployeeRouter from "./routers/Employees.js"
app.use("/employee", EmployeeRouter)

// leave
import LeaveRouter from "./routers/Leaves.js"
app.use("/leave", LeaveRouter)

// Bar
import orderRoutes from "./routers/orders.js"
import giftsRouter from "./routers/gifts.js"
import giftOrderRoutes from "./routers/gift-orders.js"
import itemRoutes from "./routers/itemRoutes.js"
import userRoutes from "./routers/userRoutes.js"
import billsRoutes from "./routers/billsRoutes.js"
import payment from "./routers/payments.js"

app.use("/api/items", itemRoutes)
app.use("/api/users", userRoutes)
app.use("/api/bills", billsRoutes)

// Gifts Management
app.use("/orders", orderRoutes)
app.use("/gifts", giftsRouter)
app.use("/gift-orders", giftOrderRoutes)
app.use("/payments", payment)

// Vouchers Management
app.use("/vouchers", voucherRouter)

// Add a diagnostic route to check if images are being served correctly
app.get("/check-image/:filename", (req, res) => {
  const filename = req.params.filename
  const imagePath = path.join(__dirname, "uploads", "items", filename)

  if (fs.existsSync(imagePath)) {
    res.json({
      exists: true,
      path: imagePath,
      url: `/uploads/items/${filename}`,
    })
  } else {
    res.json({
      exists: false,
      path: imagePath,
      searchedIn: path.join(__dirname, "uploads", "items"),
    })
  }
})

// Add a root route for health checks
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Hotel Management API is running",
  })
})

// Serve static files
app.use(express.static("public"))

// Add a simple diagnostic route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working" })
})

// Also add this diagnostic route to check server connectivity
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

// Start server
const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
