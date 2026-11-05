const pool = require('../database');

async function createUser(name, email, passwordHash, phone, address) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'INSERT INTO customer (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, passwordHash, phone]
        );
        const customerId = result.insertId;

        if (address) {
            await connection.execute(
                'INSERT INTO address (customer_id, street, block, city, postal_code) VALUES (?, ?, ?, ?, ?)',
                [customerId, address.street, address.block, address.city, address.postalCode]
            );
        }

        await connection.commit();
        return customerId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getUserByEmail(email) {
    if (!email) {
        throw new Error("Invalid email address");
    }

    const [rows] = await pool.execute("SELECT * FROM customer WHERE email = ?", [email]);
    return rows[0] || null;
}

async function getUserById(id) {
    if (!id) {
        throw new Error("Invalid ID");
    }

    const [rows] = await pool.execute("SELECT * FROM customer WHERE customer_id = ?", [id]);
    return rows[0] || null;
}

module.exports = { createUser, getUserByEmail, getUserById };