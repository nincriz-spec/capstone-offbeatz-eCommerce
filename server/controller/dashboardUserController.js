const userAdminService = require('../services/userAdminService');
const logger = require('../logger');

async function showUsers(req, res) {
    try {
        const rows = await userAdminService.getUsers(req.query);
        res.render('dashboard/users', {
            title: 'Users',
            admin: req.session.admin,
            rows,
            values: {
                search: req.query.search || '',
                role: req.query.role || ''
            }
        });
    } catch (err) {
        logger.error(`dashboard showUsers failed: ${err.message}`);
        res.status(500).send('Could not load users');
    }
}

module.exports = { showUsers };