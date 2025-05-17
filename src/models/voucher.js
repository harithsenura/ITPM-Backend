import mongoose from "mongoose"

const voucherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    validityPeriod: {
      type: String,
      default: "12 months",
    },
    type: {
      type: String,
      enum: ["Experience", "Gift Card", "Product", "Service"],
      default: "Experience",
    },
    sold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Voucher = mongoose.model("Voucher", voucherSchema)

export default Voucher
