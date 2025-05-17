import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true,
    enum: ["Single", "Double", "VIP", "King", "Flex"],
  },
  price: {
    type: Number,
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  facilities: {
    type: String,
    required: true,
  },
  bedType: {
    type: String,
    required: true,
    enum: ["Single Bed", "Double Bed"],
  },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Reserved", "Booked"],
    default: "Available",
  },
  // Updated to support multiple images
  images: {
    type: [String], // Array of image paths
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Room = mongoose.model("Room", roomSchema)

export default Room
