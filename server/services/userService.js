const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userData = require('../data/userData');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+ ]{7,15}$/;

async function registerUser(name, email, password, phone, address) {
    if (!name || !name.trim()) {
        throw new Error('Name is required');
    }
    if (!email || !emailPattern.test(email.trim())) {
        throw new Error('Enter a valid email address');
    }
    if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }
    if (phone && !phonePattern.test(phone)) {
        throw new Error('Enter a valid phone number');
    }

    const existing = await userData.getUserByEmail(email.trim());
    if (existing) {
        throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const customerId = await userData.createUser(name.trim(), email.trim(), passwordHash, phone, address);
    return customerId;
}

async function loginUser(email, password) {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const user = await userData.getUserByEmail(email.trim());
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { customerId: user.customer_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    const refreshToken = jwt.sign(
        { customerId: user.customer_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { token, refreshToken };
}

async function getProfile(customerId) {
    const user = await userData.getUserById(customerId);
    if (!user) {
        throw new Error('User not found');
    }
    return { name: user.name, email: user.email, phone: user.phone };
}

async function getAddresses(customerId) {
    return userData.getAddressesByCustomer(customerId);
}

async function updateProfile(customerId, name, phone) {
    if (!name || !name.trim()) {
        throw new Error('Name is required');
    }
    if (!phonePattern.test(phone || '')) {
        throw new Error('Enter a valid phone number');
    }
    await userData.updateUser(customerId, name.trim(), phone);
    return getProfile(customerId);
}

function checkAddress(a) {
    if (!a || !a.street || !a.block || !a.city || !a.postal_code) {
        throw new Error('Please fill in all address fields');
    }
}

async function addAddress(customerId, a) {
    checkAddress(a);
    await userData.addAddress(customerId, a);
    return getAddresses(customerId);
}

async function updateAddress(customerId, addressId, a) {
    checkAddress(a);
    await userData.updateAddress(addressId, customerId, a);
    return getAddresses(customerId);
}

async function removeAddress(customerId, addressId) {
    try {
        await userData.deleteAddress(addressId, customerId);
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new Error('This address is used by an order, so it cannot be removed');
        }
        throw err;
    }
    return getAddresses(customerId);
}

module.exports = { registerUser, loginUser, getProfile, getAddresses, updateProfile, addAddress, updateAddress, removeAddress };