const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Product = require('../models/Product');
const Blog = require('../models/Blog');
const SiteContent = require('../models/SiteContent');
const Setting = require('../models/Setting');
const Review = require('../models/Review');

// Auth Middleware
router.use(async (req, res, next) => {
  const publicPaths = ['/login', '/reset-password', '/logout'];
  if (publicPaths.includes(req.path)) {
    return next();
  }
  if (req.session && req.session.role) {
    res.locals.adminRole = req.session.role;
    // Role check
    if (req.session.role === 'blog_author') {
      if (req.path.startsWith('/blogs') || req.path === '/logout') {
        return next();
      } else {
        return res.redirect('/admin/blogs');
      }
    }
    return next();
  }
  res.redirect('/admin/login');
});

// GET Login
router.get('/login', async (req, res) => {
  const msg = req.query.msg;
  res.render('admin/login', { error: msg || null, resetError: null, showReset: (req.session.failedAttempts >= 3) });
});

// POST Login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  let admin_pwd = await Setting.findOne({ key: 'admin_password' });
  let blog_pwd = await Setting.findOne({ key: 'blog_password' });

  // Seed default admin password if not present
  if (!admin_pwd) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Halima786@123##';
    const hash = await bcrypt.hash(defaultPassword, 10);
    admin_pwd = await Setting.create({ key: 'admin_password', values: [hash] });
  }

  // Check admin password
  const isAdmin = await bcrypt.compare(password, admin_pwd.values[0]);
  if (isAdmin) {
    req.session.role = 'admin';
    req.session.failedAttempts = 0;
    return res.redirect('/admin');
  }

  // Check blog password
  if (blog_pwd && blog_pwd.values && blog_pwd.values.length > 0) {
    const isBlogAuthor = await bcrypt.compare(password, blog_pwd.values[0]);
    if (isBlogAuthor) {
      req.session.role = 'blog_author';
      req.session.failedAttempts = 0;
      return res.redirect('/admin/blogs');
    }
  }

  // Failed login
  req.session.failedAttempts = (req.session.failedAttempts || 0) + 1;
  let showReset = req.session.failedAttempts >= 3;

  res.render('admin/login', { error: 'Incorrect password', resetError: null, showReset });
});

// POST Reset Password
router.post('/reset-password', async (req, res) => {
  const { secretKey, newPassword } = req.body;
  const resetSecret = process.env.ADMIN_RESET_SECRET_KEY || '13/08/2003';
  if (secretKey === resetSecret) {
    const hash = await bcrypt.hash(newPassword, 10);
    await Setting.findOneAndUpdate({ key: 'admin_password' }, { values: [hash] }, { upsert: true });
    req.session.failedAttempts = 0;
    return res.redirect('/admin/login?msg=Password+Reset+Successfully');
  } else {
    res.render('admin/login', { error: null, resetError: 'Incorrect secret key', showReset: true });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Dashboard
router.get('/', async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const blogsCount = await Blog.countDocuments();
    const reviewsCount = await Review.countDocuments();
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);

    res.render('admin/layout', {
      body: await renderView('admin/dashboard', { stats: { productsCount, blogsCount, reviewsCount }, recentProducts }),
      pageTitle: 'Dashboard'
    });
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    res.status(500).send('Server Error');
  }
});

// Helper function to render partial view into string
const ejs = require('ejs');
const path = require('path');
async function renderView(viewName, data) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(path.join(__dirname, '../views', viewName + '.ejs'), data, (err, str) => {
      if (err) reject(err);
      else resolve(str);
    });
  });
}

// --- HELPER FOR SETTINGS ---
async function getProductSettings() {
  const types = await Setting.findOne({ key: 'product_types' });
  const formats = await Setting.findOne({ key: 'product_formats' });
  const categories = await Setting.findOne({ key: 'product_categories' });
  const promptCategories = await Setting.findOne({ key: 'prompt_categories' });

  // Default values
  const typeOptions = types ? types.values : ['Prompts', 'Other Assets'];
  const categoryOptions = categories ? categories.values : ['Prompts', 'Editing Packs', 'Thumbnails', 'Music/SFX', 'Content Creation Packs'];
  const formatOptions = formats ? formats.values : ['Text', 'PDF', 'Image', 'Video', 'Zip'];
  const promptCategoryOptions = promptCategories ? promptCategories.values : ['Image', 'ChatGPT', 'Claude', 'Video', 'Coding'];

  return { typeOptions, categoryOptions, formatOptions, promptCategoryOptions };
}


// --- PRODUCTS ROUTES ---

