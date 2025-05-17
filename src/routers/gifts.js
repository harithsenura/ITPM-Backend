import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import Gift from "../models/Gift.js"
import mongoose from "mongoose" // Import mongoose for ID validation

const router = express.Router()

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Add CORS middleware to handle preflight requests
router.use((req, res, next) => {
  // Log all incoming requests
  console.log(`${req.method} request to ${req.originalUrl}`)

  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request")
    return res.status(200).end()
  }

  next()
})

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads/gifts"

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `gift-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false)
  }
  cb(null, true)
}

// Upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// Get all gifts
router.get("/", async (req, res) => {
  try {
    console.log("GET /gifts - Fetching all gifts")
    const gifts = await Gift.find()
    console.log(`Found ${gifts.length} gifts`)

    res.status(200).json({
      success: true,
      count: gifts.length,
      data: gifts,
    })
  } catch (err) {
    console.error("Error fetching gifts:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

// Get single gift
router.get("/:id", async (req, res) => {
  try {
    console.log(`GET /gifts/${req.params.id} - Fetching gift`)

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid gift ID format: ${req.params.id}`)
      return res.status(400).json({
        success: false,
        error: "Invalid gift ID format",
      })
    }

    const gift = await Gift.findById(req.params.id)

    if (!gift) {
      console.log(`Gift not found with ID: ${req.params.id}`)
      return res.status(404).json({
        success: false,
        error: "Gift not found",
      })
    }

    console.log(`Found gift: ${gift.name}`)
    res.status(200).json({
      success: true,
      data: gift,
    })
  } catch (err) {
    console.error("Error fetching gift:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

// Create new gift
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("POST /gifts - Creating new gift")
    console.log("Request body:", req.body)

    const { name, price, description, category } = req.body

    // Create gift object
    const giftData = {
      name,
      price: Number.parseFloat(price),
      description,
      category,
    }

    // Add image path if uploaded
    if (req.file) {
      giftData.image = `/uploads/gifts/${req.file.filename}`
    }

    const gift = await Gift.create(giftData)
    console.log(`Gift created with ID: ${gift._id}`)

    res.status(201).json({
      success: true,
      data: gift,
    })
  } catch (err) {
    console.error("Error creating gift:", err)
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message)

      return res.status(400).json({
        success: false,
        error: messages,
      })
    } else {
      return res.status(500).json({
        success: false,
        error: "Server Error",
      })
    }
  }
})

// Update gift
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log(`PUT /gifts/${req.params.id} - Updating gift`)
    console.log("Request body:", req.body)

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid gift ID format: ${req.params.id}`)
      return res.status(400).json({
        success: false,
        error: "Invalid gift ID format",
      })
    }

    const { name, price, description, category } = req.body

    // Find gift
    const gift = await Gift.findById(req.params.id)

    if (!gift) {
      console.log(`Gift not found with ID: ${req.params.id}`)
      return res.status(404).json({
        success: false,
        error: "Gift not found",
      })
    }

    // Update gift data
    gift.name = name
    gift.price = Number.parseFloat(price)
    gift.description = description
    gift.category = category

    // Update image if uploaded
    if (req.file) {
      // Delete old image if exists
      if (gift.image) {
        const oldImagePath = path.join(__dirname, "../../public", gift.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      gift.image = `/uploads/gifts/${req.file.filename}`
    }

    await gift.save()
    console.log(`Gift ${req.params.id} updated successfully`)

    res.status(200).json({
      success: true,
      data: gift,
    })
  } catch (err) {
    console.error("Error updating gift:", err)
    res.status(500).json({
      success: false,
      error: "Server Error",
    })
  }
})

// IMPROVED Delete gift function
router.delete("/:id", async (req, res) => {
  try {
    console.log(`DELETE /gifts/${req.params.id} - Deleting gift`)
    console.log("Request headers:", req.headers)
    console.log("Request params:", req.params)

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid gift ID format: ${req.params.id}`)
      return res.status(400).json({
        success: false,
        error: "Invalid gift ID format",
      })
    }

    // Find the gift first to get image path
    const gift = await Gift.findById(req.params.id)

    if (!gift) {
      console.log(`Gift not found with ID: ${req.params.id}`)
      return res.status(404).json({
        success: false,
        error: "Gift not found",
      })
    }

    console.log(`Found gift to delete: ${gift.name} (${gift._id})`)

    // Delete image file if exists
    if (gift.image) {
      try {
        const imagePath = path.join(__dirname, "../../public", gift.image)
        console.log(`Checking for image at path: ${imagePath}`)

        if (fs.existsSync(imagePath)) {
          console.log(`Deleting image file: ${imagePath}`)
          fs.unlinkSync(imagePath)
          console.log(`Image file deleted successfully`)
        } else {
          console.log(`Image file not found at path: ${imagePath}`)
        }
      } catch (fileError) {
        console.error(`Error deleting image file:`, fileError)
        // Continue with gift deletion even if image deletion fails
      }
    }

    // Delete the gift from database
    const result = await Gift.findByIdAndDelete(req.params.id)
    console.log(`Gift deleted from database: ${result._id}`)

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Gift deleted successfully",
      data: {},
    })
  } catch (err) {
    console.error("Error deleting gift:", err)
    return res.status(500).json({
      success: false,
      error: err.message || "Server Error",
    })
  }
})

// Add a test endpoint to verify the router is working
router.get("/test", (req, res) => {
  console.log("GET /gifts/test - Testing gifts router")
  res.status(200).json({
    success: true,
    message: "Gifts router is working correctly",
  })
})

export default router
