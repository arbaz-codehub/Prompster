const fs = require('fs');
const path = require('path');

const layoutFile = path.join(__dirname, 'views/admin/layout.ejs');
let layout = fs.readFileSync(layoutFile, 'utf8');

// 1. Move theme toggle right before 'Admin User' text
layout = layout.replace(
  /<button id="theme-toggle"[\s\S]*?<\/button>\s*<div class="flex items-center gap-4 border-l border-gray-200 dark:border-white\/10 pl-6">/g,
  `<div class="flex items-center gap-4 border-l border-gray-200 dark:border-white/10 pl-6">
                        <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors focus:outline-none flex items-center justify-center border border-transparent mr-2">
                            <span id="theme-toggle-light-icon" class="iconify hidden" data-icon="lucide:sun" data-width="20"></span>
                            <span id="theme-toggle-dark-icon" class="iconify hidden" data-icon="lucide:moon" data-width="20"></span>
                        </button>`
);

// 2. Fix active menu highlighting
// Just inject an inline style approach or refine the JS to use bg-black text-white
layout = layout.replace(
  /link\.classList\.add\('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black', 'font-medium', 'shadow-md'\);[\s\S]*?link\.classList\.remove\('hover:bg-gray-200', 'dark:hover:bg-gray-800', 'hover:text-black', 'dark:hover:text-white', 'text-gray-600', 'dark:text-gray-300'\);/g,
  `link.classList.add('bg-white', 'text-black', 'dark:bg-black', 'dark:text-white', 'font-medium', 'shadow-sm');
                    link.classList.remove('hover:bg-gray-200', 'dark:hover:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');`
);

fs.writeFileSync(layoutFile, layout, 'utf8');

// Products List
const productsListFile = path.join(__dirname, 'views/admin/products/list.ejs');
let prodList = fs.readFileSync(productsListFile, 'utf8');

// Fix invisible category tag
// It currently looks like: ... 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200/10 text-black dark:text-white border border-black dark:border-white/20' %>"
prodList = prodList.replace(/bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200\/10 text-black dark:text-white border border-black dark:border-white\/20/g, 'bg-gray-800 text-white dark:bg-gray-100 dark:text-black border border-transparent');

// Fix edit icon hover:
// <a href="/admin/products/<%= product._id %>/edit" class="p-2 text-black dark:text-white hover:bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200/10 rounded-lg transition-colors" title="Edit">
prodList = prodList.replace(/class="p-2 text-black dark:text-white hover:bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200\/10 rounded-lg transition-colors"/g, 'class="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"');

fs.writeFileSync(productsListFile, prodList, 'utf8');

// Blogs List
const blogsListFile = path.join(__dirname, 'views/admin/blogs/list.ejs');
let blogList = fs.readFileSync(blogsListFile, 'utf8');

// Blogs Edit Icon
blogList = blogList.replace(/class="p-2 text-black dark:text-white hover:bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200\/10 rounded-lg transition-colors"/g, 'class="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"');

// Fix blog categories spacing and text container
blogList = blogList.replace(
  /<span class="px-2\.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-white\/20">/g,
  '<span class="inline-block px-3 py-1.5 rounded text-xs font-semibold bg-gray-100 text-black dark:bg-[#222222] dark:text-white border border-gray-300 dark:border-gray-700 tracking-wide">'
);

fs.writeFileSync(blogsListFile, blogList, 'utf8');

console.log("Fixes applied successfully!");
