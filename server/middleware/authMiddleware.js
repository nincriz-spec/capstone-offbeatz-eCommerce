const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token required' });
    }

    const token = header.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
}

module.exports = { authenticate, isAdmin };