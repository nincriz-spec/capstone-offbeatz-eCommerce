const jwt = require('jsonwebtoken');
const tokenData = require('../data/tokenData');

async function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token required' });
    }

    const token = header.split(' ')[1];

    // 1. Is the token real and not expired?
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 2. A refresh token is not allowed to act as an access token
    if (payload.type === 'refresh') {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 3. Was this token logged out?
    try {
        if (await tokenData.isBlacklisted(token)) {
            return res.status(401).json({ message: 'Token has been logged out' });
        }
    } catch (error) {
        console.error('blacklist check error:', error);
        return res.status(500).json({ message: 'Server error' });
    }

    req.user = payload;
    next();
}

function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
}

module.exports = { authenticate, isAdmin };