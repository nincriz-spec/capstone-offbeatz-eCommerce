const pool = require('../database');

// filters is optional: { search, minPrice, maxPrice, fit, gender, category }
async function getAllProducts(filters = {}) {
    // Only visible products go to the shop (hidden ones have is_active = 0)
    let sql = `SELECT
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
        WHERE p.is_active = 1`;
    const bindings = [];

    if (filters.search) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        bindings.push('%' + filters.search + '%', '%' + filters.search + '%');
    }
    if (filters.minPrice !== undefined) {
        sql += ' AND p.price >= ?';
        bindings.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        sql += ' AND p.price <= ?';
        bindings.push(filters.maxPrice);
    }
    if (filters.fit) {
        sql += ' AND p.fit = ?';
        bindings.push(filters.fit);
    }
    if (filters.gender) {
        sql += ' AND p.gender = ?';
        bindings.push(filters.gender);
    }
    if (filters.category) {
        sql += ' AND c.slug = ?';
        bindings.push(filters.category);
    }

    const [rows] = await pool.execute(sql, bindings);
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