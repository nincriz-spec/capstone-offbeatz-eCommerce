const pool = require('../database');

// filters is optional: { status, search, fromDate, toDate }
async function getAllOrders(filters = {}) {
    // Query builder pattern: start with WHERE 1, then add AND ... for each filter used
    let sql = `SELECT o.order_id, o.status, CAST(o.total AS DOUBLE) AS total, o.created_at,
                      c.name AS customer_name, c.email AS customer_email
               FROM orders o
               JOIN customer c ON o.customer_id = c.customer_id
               WHERE 1`;
    const bindings = [];

    if (filters.status) {
        sql += ' AND o.status = ?';
        bindings.push(filters.status);
    }

    if (filters.search) {
        sql += ' AND (c.name LIKE ? OR c.email LIKE ?)';
        bindings.push('%' + filters.search + '%', '%' + filters.search + '%');
    }

    if (filters.fromDate) {
        sql += ' AND o.created_at >= ?';
        bindings.push(filters.fromDate);
    }

    if (filters.toDate) {
        // up to the END of the chosen day
        sql += ' AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY)';
        bindings.push(filters.toDate);
    }

    sql += ' ORDER BY o.created_at DESC';

    const [rows] = await pool.execute(sql, bindings);
    return rows;
}

async function getAllOrderItems() {
    const [rows] = await pool.execute(
        `SELECT oi.order_id, oi.variant_id, oi.quantity,
                CAST(oi.unit_price AS DOUBLE) AS unit_price,
                p.name, v.size, v.color
         FROM order_item oi
         JOIN variant v ON oi.variant_id = v.variant_id
         JOIN product p ON v.product_id = p.product_id`
    );
    return rows;
}

async function updateOrderStatus(orderId, newStatus, adminId, allowedNext) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // lock the order row and read its current status
        const [rows] = await connection.execute(
            'SELECT status FROM orders WHERE order_id = ? FOR UPDATE',
            [orderId]
        );
        if (rows.length === 0) {
            throw new Error('Order not found');
        }

        const current = rows[0].status;
        const allowed = allowedNext[current] || [];
        if (!allowed.includes(newStatus)) {
            throw new Error('Cannot change an order from ' + current + ' to ' + newStatus);
        }

        // cancelling puts the stock back
        if (newStatus === 'cancelled') {
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
        }

        await connection.execute(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [newStatus, orderId]
        );

        await connection.execute(
            'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by) VALUES (?, ?, ?, ?)',
            [orderId, current, newStatus, adminId]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { getAllOrders, getAllOrderItems, updateOrderStatus };