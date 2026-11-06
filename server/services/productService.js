const productData = require('../data/productData');

async function getAllProducts() {
    const products = await productData.getAllProducts();
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