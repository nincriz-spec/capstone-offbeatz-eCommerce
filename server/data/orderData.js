const pool = require('../database');

async function getAddressByCustomer(customerId) {
    const [rows] = await pool.execute(
        'SELECT address_id FROM address WHERE customer_id = ? LIMIT 1',
        [customerId]
    );
    return rows[0] || null;
}

async function getVariantById(variantId) {
    const [rows] = await pool.execute(
        `SELECT v.variant_id, v.sku, v.color, v.set_name, v.product_id, v.stock_qty,
                COALESCE(v.price, p.price) AS price
         FROM variant v
         JOIN product p ON v.product_id = p.product_id
         WHERE v.variant_id = ?`,
        [variantId]
    );
    return rows[0] || null;
}

async function createOrder(customerId, addressId, total, lines) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.execute(
            'INSERT INTO orders (customer_id, address_id, total) VALUES (?, ?, ?)',
            [customerId, addressId, total]
        );
        const orderId = orderResult.insertId;

        for (const line of lines) {
            await connection.execute(
                'INSERT INTO order_item (order_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, line.variantId, line.quantity, line.unitPrice]
            );
            await connection.execute(
                'UPDATE variant SET stock_qty = stock_qty - ? WHERE variant_id = ?',
                [line.quantity, line.variantId]
            );
        }

        await connection.execute(
            'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by) VALUES (?, NULL, ?, ?)',
            [orderId, 'pending', customerId]
        );

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { getAddressByCustomer, getVariantById, createOrder };