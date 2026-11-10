const productData = require('../data/productData');

const FITS = ['oversized', 'boxy', 'regular', 'slim'];
const GENDERS = ['men', 'women', 'unisex'];

// A price must be a normal number between 0 and 100000, otherwise ignore it
function cleanPrice(value) {
    if (value === undefined || value === '') {
        return undefined;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 100000) {
        return undefined;
    }
    return n;
}

// Keep only filters that are safe and valid
function cleanFilters(query = {}) {
    const filters = {};

    const search = String(query.search || '').trim();
    if (search && search.length <= 100) {
        filters.search = search;
    }

    const minPrice = cleanPrice(query.minPrice);
    if (minPrice !== undefined) {
        filters.minPrice = minPrice;
    }
    const maxPrice = cleanPrice(query.maxPrice);
    if (maxPrice !== undefined) {
        filters.maxPrice = maxPrice;
    }

    if (FITS.includes(query.fit)) {
        filters.fit = query.fit;
    }
    if (GENDERS.includes(query.gender)) {
        filters.gender = query.gender;
    }

    const category = String(query.category || '').trim().toLowerCase();
    if (/^[a-z0-9-]{1,50}$/.test(category)) {
        filters.category = category;
    }

    return filters;
}

async function getAllProducts(query) {
    const products = await productData.getAllProducts(cleanFilters(query));
    const variants = await productData.getAllVariant();
    const images = await productData.getAllProductImage();

    const result = products.map((p) => ({
        ...p,
        id: p.product_id,
        Category: { name: p.category_name, slug: p.category_slug },
        variants: variants
            .filter((v) => v.product_id === p.product_id)
            .map((v) => ({
                ...v,
                id: v.variant_id,
                set: v.set_name
            })),
        images: images.filter((i) => i.product_id === p.product_id),
    }));

    return result;
}

module.exports = { getAllProducts };