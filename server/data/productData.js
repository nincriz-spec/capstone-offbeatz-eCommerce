const pool = require('../database');

async function getAllProducts() {
    const [rows] = await pool.execute(
        `SELECT
        product_id,
        name,
        CAST(price AS DOUBLE) AS price,
        description,
        fit,
        fabric,
        gsm,
        gender,
        drop_name,
        care_instructions,
        is_active,
        created_at
        FROM product
        `
    )
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
    )

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
    )
    return rows;


}


module.exports = { getAllProducts, getAllVariant, getAllProductImage };