const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    type: String,
    vendingMachine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VendingMachine', 
            required: false
        },
});

module.exports = mongoose.model('User', userSchema);