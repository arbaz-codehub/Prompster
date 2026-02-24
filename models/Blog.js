const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  legacyId: { type: Number },
  title: { type: String, required: true },
  category: { type: String },
  image: { type: String },
  date: { type: String }, // Currently string in data, can parse to Date later if needed
  author: { type: String },
  summary: { type: String },
  fullContent: { type: String }, // HTML content
  displayOrder: { type: Number, default: 0 }, // Higher values display first
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);
