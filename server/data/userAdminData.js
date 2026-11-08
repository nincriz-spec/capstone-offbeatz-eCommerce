const pool = require('../database');

// filters is optional: { search, role }
// The password column is NEVER selected.
async function getAllUsers(filters = {}) {
    // Query builder: start with WHERE 1, add AND ... only for filters that were used
    let sql = `SELECT c.customer_id, c.name, c.email, c.phone, c.role, c.created_at,
                      COUNT(o.order_id) AS order_count
               FROM customer c
               LEFT JOIN orders o ON o.customer_id = c.customer_id
               WHERE 1`;
    const bindings = [];

    if (filters.search) {
        sql += ' AND (c.name LIKE ? OR c.email LIKE ?)';
        bindings.push('%' + filters.search + '%', '%' + filters.search + '%');
    }
    if (filters.role) {
        sql += ' AND c.role = ?';
        bindings.push(filters.role);
    }

    sql += ' GROUP BY c.customer_id ORDER BY c.created_at DESC LIMIT 200';

    const [rows] = await pool.execute(sql, bindings);
    return rows;
}

module.exports = { getAllUsers };