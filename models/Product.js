const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  legacyId: { type: Number }, // To store the original integer ID for reference
  title: { type: String, required: true },
  desc: { type: String },
  type: { type: String }, // e.g., "Prompts", "Editing Packs"
  format: { type: String }, // e.g., "Text", "PDF"

  // Pricing & Links
  price: { type: Number, default: 0 }, // INR Base Price
  priceUsd: { type: Number, default: 0 }, // USD Base Price
  discountPercentage: { type: Number, default: 0 }, // 0 to 100
  linkInr: { type: String }, // Payment Link INR
  linkUsd: { type: String }, // Payment Link USD
  isFree: { type: Boolean, default: false }, // If true, hide price, show email capture settings

  // Exclusivity Flags
  isBestSeller: { type: Boolean, default: false },
  isDailyDrop: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isDigitalAsset: { type: Boolean, default: false },
  downloadLink: { type: String }, // For Free/Digital items

  rating: { type: Number, default: 0 },
  image: { type: String }, // URL string
  hook: { type: String },
  whatsInside: [String],
  tag: { type: String }, // e.g., "GPT-4"
  category: { type: String },
  subCategory: { type: String },
  author: {
    name: String,
    initials: String,
    colorBg: String,
    colorText: String
  },
  reviews: [{
    user: String,
    text: String,
    rating: Number
  }],
  meta: { type: String }, // For digital assets like "Size: 420MB"
  displayOrder: { type: Number, default: 0 }, // Higher values display first
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
