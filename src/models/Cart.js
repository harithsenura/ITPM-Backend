const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [
    {
      giftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      giftType: {
        type: String,
        required: true,
        enum: ['individual', 'group']
      },
      groupSize: {
        type: Number,
        default: 1,
        min: [1, 'Group size must be at least 1']
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);
