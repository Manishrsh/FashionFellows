const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  iteam: { type: String, required: true },
  prize: { type: Number, required: true },
  quantity: { type: Number, required: true },
  discount: { type: Number, required: true }
});

const billSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxLength: 80
  },
  mobileNumber: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 12
  },
  items: [itemSchema], // Embed the item schema as an array
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
