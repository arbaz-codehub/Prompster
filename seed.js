const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const Blog = require('./models/Blog');
const SiteContent = require('./models/SiteContent');
require('dotenv').config();

mongoose.connect('mongodb://127.0.0.1:27017/prompster')
  .then(async () => {
    console.log('MongoDB Connected for Seeding');

    // Clear Collections
    await Product.deleteMany({});
    await Blog.deleteMany({});
    await SiteContent.deleteMany({});
    console.log('Collections Cleared');

    // Load Data using eval (hacky but effective for migration)
    const loadData = (filePath) => {
      let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
      // Replace const with var to ensure scope availability in eval
      content = content.replace(/const /g, 'var ');
      return content;
    };

    eval(loadData('data/products.js'));
    eval(loadData('data/blogs.js'));
    eval(loadData('data/siteContent.js'));

    // 1. Seed Products
    // Consolidate allPrompts and marketplaceItems
    // Add legacyId
    const productsToInsert = [
      ...allPrompts.map(p => ({ ...p, legacyId: p._id, _id: undefined, type: p.type || "Prompts" })),
      ...marketplaceItems.map(p => ({ ...p, legacyId: p._id, _id: undefined, type: p.type || "Asset" }))
    ];

    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`Seeded ${createdProducts.length} Products`);

    // 2. Seed Blogs
    const blogsToInsert = blogData.map(b => ({ ...b, legacyId: b._id, _id: undefined }));
    await Blog.insertMany(blogsToInsert);
    console.log(`Seeded ${blogsToInsert.length} Blogs`);

    // 3. Seed SiteContent
    // Map legacy product IDs to new ObjectIds
    const getNewId = (legacyId) => {
      const prod = createdProducts.find(p => p.legacyId === legacyId);
      return prod ? prod._id : null;
    };

    if (siteContent.bestSeller && siteContent.bestSeller.productId) {
      siteContent.bestSeller.productId = getNewId(siteContent.bestSeller.productId);
    }
    if (siteContent.dailyDrop && siteContent.dailyDrop.productId) {
      siteContent.dailyDrop.productId = getNewId(siteContent.dailyDrop.productId);
    }
    if (siteContent.featuredCollection && siteContent.featuredCollection.productId) {
      siteContent.featuredCollection.productId = getNewId(siteContent.featuredCollection.productId);
    }

    // Insert SiteContent
    await SiteContent.create(siteContent);
    console.log('Seeded SiteContent');

    console.log('Seeding Complete');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
