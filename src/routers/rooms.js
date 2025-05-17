// Import necessary modules using ES6 syntax
import { Router } from "express"
import Room from "../models/room.js" // Ensure the correct path and file extension
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const router = Router()

// Get the directory name using ES6 module syntax
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Update the file upload destination path to ensure it's accessible via HTTP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the upload directory is inside the public folder and accessible
    const uploadDir = path.join(__dirname, "../public/uploads/rooms")

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid conflicts
    cb(null, `room_${Date.now()}_${Math.floor(Math.random() * 1000)}${path.extname(file.originalname)}`)
  },
})

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Not an image! Please upload only images."), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Update the add route to handle multiple images
router.post("/add", upload.array("roomImages", 10), async (req, res) => {
  try {
    const { roomType, price, roomNumber, facilities, bedType, status } = req.body

    // Validate required fields
    if (!roomType || !price || !roomNumber || !bedType || !status) {
      return res.status(400).json({ error: "Error: Missing required fields" })
    }

    // Process uploaded images
    const imagePaths = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imagePaths.push(`/uploads/rooms/${file.filename}`)
      })
    }

    // Create new room object with multiple images
    const newRoom = new Room({
      roomType,
      price,
      roomNumber,
      facilities,
      bedType,
      status,
      images: imagePaths, // Store array of image paths
    })

    await newRoom.save()
    res.json({ message: "Room Added", room: newRoom })
  } catch (err) {
    res.status(400).json({ error: "Error: " + err.message })
  }
})

router.get("/available", async (req, res) => {
  const { roomType } = req.query

  if (!roomType) {
    return res.status(400).json({ message: "roomType is required" })
  }

  try {
    // Fetch rooms of the specified type with status "Available"
    const availableRooms = await Room.find({ roomType, status: "Available" }).select("roomNumber")
    res.json(availableRooms.map((room) => room.roomNumber))
  } catch (error) {
    console.error("Error fetching available rooms:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find()
    res.status(200).json(rooms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a room with multiple images
router.put("/update/:id", upload.array("roomImages", 10), async (req, res) => {
  try {
    const roomId = req.params.id
    const { roomType, price, roomNumber, facilities, bedType, status, keepExistingImages } = req.body

    // Validate required fields
    if (!roomType || !price || !roomNumber || !bedType || !status) {
      return res.status(400).json({ error: "Error: Missing required fields" })
    }

    // Get the existing room to check if we need to delete old images
    const existingRoom = await Room.findById(roomId)
    if (!existingRoom) {
      return res.status(404).json({ status: "Room not found" })
    }

    const updateRoom = {
      roomType,
      price,
      roomNumber,
      facilities,
      bedType,
      status,
    }

    // Process new uploaded images
    const newImagePaths = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newImagePaths.push(`/uploads/rooms/${file.filename}`)
      })
    }

    // Handle image updates
    if (keepExistingImages === "true" && newImagePaths.length > 0) {
      // Keep existing images and add new ones
      updateRoom.images = [...existingRoom.images, ...newImagePaths]
    } else if (newImagePaths.length > 0) {
      // Replace with new images only
      // Delete old images if they exist
      if (existingRoom.images && existingRoom.images.length > 0) {
        existingRoom.images.forEach((imagePath) => {
          const oldImagePath = path.join(__dirname, "../public", imagePath)
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath)
          }
        })
      }
      updateRoom.images = newImagePaths
    }
    // If no new images and not keeping existing, images array will be empty

    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateRoom, { new: true })
    res.status(200).send({ status: "Room Updated", room: updatedRoom })
  } catch (error) {
    res.status(400).send({ status: "Error updating room", error: error.message })
  }
})

// Delete a room
router.delete("/delete/:id", async (req, res) => {
  try {
    const roomId = req.params.id

    // Get the room to delete
    const roomToDelete = await Room.findById(roomId)
    if (!roomToDelete) {
      return res.status(404).send({ status: "Room not found" })
    }

    // Delete all associated images if they exist
    if (roomToDelete.images && roomToDelete.images.length > 0) {
      roomToDelete.images.forEach((imagePath) => {
        const fullImagePath = path.join(__dirname, "../public", imagePath)
        if (fs.existsSync(fullImagePath)) {
          fs.unlinkSync(fullImagePath)
        }
      })
    }

    // Delete the room from the database
    await Room.findByIdAndDelete(roomId)
    res.status(200).send({ status: "Room Deleted" })
  } catch (error) {
    res.status(500).send({ status: "Error deleting room", error: error.message })
  }
})

// Get a room by ID
router.get("/get/:id", async (req, res) => {
  const roomId = req.params.id

  try {
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).send({ status: "Room not found" })
    }
    res.status(200).send({ status: "Room fetched", room })
  } catch (error) {
    res.status(500).send({ status: "Error fetching room", error: error.message })
  }
})

// Delete a specific image from a room
router.delete("/image/:roomId/:imageIndex", async (req, res) => {
  try {
    const { roomId, imageIndex } = req.params
    const index = Number.parseInt(imageIndex)

    // Find the room
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    // Check if the image index is valid
    if (!room.images || index < 0 || index >= room.images.length) {
      return res.status(400).json({ error: "Invalid image index" })
    }

    // Get the image path to delete
    const imagePath = room.images[index]

    // Delete the image file
    const fullImagePath = path.join(__dirname, "../public", imagePath)
    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath)
    }

    // Remove the image path from the room's images array
    room.images.splice(index, 1)
    await room.save()

    res.status(200).json({ message: "Image deleted successfully", room })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.patch("/updateStatus/:roomNumber", async (req, res) => {
  const roomNumber = req.params.roomNumber
  const { status } = req.body

  // Ensure that the new status is provided
  if (!status) {
    return res.status(400).json({ error: "Status is required" })
  }

  try {
    // Find the room by its roomNumber and update the status
    const updatedRoom = await Room.findOneAndUpdate(
      { roomNumber }, // Find room by roomNumber
      { status }, // Update status
      { new: true }, // Return the updated document
    )

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" })
    }

    res.status(200).json({ message: "Room status updated", room: updatedRoom })
  } catch (error) {
    console.error("Error updating room status:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Export the router using ES6 export
export default router
