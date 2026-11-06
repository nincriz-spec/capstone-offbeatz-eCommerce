const pool = require('../database');

async function getAllProducts() {
    const [rows] = await pool.execute(
        `SELECT
        p.product_id,
        p.name,
        CAST(p.price AS DOUBLE) AS price,
        p.description,
        p.fit,
        p.fabric,
        p.gsm,
        p.gender,
        p.drop_name,
        p.care_instructions,
        p.is_active,
        p.created_at,
        c.name AS category_name,
        c.slug AS category_slug
        FROM product p
        JOIN category c ON p.category_id = c.category_id
        `
    );
    return rows;
}

async function getAllVariant() {
    const [rows] = await pool.execute(
        `SELECT variant_id,
        sku,
        size,
        color,
        stock_qty AS stockQty,
        set_name,
        CAST(price AS DOUBLE) AS price,
        product_id
        FROM variant
        `
    );
    return rows;
}

async function getAllProductImage() {
    const [rows] = await pool.execute(
        `SELECT
        product_image_id,
        product_id,
        url,
        color
        FROM product_image
        ORDER BY sort_order
        `
    );
    return rows;
}

module.exports = { getAllProducts, getAllVariant, getAllProductImage };