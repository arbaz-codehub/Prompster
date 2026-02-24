const mongoose = require('mongoose');

const userEmailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  downloadLink: { type: String },
  downloadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserEmail', userEmailSchema);
