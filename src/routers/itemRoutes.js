import express from "express"
import Item from "../models/itemModel.js"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const router = express.Router()

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads/items")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Not an image! Please upload only images."), false)
  }
}

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter,
})

// Add Item Route
router.post("/add-item", async (req, res) => {
  try {
    const newItem = new Item(req.body)
    await newItem.save()
    res.status(200).send("Item added successfully")
  } catch (error) {
    console.log(error)
    res.status(500).send("Failed to add item")
  }
})

// Get All Items Route
router.get("/get-item", async (req, res) => {
  try {
    const items = await Item.find({})
    res.status(200).send(items)
  } catch (error) {
    console.log(error)
    res.status(500).send("Failed to get items")
  }
})

// Edit Item Route
router.put("/edit-item", async (req, res) => {
  try {
    const { itemId, ...updateData } = req.body

    const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, { new: true })

    if (!updatedItem) {
      return res.status(404).send("Item not found")
    }

    res.status(200).send("Item updated successfully")
  } catch (error) {
    console.log(error)
    res.status(500).send("Failed to update item")
  }
})

// Delete Item Route
router.delete("/delete-item/:id", async (req, res) => {
  const itemId = req.params.id

  try {
    const item = await Item.findByIdAndDelete(itemId)

    if (!item) {
      return res.status(404).send("Item not found")
    }

    // If the item has an image stored on the server, delete it
    if (item.image && item.image.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "..", item.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    res.status(200).send({ message: "Item deleted successfully", item })
  } catch (error) {
    console.log(error)
    res.status(500).send("Failed to delete item")
  }
})

// Upload Image Route
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an image" })
    }

    // Create the URL for the uploaded image
    const imageUrl = `/uploads/items/${req.file.filename}`

    res.status(200).send({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    res.status(500).send({
      message: "Failed to upload image",
      error: error.message,
    })
  }
})

// Add ingredients to an item
router.post("/add-ingredients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredients } = req.body;
    
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).send({ message: "Item not found" });
    }
    
    // Add new ingredients
    item.ingredients = ingredients;
    await item.save();
    
    res.status(200).send({ 
      message: "Ingredients added successfully", 
      item 
    });
  } catch (error) {
    console.error("Error adding ingredients:", error);
    res.status(500).send({
      message: "Failed to add ingredients",
      error: error.message,
    });
  }
});

// Get ingredients for an item
router.get("/ingredients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).send({ message: "Item not found" });
    }
    
    res.status(200).send(item.ingredients || []);
  } catch (error) {
    console.error("Error getting ingredients:", error);
    res.status(500).send({
      message: "Failed to get ingredients",
      error: error.message,
    });
  }
});

export default router
