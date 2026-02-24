// api.js - Fetches data from backend and populates global variables
// to maintain compatibility with existing frontend logic.

console.log('Initializing Prompster API Client...');

window.allPrompts = [];
window.marketplaceItems = [];
window.blogData = [];
window.siteContent = {};

async function fetchPrompsterData() {
  try {
    // 1. Fetch Products
    const productsResponse = await fetch('/api/products');
    const products = await productsResponse.json();

    // Split into prompts and assets based on type or just use all
    // The original logic separated them.
    window.allPrompts = products.filter(p => p.type === 'Prompts' || !p.type);
    window.marketplaceItems = products.filter(p => p.type === 'Asset' || p.type === 'Other Assets');

    // 2. Fetch Blogs
    const blogsResponse = await fetch('/api/blogs');
    window.blogData = await blogsResponse.json();

    // 3. Fetch Site Content
    const contentResponse = await fetch('/api/content');
    window.siteContent = await contentResponse.json();

    // 4. Fetch Categories
    const categoriesResponse = await fetch('/api/settings/categories');
    window.categories = await categoriesResponse.json();

    // 5. Fetch Formats
    const formatsResponse = await fetch('/api/settings/formats');
    window.formats = await formatsResponse.json();

    // 6. Fetch Prompt Categories
    const promptCategoriesResponse = await fetch('/api/settings/prompt_categories');
    window.promptCategories = await promptCategoriesResponse.json();

    console.log('Data fetched successfully');

    // Dispatch Event
    const event = new CustomEvent('PrompsterDataLoaded');
    document.dispatchEvent(event);

  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

// Start fetching immediately
fetchPrompsterData();