// List Products
router.get('/products', async (req, res) => {
  const products = await Product.find().sort({ displayOrder: -1, createdAt: -1 });
  res.render('admin/layout', {
    body: await renderView('admin/products/list', { products }),
    pageTitle: 'Products'
  });
});

// New Product Form
router.get('/products/new', async (req, res) => {
  const { typeOptions, categoryOptions, formatOptions, promptCategoryOptions } = await getProductSettings();
  res.render('admin/layout', {
    body: await renderView('admin/products/form', { product: {}, action: '/admin/products', typeOptions, categoryOptions, formatOptions, promptCategoryOptions }),
    pageTitle: 'New Product'
  });
});

// Helper to handle exclusivity
async function handleExclusivity(productData, currentId = null) {
  // 1. Ensure a product can only have ONE tag active at a time
  // Priority: Best Seller > Daily Drop > Featured (if multiple sent, though UI should prevent it)
  // Actually, since they are checkboxes, user might check multiple. We should strictly enforce one.
  // However, usually we just let the last one win or checking one unchecks others in UI.
  // Backend enforcement:
  if (productData.isBestSeller) {
    productData.isDailyDrop = false;
    productData.isFeatured = false;
  } else if (productData.isDailyDrop) {
    productData.isFeatured = false;
    productData.isBestSeller = false; // Already false locally, but good for clarity
  } else if (productData.isFeatured) {
    productData.isBestSeller = false;
    productData.isDailyDrop = false;
  }

  // 2. Global Exclusivity (Only one product in DB can hold the tag)
  if (productData.isBestSeller) {
    await Product.updateMany({ _id: { $ne: currentId }, isBestSeller: true }, { isBestSeller: false });
  }
  if (productData.isDailyDrop) {
    await Product.updateMany({ _id: { $ne: currentId }, isDailyDrop: true }, { isDailyDrop: false });
  }
  if (productData.isFeatured) {
    await Product.updateMany({ _id: { $ne: currentId }, isFeatured: true }, { isFeatured: false });
  }
}

// Create Product
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;

    // Checkboxes (Unchecked are undefined)
    productData.isFree = !!productData.isFree;
    productData.isBestSeller = !!productData.isBestSeller;
    productData.isDailyDrop = !!productData.isDailyDrop;
    productData.isFeatured = !!productData.isFeatured;
    productData.isPopular = !!productData.isPopular;
    productData.isDigitalAsset = !!productData.isDigitalAsset;
    productData.displayOrder = Number(productData.displayOrder) || 0;

    // Numbers
    productData.price = productData.price ? Number(productData.price) : 0;
    productData.priceUsd = productData.priceUsd ? Number(productData.priceUsd) : 0;
    productData.discountPercentage = productData.discountPercentage ? Number(productData.discountPercentage) : 0;

    // Parse array
    if (typeof productData.whatsInside === 'string') {
      productData.whatsInside = productData.whatsInside.split(',').map(s => s.trim()).filter(s => s);
    }

    // Manual Review Handling
    if (productData.reviewUser && productData.reviewText) {
      productData.reviews = [{
        user: productData.reviewUser,
        text: productData.reviewText,
        rating: Number(productData.reviewRating) || 5
      }];
    }

    await handleExclusivity(productData);

    await Product.create(productData);
    res.redirect('/admin/products?msg=Product+Created+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating product');
  }
});

// Edit Product Form
router.get('/products/:id/edit', async (req, res) => {
  const product = await Product.findById(req.params.id);
  const { typeOptions, categoryOptions, formatOptions, promptCategoryOptions } = await getProductSettings();
  res.render('admin/layout', {
    body: await renderView('admin/products/form', { product, action: `/admin/products/${product._id}`, typeOptions, categoryOptions, formatOptions, promptCategoryOptions }),
    pageTitle: 'Edit Product'
  });
});

