const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Blog = require('../models/Blog');
const SiteContent = require('../models/SiteContent');

// Middleware to apply Cache-Control headers to all GET routes in the API
router.use((req, res, next) => {
  if (req.method === 'GET') {
    // Cache for 60 seconds, serve stale content for up to 5 minutes while revalidating in the background
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }
  next();
});

// GET /api/products
router.get('/products', async (req, res) => {
  try {
    const { type, category } = req.query;
    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;

    const products = await Product.find(query).sort({ displayOrder: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blogs
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ displayOrder: -1, createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blogs/:id
router.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/content
const Setting = require('../models/Setting');

// Route to get product categories for frontend
router.get('/settings/categories', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'product_categories' });
    const categories = setting ? setting.values : ['Prompts', 'Editing Packs', 'Thumbnails', 'Music/SFX', 'Content Creation Packs'];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// Route to get product formats for frontend
router.get('/settings/formats', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'product_formats' });
    const formats = setting ? setting.values : ['Text', 'PDF', 'Image', 'Video', 'Zip'];
    res.json(formats);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching formats' });
  }
});

// Route to get prompt categories for frontend
router.get('/settings/prompt_categories', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'prompt_categories' });
    const categories = setting ? setting.values : ['Image', 'ChatGPT', 'Claude', 'Video', 'Coding'];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching prompt categories' });
  }
});

// GET /api/content
router.get('/content', async (req, res) => {
  try {
    // 1. Fetch SiteContent (base/static/manual)
    let content = await SiteContent.findOne({ identifier: 'main' }).lean(); // Use .lean() for plain object

    if (!content) {
      // Create default structure if not exists, though ideally Seed should handle this
      content = { identifier: 'main', bestSeller: {}, dailyDrop: {}, featuredCollection: {}, aboutHero: {}, mission: { stats: [] }, whyChooseUs: [], team: [] };
    } else {
      content.aboutHero = content.aboutHero || {};
      content.mission = content.mission || { stats: [] };
      content.whyChooseUs = content.whyChooseUs || [];
      content.team = content.team || [];
    }

    // 2. Dynamic Override from Products
    // Find live products flagged as special
    const specialProducts = await Product.find({
      $or: [{ isBestSeller: true }, { isDailyDrop: true }, { isFeatured: true }]
    }).lean();

    const bestSeller = specialProducts.find(p => p.isBestSeller);
    const dailyDrop = specialProducts.find(p => p.isDailyDrop);
    const featured = specialProducts.find(p => p.isFeatured);

    // Apply Overrides if products exist
    if (bestSeller) {
      content.bestSeller = {
        ...content.bestSeller, // Keep static fields like 'rank' or 'tag' if not overridden
        title: bestSeller.title,
        productName: bestSeller.title,
        image: bestSeller.image,
        price: bestSeller.price,
        productId: bestSeller._id,
        tag: bestSeller.tag || 'Popular'
      };
    }

    if (dailyDrop) {
      content.dailyDrop = {
        ...content.dailyDrop,
        title: 'Daily Free Drop',
        name: dailyDrop.title,
        description: dailyDrop.desc || dailyDrop.description,
        image: dailyDrop.image,
        productId: dailyDrop._id,
        badge: 'Limited Time Free'
      };
    }

    if (featured) {
      content.featuredCollection = {
        ...content.featuredCollection,
        title: featured.title,
        description: featured.desc || featured.description,
        price: featured.price,
        productId: featured._id
      };
    }

    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const Review = require('../models/Review');
const UserEmail = require('../models/UserEmail');

// GET /api/reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email, productId } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Save email
    await UserEmail.create({ email, productId });

    // Get download link if product associated
    let downloadLink = null;
    if (productId) {
      const product = await Product.findById(productId);
      if (product) downloadLink = product.downloadLink;
    }

    res.json({ success: true, downloadLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error subscribing' });
  }
});

module.exports = router;
