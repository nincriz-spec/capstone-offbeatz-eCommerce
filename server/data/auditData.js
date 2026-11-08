const pool = require('../database');

// filters is optional: { orderId }
async function getStatusHistory(filters = {}) {
    // Query builder: start with WHERE 1, add AND ... only for filters that were used
    let sql = `SELECT h.history_id, h.order_id, h.from_status, h.to_status, h.changed_at,
                      a.name AS changed_by_name
               FROM order_status_history h
               LEFT JOIN customer a ON h.changed_by = a.customer_id
               WHERE 1`;
    const bindings = [];

    if (filters.orderId) {
        sql += ' AND h.order_id = ?';
        bindings.push(filters.orderId);
    }

    sql += ' ORDER BY h.changed_at DESC, h.history_id DESC LIMIT 200';

    const [rows] = await pool.execute(sql, bindings);
    return rows;
}

module.exports = { getStatusHistory };