import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_URL = 'https://authentimart.onrender.com/api/v1';
const SITE_URL = 'https://www.authentimart.com';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');

const staticRoutes = [
    '/',
    '/products',
    '/login',
    '/register',
    '/forgot-password',
    '/returns',
    '/faq',
    '/contact',
    '/size-guide'
];

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getAllProducts() {
    let allProducts = [];
    let page = 1;
    let totalPages = 1;

    console.log('Fetching products...');

    do {
        const data = await fetchData(`/products?page=${page}&page_size=50`);
        if (!data || !data.items) break;

        allProducts = [...allProducts, ...data.items];
        totalPages = data.total_pages;
        console.log(`Fetched page ${page} of ${totalPages}`);
        page++;
    } while (page <= totalPages);

    return allProducts;
}

async function generateSitemap() {
    console.log('Starting sitemap generation...');

    // 1. Static Routes
    let urls = [...staticRoutes];

    // 2. Categories
    console.log('Fetching categories...');
    const categories = await fetchData('/categories');
    if (categories) {
        categories.forEach(cat => {
            urls.push(`/products/${cat.slug}`);
        });
    }

    // 3. Products
    const products = await getAllProducts();
    if (products) {
        products.forEach(prod => {
            urls.push(`/product/${prod.slug}`);
        });
    }

    // 4. Flash Sales
    console.log('Fetching flash sales...');
    const flashSales = await fetchData('/flash-sales');
    if (flashSales) {
        // flashSales is likely an array
        const sales = Array.isArray(flashSales) ? flashSales : (flashSales.items || []);
        sales.forEach(sale => {
            urls.push(`/flash-sale/${sale.slug || sale.id}`); // Assuming slug exists, otherwise verify
        });
    }

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <changefreq>${url === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

    // Write to file
    const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log(`Sitemap generated successfully at ${sitemapPath} with ${urls.length} URLs.`);
}

generateSitemap();