// Update Product
router.post('/products/:id', async (req, res) => {
  try {
    const productData = req.body;

    // Checkboxes
    productData.isFree = !!productData.isFree;
    productData.isBestSeller = !!productData.isBestSeller;
    productData.isDailyDrop = !!productData.isDailyDrop;
    productData.isFeatured = !!productData.isFeatured;
    productData.isPopular = !!productData.isPopular;
    productData.isDigitalAsset = !!productData.isDigitalAsset;
    productData.displayOrder = Number(productData.displayOrder) || 0;

    // Numbers
    productData.price = productData.price ? Number(productData.price) : 0;
    productData.priceUsd = productData.priceUsd ? Number(productData.priceUsd) : 0;
    productData.discountPercentage = productData.discountPercentage ? Number(productData.discountPercentage) : 0;

    if (typeof productData.whatsInside === 'string') {
      productData.whatsInside = productData.whatsInside.split(',').map(s => s.trim()).filter(s => s);
    }

    await handleExclusivity(productData, req.params.id);

    // Cancelled Review Addition (Append to existing)
    if (productData.reviewUser && productData.reviewText) {
      const newReview = {
        user: productData.reviewUser,
        text: productData.reviewText,
        rating: Number(productData.reviewRating) || 5
      };

      // We need to use $push for atomic update or push to array if we are replacing the whole object
      // Since we are using findByIdAndUpdate with the whole object, let's fetch first or use $push
      // Easier here: fetch current, push, save. OR just add to productData.reviews if we want to replace.
      // But productData won't have the existing reviews unless we include them in hidden fields (messy).
      // BETTER STRATEGY: Use MongoDB update operator to push if review data exists, 
      // and update the rest of the fields.

      // Let's do a 2-step for safety or just use $push in the update
      const updateOp = { $set: productData };
      // Delete reviews from $set to avoid overwriting with empty/undefined if not passed
      delete updateOp.$set.reviews;

      // But wait, Product.findByIdAndUpdate(id, productData) replaces fields.
      // If I just pass productData, and it doesn't contain 'reviews', it won't overwrite 'reviews' field in Mongoose 
      // UNLESS I explicitly set it.
      // However, to ADD a review, I should use $push.

      await Product.findByIdAndUpdate(req.params.id, productData);
      await Product.findByIdAndUpdate(req.params.id, {
        $push: { reviews: newReview }
      });

    } else {
      await Product.findByIdAndUpdate(req.params.id, productData);
    }

    res.redirect('/admin/products?msg=Product+Updated+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating product');
  }
});

// Duplicate Product
router.post('/products/:id/duplicate', async (req, res) => {
  try {
    const original = await Product.findById(req.params.id);
    if (!original) return res.status(404).send('Product not found');

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.displayOrder = 0; // Reset order or keep it? Keeping it 0 makes it clear it's new

    // Clear flags so we don't accidentally make two Best Sellers, etc. unless desired, but safer to clear
    duplicateData.isDailyDrop = false;
    duplicateData.isBestSeller = false;
    duplicateData.isFeatured = false;

    await Product.create(duplicateData);
    res.redirect('/admin/products?msg=Product+Duplicated+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error duplicating product');
  }
});

// Delete Product
router.post('/products/:id/delete', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products?msg=Product+Deleted+Successfully');
});


// --- BLOGS ROUTES ---

// List Blogs
router.get('/blogs', async (req, res) => {
  const blogs = await Blog.find().sort({ displayOrder: -1, createdAt: -1 });
  res.render('admin/layout', {
    body: await renderView('admin/blogs/list', { blogs }),
    pageTitle: 'Blogs'
  });
});

// New Blog Form
router.get('/blogs/new', async (req, res) => {
  res.render('admin/layout', {
    body: await renderView('admin/blogs/form', { blog: {}, action: '/admin/blogs' }),
    pageTitle: 'New Blog'
  });
});

// Create Blog
router.post('/blogs', async (req, res) => {
  req.body.displayOrder = Number(req.body.displayOrder) || 0;
  await Blog.create(req.body);
  res.redirect('/admin/blogs?msg=Blog+Created+Successfully');
});

// Edit Blog Form
router.get('/blogs/:id/edit', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render('admin/layout', {
    body: await renderView('admin/blogs/form', { blog, action: `/admin/blogs/${blog._id}` }),
    pageTitle: 'Edit Blog'
  });
});

// Update Blog
router.post('/blogs/:id', async (req, res) => {
  req.body.displayOrder = Number(req.body.displayOrder) || 0;
  await Blog.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/admin/blogs?msg=Blog+Updated+Successfully');
});

// Duplicate Blog
router.post('/blogs/:id/duplicate', async (req, res) => {
  try {
    const original = await Blog.findById(req.params.id);
    if (!original) return res.status(404).send('Blog not found');

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.displayOrder = 0; // Reset order

    await Blog.create(duplicateData);
    res.redirect('/admin/blogs?msg=Blog+Duplicated+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error duplicating blog');
  }
});

// Delete Blog
router.post('/blogs/:id/delete', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/admin/blogs?msg=Blog+Deleted+Successfully');
});


// --- REVIEWS ROUTES ---

