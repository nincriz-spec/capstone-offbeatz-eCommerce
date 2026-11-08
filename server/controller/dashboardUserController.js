const userAdminService = require('../services/userAdminService');

async function showUsers(req, res) {
    try {
        const rows = await userAdminService.getUsers(req.query);
        res.render('dashboard/users', {
            rows,
            values: {
                search: req.query.search || '',
                role: req.query.role || ''
            }
        });
    } catch (err) {
        console.error('showUsers error:', err);
        res.status(500).send('Could not load users');
    }
}

module.exports = { showUsers };