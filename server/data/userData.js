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

async function getAddressesByCustomer(customerId) {
    const [rows] = await pool.execute(
        `SELECT MIN(address_id) AS address_id, street, block, city, postal_code
         FROM address
         WHERE customer_id = ?
         GROUP BY street, block, city, postal_code
         ORDER BY MIN(address_id) DESC`,
        [customerId]
    );
    return rows;
}
async function updateUser(customerId, name, phone) {
    await pool.execute(
        'UPDATE customer SET name = ?, phone = ? WHERE customer_id = ?',
        [name, phone, customerId]
    );
}
async function addAddress(customerId, a) {
    await pool.execute(
        'INSERT INTO address (street, block, city, postal_code, customer_id) VALUES (?, ?, ?, ?, ?)',
        [a.street, a.block, a.city, a.postal_code, customerId]
    );
}

async function updateAddress(addressId, customerId, a) {
    await pool.execute(
        'UPDATE address SET street = ?, block = ?, city = ?, postal_code = ? WHERE address_id = ? AND customer_id = ?',
        [a.street, a.block, a.city, a.postal_code, addressId, customerId]
    );
}

async function deleteAddress(addressId, customerId) {
    await pool.execute(
        'DELETE FROM address WHERE address_id = ? AND customer_id = ?',
        [addressId, customerId]
    );
}
module.exports = { createUser, getUserByEmail, getUserById, getAddressesByCustomer, updateUser, addAddress, updateAddress, deleteAddress };