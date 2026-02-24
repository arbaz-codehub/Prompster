const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  identifier: { type: String, unique: true, default: 'main' }, // Singleton identifier
  hero: {
    tagline: String,
    title: String,
    description: String,
    cta: String
  },
  aboutHero: {
    tagline: String,
    title: String,
    description: String
  },
  bestSeller: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    rank: String,
    tag: String,
    productName: String,
    price: Number,
    image: String
  },
  dailyDrop: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    name: String,
    description: String,
    badge: String,
    image: String
  },
  featuredCollection: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    description: String,
    price: Number
  },
  mission: {
    title: String,
    description1: String,
    description2: String,
    stats: [{ value: String, label: String }],
    image: String
  },
  whyChooseUs: [{
    icon: String,
    color: String,
    title: String,
    description: String
  }],
  team: [{
    name: String,
    role: String,
    roleColor: String,
    bio: String,
    image: String,
    borderHover: String
  }],
  reviews: [{
    name: String,
    role: String,
    image: String,
    stars: Number,
    text: String
  }]
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
