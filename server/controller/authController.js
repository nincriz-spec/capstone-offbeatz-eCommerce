const userService = require('../services/userService');

// POST /api/users/refresh   body: { "refreshToken": "..." }
async function refresh(req, res) {
    try {
        const refreshToken = req.body && req.body.refreshToken;
        const result = await userService.refreshAccessToken(refreshToken);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

// POST /api/users/logout   header: Bearer <access token>, body: { "refreshToken": "..." }
async function logout(req, res) {
    try {
        const accessToken = req.headers.authorization.split(' ')[1];
        const refreshToken = req.body && req.body.refreshToken;
        await userService.logoutUser(accessToken, refreshToken);
        res.json({ message: 'Logged out' });
    } catch (err) {
        console.error('logout error:', err);
        res.status(500).json({ message: 'Could not log out' });
    }
}

module.exports = { refresh, logout };