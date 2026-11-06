const pool = require('../database');

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

async function createOrder(customerId, address, total, lines) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Does this customer already have this exact address?
        const [found] = await connection.execute(
            `SELECT address_id FROM address
             WHERE customer_id = ? AND street = ? AND block = ? AND city = ? AND postal_code = ?
             LIMIT 1`,
            [customerId, address.street, address.block, address.city, address.postalCode]
        );

        let addressId;
        if (found.length > 0) {
            // yes: reuse it
            addressId = found[0].address_id;
        } else {
            // no: save a new one
            const [addressResult] = await connection.execute(
                'INSERT INTO address (customer_id, street, block, city, postal_code) VALUES (?, ?, ?, ?, ?)',
                [customerId, address.street, address.block, address.city, address.postalCode]
            );
            addressId = addressResult.insertId;
        }

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

async function getOrdersByCustomer(customerId) {
    const [rows] = await pool.execute(
        `SELECT order_id, status, CAST(total AS DOUBLE) AS total, created_at
         FROM orders
         WHERE customer_id = ?
         ORDER BY created_at DESC`,
        [customerId]
    );
    return rows;
}

async function getOrderItemsByCustomer(customerId) {
    const [rows] = await pool.execute(
        `SELECT oi.order_id, oi.variant_id, oi.quantity,
                CAST(oi.unit_price AS DOUBLE) AS unit_price,
                p.name, v.size, v.color
         FROM order_item oi
         JOIN orders o ON oi.order_id = o.order_id
         JOIN variant v ON oi.variant_id = v.variant_id
         JOIN product p ON v.product_id = p.product_id
         WHERE o.customer_id = ?`,
        [customerId]
    );
    return rows;
}
async function cancelOrder(orderId, customerId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // lock this order row and check it belongs to this customer
        const [rows] = await connection.execute(
            'SELECT status FROM orders WHERE order_id = ? AND customer_id = ? FOR UPDATE',
            [orderId, customerId]
        );
        if (rows.length === 0) {
            throw new Error('Order not found');
        }
        if (rows[0].status !== 'pending') {
            throw new Error('Only orders that are still pending can be cancelled');
        }

        // put the stock back
        const [items] = await connection.execute(
            'SELECT variant_id, quantity FROM order_item WHERE order_id = ?',
            [orderId]
        );
        for (const item of items) {
            await connection.execute(
                'UPDATE variant SET stock_qty = stock_qty + ? WHERE variant_id = ?',
                [item.quantity, item.variant_id]
            );
        }

        await connection.execute(
            "UPDATE orders SET status = 'cancelled' WHERE order_id = ?",
            [orderId]
        );

        await connection.execute(
            'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by) VALUES (?, ?, ?, ?)',
            [orderId, 'pending', 'cancelled', customerId]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    getVariantById,
    createOrder,
    getOrdersByCustomer,
    getOrderItemsByCustomer,
    cancelOrder
};