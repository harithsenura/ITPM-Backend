import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import Voucher from "../models/voucher.js"

const router = express.Router()

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads/vouchers"
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `voucher-${Date.now()}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error("Only image files are allowed!"))
  },
})

// GET all vouchers
router.get("/", async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 })
    res.json({
      success: true,
      data: vouchers,
    })
  } catch (error) {
    console.error("Error fetching vouchers:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch vouchers",
      error: error.message,
    })
  }
})

// GET a single voucher by ID
router.get("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      })
    }
    res.json({
      success: true,
      data: voucher,
    })
  } catch (error) {
    console.error("Error fetching voucher:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch voucher",
      error: error.message,
    })
  }
})

// POST create a new voucher
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, validityPeriod, type } = req.body

    const voucherData = {
      name,
      price,
      description,
      category,
      validityPeriod: validityPeriod || "12 months",
      type: type || "Experience",
    }

    // Add image path if an image was uploaded
    if (req.file) {
      voucherData.image = `/uploads/vouchers/${req.file.filename}`
    }

    const voucher = new Voucher(voucherData)
    await voucher.save()

    res.status(201).json({
      success: true,
      message: "Voucher created successfully",
      data: voucher,
    })
  } catch (error) {
    console.error("Error creating voucher:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create voucher",
      error: error.message,
    })
  }
})

// PUT update a voucher
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, validityPeriod, type, sold } = req.body

    const voucher = await Voucher.findById(req.params.id)
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      })
    }

    // Update voucher fields
    voucher.name = name || voucher.name
    voucher.price = price || voucher.price
    voucher.description = description || voucher.description
    voucher.category = category || voucher.category
    voucher.validityPeriod = validityPeriod || voucher.validityPeriod
    voucher.type = type || voucher.type

    // Update sold status if provided
    if (sold !== undefined) {
      voucher.sold = sold === "true" || sold === true
    }

    // Update image if a new one was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (voucher.image) {
        const oldImagePath = path.join(__dirname, "..", "..", "public", voucher.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      voucher.image = `/uploads/vouchers/${req.file.filename}`
    }

    await voucher.save()

    res.json({
      success: true,
      message: "Voucher updated successfully",
      data: voucher,
    })
  } catch (error) {
    console.error("Error updating voucher:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update voucher",
      error: error.message,
    })
  }
})

// DELETE a voucher
router.delete("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      })
    }

    // Delete the voucher's image if it exists
    if (voucher.image) {
      const imagePath = path.join(__dirname, "..", "..", "public", voucher.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await Voucher.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Voucher deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting voucher:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete voucher",
      error: error.message,
    })
  }
})

// Reset all sold vouchers
router.post("/reset-sold", async (req, res) => {
  try {
    const result = await Voucher.updateMany({ sold: true }, { $set: { sold: false } })

    res.json({
      success: true,
      message: `${result.modifiedCount} vouchers have been reset to available`,
      data: result,
    })
  } catch (error) {
    console.error("Error resetting sold vouchers:", error)
    res.status(500).json({
      success: false,
      message: "Failed to reset sold vouchers",
      error: error.message,
    })
  }
})

export default router
