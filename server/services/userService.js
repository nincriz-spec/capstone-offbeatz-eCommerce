const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userData = require('../data/userData');
const tokenData = require('../data/tokenData');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+ ]{7,15}$/;

// How long each pass lasts. Easy to change in one place.
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

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
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { customerId: user.customer_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES }
    );

    // type: 'refresh' lets us tell this pass apart from an access token
    const refreshToken = jwt.sign(
        { customerId: user.customer_id, role: user.role, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: REFRESH_EXPIRES }
    );

    return { token, refreshToken };
}

// Trade a valid refresh token for a new access token
async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error('Refresh token required');
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
        throw new Error('Invalid or expired refresh token');
    }

    if (await tokenData.isBlacklisted(refreshToken)) {
        throw new Error('Invalid or expired refresh token');
    }

    const token = jwt.sign(
        { customerId: payload.customerId, role: payload.role },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES }
    );
    return { token };
}

// Put one token on the blacklist (ignores tokens that are already invalid)
async function blacklistToken(token) {
    if (!token) {
        return;
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        await tokenData.addToBlacklist(token, new Date(payload.exp * 1000));
    } catch (err) {
        // expired or fake token: nothing to blacklist
    }
}

// Logout: kill the access token and the refresh token
async function logoutUser(accessToken, refreshToken) {
    await blacklistToken(accessToken);
    await blacklistToken(refreshToken);
    await tokenData.deleteExpired();
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

module.exports = {
    registerUser, loginUser, refreshAccessToken, logoutUser,
    getProfile, getAddresses, updateProfile, addAddress, updateAddress, removeAddress
};