const pool = require('../database');

// Save a token so it can no longer be used (called on logout)
async function addToBlacklist(token, expiresAt) {
    await pool.execute(
        'INSERT IGNORE INTO token_blacklist (token, expires_at) VALUES (?, ?)',
        [token, expiresAt]
    );
}

// Is this token on the blacklist?
async function isBlacklisted(token) {
    const [rows] = await pool.execute(
        'SELECT 1 FROM token_blacklist WHERE token = ?',
        [token]
    );
    return rows.length > 0;
}

// Housekeeping: remove rows for tokens that died more than a day ago
async function deleteExpired() {
    await pool.execute(
        'DELETE FROM token_blacklist WHERE expires_at < NOW() - INTERVAL 1 DAY'
    );
}

module.exports = { addToBlacklist, isBlacklisted, deleteExpired };