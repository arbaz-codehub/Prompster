// api.js - Fetches data from backend and populates global variables
// to maintain compatibility with existing frontend logic.

console.log('Initializing Prompster API Client...');

window.allPrompts = [];
window.marketplaceItems = [];
window.blogData = [];
window.siteContent = {};

const CACHE_KEY = 'prompster_api_cache_v1';

async function fetchPrompsterData() {
  // 1. Check for valid cache first (Stale-While-Revalidate)
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    try {
      const parsedCache = JSON.parse(cachedData);
      populateGlobals(parsedCache);
      console.log('API Client: Data served instantly from Cache.');
      // Dispatch immediately so the browser preloader can start downloading images
      document.dispatchEvent(new CustomEvent('PrompsterDataLoaded'));

      // Trigger background prefetch
      setTimeout(preloadCriticalAssets, 500);
    } catch (e) {
      console.error('Cache parsing failed, fetching fresh data', e);
    }
  }

  // 2. Fetch Fresh Data (Concurrent Request Execution)
  try {
    const [
      productsResponse,
      blogsResponse,
      contentResponse,
      categoriesResponse,
      formatsResponse,
      promptCategoriesResponse
    ] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/blogs'),
      fetch('/api/content'),
      fetch('/api/settings/categories'),
      fetch('/api/settings/formats'),
      fetch('/api/settings/prompt_categories')
    ]);

    const products = await productsResponse.json();
    const parsedData = {
      products,
      blogs: await blogsResponse.json(),
      content: await contentResponse.json(),
      categories: await categoriesResponse.json(),
      formats: await formatsResponse.json(),
      promptCategories: await promptCategoriesResponse.json()
    };

    // 3. Compare and Update Cache/Globals
    const newCacheString = JSON.stringify(parsedData);
    if (newCacheString !== cachedData) {
      populateGlobals(parsedData);
      localStorage.setItem(CACHE_KEY, newCacheString);
      console.log('API Client: Data updated and cached successfully.');

      // If we didn't have cached data initially, dispatch the event now
      if (!cachedData) {
        document.dispatchEvent(new CustomEvent('PrompsterDataLoaded'));
        setTimeout(preloadCriticalAssets, 500);
      } else {
        // Dispatch update event if UI wants to hot-reload values
        document.dispatchEvent(new CustomEvent('PrompsterDataUpdated'));
      }
    }
  } catch (err) {
    console.error('API Client: Error fetching data concurrently:', err);
    // Unblock the UI loader just in case cache and network both failed
    if (!cachedData) {
      document.dispatchEvent(new CustomEvent('PrompsterDataLoaded'));
    }
  }
}

function populateGlobals(data) {
  const products = data.products || [];
  window.allPrompts = products.filter(p => p.type === 'Prompts' || !p.type);
  window.marketplaceItems = products.filter(p => p.type === 'Asset' || p.type === 'Other Assets');
  window.blogData = data.blogs || [];
  window.siteContent = data.content || {};
  window.categories = data.categories || [];
  window.formats = data.formats || [];
  window.promptCategories = data.promptCategories || [];
}

// Preload highest priority images for instant transition handling
function preloadCriticalAssets() {
  const imagesToLoad = new Set();
  const combineItems = [...window.allPrompts, ...window.marketplaceItems];

  // Best Seller
  const bestSeller = combineItems.find(p => p.isBestSeller);
  if (bestSeller && bestSeller.image) imagesToLoad.add(bestSeller.image);
  else if (window.siteContent && window.siteContent.bestSeller && window.siteContent.bestSeller.image) imagesToLoad.add(window.siteContent.bestSeller.image);

  // Daily Drop
  const dailyDrop = combineItems.find(p => p.isDailyDrop);
  if (dailyDrop && dailyDrop.image) imagesToLoad.add(dailyDrop.image);
  else if (window.siteContent && window.siteContent.dailyDrop && window.siteContent.dailyDrop.image) imagesToLoad.add(window.siteContent.dailyDrop.image);

  // Popular items (first 3)
  const popular = window.allPrompts.filter(p => p.isPopular).slice(0, 3);
  popular.forEach(p => { if (p.image) imagesToLoad.add(p.image); });

  // Start preloading
  imagesToLoad.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  console.log('API Client: Started background preload of top images');
}

// Start fetching immediately
fetchPrompsterData();