// List Reviews
router.get('/reviews', async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.render('admin/layout', {
    body: await renderView('admin/reviews/list', { reviews }),
    pageTitle: 'Reviews'
  });
});

// New Review Form
router.get('/reviews/new', async (req, res) => {
  res.render('admin/layout', {
    body: await renderView('admin/reviews/form', { review: {}, action: '/admin/reviews' }),
    pageTitle: 'New Review'
  });
});

// Create Review
router.post('/reviews', async (req, res) => {
  try {
    await Review.create(req.body);
    res.redirect('/admin/reviews?msg=Review+Created+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating review');
  }
});

// Edit Review Form
router.get('/reviews/:id/edit', async (req, res) => {
  const review = await Review.findById(req.params.id);
  res.render('admin/layout', {
    body: await renderView('admin/reviews/form', { review, action: `/admin/reviews/${review._id}` }),
    pageTitle: 'Edit Review'
  });
});

// Update Review
router.post('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/admin/reviews?msg=Review+Updated+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating review');
  }
});

// Delete Review
router.post('/reviews/:id/delete', async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.redirect('/admin/reviews?msg=Review+Deleted+Successfully');
});


// --- SITE CONTENT ROUTES ---

// Edit Content Form
router.get('/content', async (req, res) => {
  // Ensure content exists
  let content = await SiteContent.findOne({ identifier: 'main' });
  if (!content) {
    content = await SiteContent.create({ identifier: 'main' });
  }
  res.render('admin/layout', {
    body: await renderView('admin/content/index', { content }),
    pageTitle: 'Site Content'
  });
});

// Update Content
router.post('/content', async (req, res) => {
  try {
    await SiteContent.findOneAndUpdate({ identifier: 'main' }, req.body, { upsert: true, new: true });
    res.redirect('/admin/content?msg=Site+Content+Updated+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating content');
  }
});


// --- SETTINGS ROUTES (For Dropdowns) ---
router.get('/settings', async (req, res) => {
  const types = await Setting.findOne({ key: 'product_types' });
  const formats = await Setting.findOne({ key: 'product_formats' });
  const categories = await Setting.findOne({ key: 'product_categories' });
  const promptCategories = await Setting.findOne({ key: 'prompt_categories' });
  const blogPwd = await Setting.findOne({ key: 'blog_password' });

  // Pass raw strings for textarea editing
  const typeValues = types ? types.values.join(', ') : 'Prompts, Other Assets';
  const formatValues = formats ? formats.values.join(', ') : 'Text, PDF, Image, Video, Zip';
  const categoryValues = categories ? categories.values.join(', ') : 'Prompts, Editing Packs, Thumbnails, Music/SFX, Content Creation Packs';
  const promptCategoryValues = promptCategories ? promptCategories.values.join(', ') : 'Image, ChatGPT, Claude, Video, Coding';
  const blogPwdIsSet = !!(blogPwd && blogPwd.values && blogPwd.values.length > 0);

  res.render('admin/layout', {
    body: await renderView('admin/settings/index', { typeValues, formatValues, categoryValues, promptCategoryValues, blogPwdIsSet }),
    pageTitle: 'Settings'
  });
});

router.post('/settings', async (req, res) => {
  try {
    const { product_types, product_formats, product_categories, prompt_categories, blog_password } = req.body;

    await Setting.findOneAndUpdate(
      { key: 'product_types' },
      { values: product_types.split(',').map(s => s.trim()).filter(Boolean), label: 'Product Types' },
      { upsert: true, new: true }
    );

    await Setting.findOneAndUpdate(
      { key: 'product_formats' },
      { values: product_formats.split(',').map(s => s.trim()).filter(Boolean), label: 'Product Formats' },
      { upsert: true, new: true }
    );

    await Setting.findOneAndUpdate(
      { key: 'product_categories' },
      { values: product_categories.split(',').map(s => s.trim()).filter(Boolean), label: 'Product Categories' },
      { upsert: true, new: true }
    );

    if (prompt_categories) {
      await Setting.findOneAndUpdate(
        { key: 'prompt_categories' },
        { values: prompt_categories.split(',').map(s => s.trim()).filter(Boolean), label: 'Prompt Categories' },
        { upsert: true, new: true }
      );
    }

    if (blog_password && blog_password.trim() !== '') {
      const hash = await bcrypt.hash(blog_password.trim(), 10);
      await Setting.findOneAndUpdate({ key: 'blog_password' }, { values: [hash], label: 'Blog Password' }, { upsert: true });
    }

    res.redirect('/admin/settings?msg=Settings+Updated+Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving settings');
  }
});

module.exports = router;
