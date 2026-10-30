const productData = require('../data/productData');

async function getAllProducts() {
    const products = await productData.getAllProducts();
    const variants = await productData.getAllVariant();
    const images = await productData.getAllProductImage();

    const result = products.map((p) => ({
        ...p,
        variants: variants.filter((v) => v.product_id === p.product_id),
        images: images.filter((i) => i.product_id === p.product_id),
    }));

    return result;
}

module.exports = { getAllProducts };