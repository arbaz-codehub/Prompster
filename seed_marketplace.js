const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/prompster')
  .then(() => seedData())
  .catch(err => console.log(err));

async function seedData() {
  console.log('Seeding Marketplace Items...');

  const items = [
    {
      title: "Mega SFX Pack Vol. 1",
      desc: "Over 500 high-quality sound effects for your videos. Includes transitions, impacts, swooshes, and ambient sounds.",
      type: "Other Assets",
      format: "WAV",
      price: 0,
      priceUsd: 0,
      isFree: true,
      isDailyDrop: true, // Should show 'Free for Today'
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
      tag: "Vol. 1",
      rating: 4.8,
      reviews: [{ user: "Alex T.", rating: 5, text: "Incredible quality for free!" }]
    },
    {
      title: "Cinematic LUTs Collection",
      desc: "Transform your footage into cinematic masterpieces with these 20 professional color grading LUTs.",
      type: "Other Assets",
      format: "Zip",
      price: 1499,
      priceUsd: 19.99,
      isFree: false,
      isPopular: true,
      image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop",
      tag: "Best Seller",
      rating: 4.9,
      category: "Editing Packs"
    },
    {
      title: "YouTube Thumbnail Templates",
      desc: "10 high-converting Photoshop templates for YouTube thumbnails. Easy to edit and fully customizable.",
      type: "Other Assets",
      format: "PSD",
      price: 499,
      priceUsd: 5.99,
      isFree: false,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
      tag: "v2.0",
      rating: 4.5,
      category: "Thumbnails"
    },
    {
      title: "Ultimate Glitch Overlays",
      desc: "Add futuristic glitch effects to your videos instantly. Drag and drop 4K overlays.",
      type: "Other Assets",
      format: "MP4",
      price: 999,
      priceUsd: 12.00,
      isFree: false,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
      tag: "4K",
      rating: 4.7,
      category: "Content Creation"
    }
  ];

  try {
    // Optionally clear old 'Other Assets' if desired, but adding is safer to keep existing prompts
    const result = await Product.insertMany(items);
    console.log(`Successfully added ${result.length} items.`);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
}
