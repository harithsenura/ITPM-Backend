import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() {
        // Make user required only for food orders
        return this.orderType === "food";
      }
    },
    orderType: {
      type: String,
      enum: ["food", "gift"],
      default: "food", // Default to food for backward compatibility
    },
    items: [
      {
        gift: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Gift",
          required: function () {
            return this.orderType === "gift"
          },
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        giftType: {
          type: String,
          enum: ["individual", "group"],
          default: "individual",
        },
        groupSize: {
          type: Number,
          default: 1,
        },
        contributors: [String],
        // For food orders
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: function () {
            return this.orderType === "food"
          },
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentDetails: {
      cardLast4: String,
      cardBrand: String,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // For food orders
    tableNo: {
      type: Number,
      required: function () {
        return this.orderType === "food"
      },
    },
    customerName: {
      type: String,
      required: function () {
        return this.orderType === "food"
      },
    },
    contactNumber: {
      type: String,
      required: function () {
        return this.orderType === "food"
      },
    },
    email: String,
    cartItems: [
      {
        type: Object,
        required: function () {
          return this.orderType === "food"
        },
      },
    ],
    subTotal: Number,
    tax: Number,
    grandTotal: Number,
  },
  { timestamps: true },
)

const Order = mongoose.model("Order", OrderSchema)
export default Order