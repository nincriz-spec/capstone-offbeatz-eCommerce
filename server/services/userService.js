const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userData = require('../data/userData');

async function registerUser(name, email, password, phone, address) {
    const existing = await userData.getUserByEmail(email);
    if (existing) {
        throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const customerId = await userData.createUser(name, email, passwordHash, phone, address);
    return customerId;
}

async function loginUser(email, password) {
    const user = await userData.getUserByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { customerId: user.customer_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1hr' }
    );

    const refreshToken = jwt.sign(
        { customerId: user.customer_id },
        process.env.JWT_SECRET,
        { expiresIn: '1hr' }
    );

    return { token, refreshToken };
}

module.exports = { registerUser, loginUser };