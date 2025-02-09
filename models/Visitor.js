const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate subscriptions
    trim: true,
    lowercase: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
