const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., "product_types", "product_formats"
  values: [String], // Array of strings like ["Prompts", "Assets", "Bundles"]
  label: { type: String } // Human readable label
});

module.exports = mongoose.model('Setting', settingSchema);
