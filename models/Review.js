const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  avatar: { type: String }, // URL string
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
