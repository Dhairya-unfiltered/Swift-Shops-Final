const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendingMachine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendingMachine',
    required: false
  },
  items: [{
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    imageUrl: {  // Added imageUrl field to store image URL for each item
      type: String,
      required: false  // Optional field
    }
  }]
});

module.exports = mongoose.model('Cart', cartSchema);
