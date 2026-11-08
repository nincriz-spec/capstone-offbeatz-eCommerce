const productAdminData = require('../data/productAdminData');

const fitOptions = ['oversized', 'boxy', 'regular', 'slim'];
const genderOptions = ['men', 'women', 'unisex'];

// Clean one text field: trim it, check the length, empty becomes null
function cleanText(value, max, label, required) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (required && !text) {
        throw new Error(label + ' is required');
    }
    if (text.length > max) {
        throw new Error(label + ' is too long (max ' + max + ' characters)');
    }
    return text || null;
}

// Check the whole form. Throws an Error with a friendly message if something is wrong.
function cleanProduct(form, categories) {
    const name = cleanText(form.name, 255, 'Name', true);
    const description = cleanText(form.description, 5000, 'Description', false);
    const fabric = cleanText(form.fabric, 80, 'Fabric', false);
    const dropName = cleanText(form.drop_name, 80, 'Drop name', false);
    const care = cleanText(form.care_instructions, 255, 'Care instructions', false);

    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price <= 0 || price > 100000) {
        throw new Error('Enter a valid price');
    }

    if (!fitOptions.includes(form.fit)) {
        throw new Error('Choose a fit');
    }
    if (!genderOptions.includes(form.gender)) {
        throw new Error('Choose a gender');
    }

    let gsm = null;
    if (form.gsm !== undefined && form.gsm !== '') {
        gsm = Number(form.gsm);
        if (!Number.isInteger(gsm) || gsm < 1 || gsm > 1000) {
            throw new Error('GSM must be a whole number from 1 to 1000');
        }
    }

    const categoryId = Number(form.category_id);
    if (!categories.some((c) => c.category_id === categoryId)) {
        throw new Error('Choose a category');
    }

    return {
        name,
        description,
        price: Math.round(price * 100) / 100,
        fit: form.fit,
        fabric,
        gsm,
        gender: form.gender,
        drop_name: dropName,
        care_instructions: care,
        category_id: categoryId,
    };
}

async function listProducts() {
    return productAdminData.getAllProducts();
}

async function getCategories() {
    return productAdminData.getAllCategories();
}

async function getProduct(productId) {
    if (!Number.isInteger(productId)) {
        throw new Error('Invalid product id');
    }
    const product = await productAdminData.getProductById(productId);
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
}

async function createProduct(form) {
    const categories = await productAdminData.getAllCategories();
    const clean = cleanProduct(form, categories);
    return productAdminData.createProduct(clean);
}

async function updateProduct(productId, form) {
    if (!Number.isInteger(productId)) {
        throw new Error('Invalid product id');
    }
    const categories = await productAdminData.getAllCategories();
    const clean = cleanProduct(form, categories);
    const changed = await productAdminData.updateProduct(productId, clean);
    if (changed === 0) {
        throw new Error('Product not found');
    }
}

async function setActive(productId, isActive) {
    if (!Number.isInteger(productId)) {
        throw new Error('Invalid product id');
    }
    const changed = await productAdminData.setProductActive(productId, isActive);
    if (changed === 0) {
        throw new Error('Product not found');
    }
}

module.exports = { listProducts, getCategories, getProduct, createProduct, updateProduct, setActive };