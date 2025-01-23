const mongoose = require('mongoose');

const vendingMachineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  stock: [{
    itemName: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    imageUrl: {  // Added imageUrl field to store the image URL
      type: String,
      required: false // Make it optional, in case the image is not available
    }
  }]
});

module.exports = mongoose.model('VendingMachine', vendingMachineSchema);
