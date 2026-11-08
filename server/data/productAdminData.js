const pool = require('../database');

async function getAllProducts() {
    const [rows] = await pool.execute(
        `SELECT p.product_id, p.name, CAST(p.price AS DOUBLE) AS price, p.fit, p.gender,
                p.is_active, p.pdf_id, c.name AS category_name
         FROM product p
         JOIN category c ON p.category_id = c.category_id
         ORDER BY p.product_id`
    );
    return rows;
}

async function getProductById(productId) {
    const [rows] = await pool.execute(
        'SELECT * FROM product WHERE product_id = ?',
        [productId]
    );
    return rows[0];
}

async function getAllCategories() {
    const [rows] = await pool.execute(
        'SELECT category_id, name FROM category ORDER BY name'
    );
    return rows;
}

// New products start hidden (is_active = 0) until they have sizes and stock
async function createProduct(p) {
    const [result] = await pool.execute(
        `INSERT INTO product
            (name, description, price, fit, fabric, gsm, gender, drop_name, care_instructions, category_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [p.name, p.description, p.price, p.fit, p.fabric, p.gsm, p.gender, p.drop_name, p.care_instructions, p.category_id]
    );
    return result.insertId;
}

async function updateProduct(productId, p) {
    const [result] = await pool.execute(
        `UPDATE product SET
            name = ?, description = ?, price = ?, fit = ?, fabric = ?, gsm = ?,
            gender = ?, drop_name = ?, care_instructions = ?, category_id = ?
         WHERE product_id = ?`,
        [p.name, p.description, p.price, p.fit, p.fabric, p.gsm, p.gender, p.drop_name, p.care_instructions, p.category_id, productId]
    );
    return result.affectedRows;
}

async function setProductActive(productId, isActive) {
    const [result] = await pool.execute(
        'UPDATE product SET is_active = ? WHERE product_id = ?',
        [isActive ? 1 : 0, productId]
    );
    return result.affectedRows;
}

module.exports = { getAllProducts, getProductById, getAllCategories, createProduct, updateProduct, setProductActive };