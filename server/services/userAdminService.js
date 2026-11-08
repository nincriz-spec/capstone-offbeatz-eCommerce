const userAdminData = require('../data/userAdminData');

const ROLES = ['customer', 'admin'];

// Keep only filters that are safe and valid
function cleanFilters(query = {}) {
    const filters = {};

    const search = String(query.search || '').trim();
    if (search && search.length <= 100) {
        filters.search = search;
    }
    if (ROLES.includes(query.role)) {
        filters.role = query.role;
    }
    return filters;
}

async function getUsers(query) {
    return userAdminData.getAllUsers(cleanFilters(query));
}

module.exports = { getUsers };