import mongoose from "mongoose"

const giftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sold: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "purchased"],
      default: "available",
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reservedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Add a method to check if a gift is available
giftSchema.methods.isAvailable = function () {
  return this.status === "available"
}

// Add a method to reserve a gift
giftSchema.methods.reserve = function (userId) {
  if (this.status !== "available") {
    return false
  }

  this.status = "reserved"
  this.reservedBy = userId
  this.reservedAt = new Date()
  return true
}

// Add a method to release a reservation
giftSchema.methods.releaseReservation = function () {
  if (this.status !== "reserved") {
    return false
  }

  this.status = "available"
  this.reservedBy = null
  this.reservedAt = null
  return true
}

// Add a method to mark a gift as purchased
giftSchema.methods.markAsPurchased = function () {
  if (this.status !== "reserved") {
    return false
  }

  this.status = "purchased"
  return true
}

const Gift = mongoose.model("Gift", giftSchema)
export default Gift
