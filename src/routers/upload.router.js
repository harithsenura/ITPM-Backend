import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const router = express.Router()

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
const itemImagesDir = path.join(uploadsDir, "items")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (!fs.existsSync(itemImagesDir)) {
  fs.mkdirSync(itemImagesDir, { recursive: true })
}

// Log the directories for debugging
console.log("Uploads directory:", uploadsDir)
console.log("Item images directory:", itemImagesDir)

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, itemImagesDir)
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, "item-" + uniqueSuffix + ext)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error("Only image files are allowed!"), false)
  }
  cb(null, true)
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter,
})

// Route for uploading item images
router.post("/item-image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Create URL for the uploaded file
    const imageUrl = `/uploads/items/${req.file.filename}`

    // Log the file path for debugging
    console.log("File saved at:", path.join(itemImagesDir, req.file.filename))
    console.log("Image URL:", imageUrl)

    // Test if the file is accessible
    const fullPath = path.join(itemImagesDir, req.file.filename)
    if (fs.existsSync(fullPath)) {
      console.log("File exists and is accessible")
    } else {
      console.log("WARNING: File does not exist or is not accessible")
    }

    res.status(200).json({
      message: "File uploaded successfully",
      imageUrl: imageUrl,
      fullPath: fullPath,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      message: "Error uploading file",
      error: error.message,
    })
  }
})

// Add a test route to check if images are accessible
router.get("/test-image/:filename", (req, res) => {
  const filename = req.params.filename
  const imagePath = path.join(itemImagesDir, filename)

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath)
  } else {
    res.status(404).json({
      error: "Image not found",
      searchedPath: imagePath,
    })
  }
})

export default router
