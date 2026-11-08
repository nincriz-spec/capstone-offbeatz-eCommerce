const adminData = require('../data/adminData');

// which status can go to which
const allowedNext = {
    pending: ['paid', 'shipped', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

// Keep only filters that are valid. Anything strange is ignored.
function cleanFilters(filters = {}) {
    const clean = {};

    if (typeof filters.status === 'string' && Object.keys(allowedNext).includes(filters.status)) {
        clean.status = filters.status;
    }
    if (typeof filters.search === 'string' && filters.search.trim()) {
        clean.search = filters.search.trim().slice(0, 100);
    }
    if (typeof filters.fromDate === 'string' && datePattern.test(filters.fromDate)) {
        clean.fromDate = filters.fromDate;
    }
    if (typeof filters.toDate === 'string' && datePattern.test(filters.toDate)) {
        clean.toDate = filters.toDate;
    }

    return clean;
}

async function getAllOrders(filters) {
    const orders = await adminData.getAllOrders(cleanFilters(filters));
    const items = await adminData.getAllOrderItems();

    return orders.map((o) => ({
        ...o,
        items: items.filter((i) => i.order_id === o.order_id),
    }));
}

async function updateOrderStatus(adminId, orderId, newStatus) {
    if (!newStatus || !Object.keys(allowedNext).includes(newStatus)) {
        throw new Error('Unknown status');
    }
    await adminData.updateOrderStatus(orderId, newStatus, adminId, allowedNext);
    return { message: 'Status updated' };
}

module.exports = { getAllOrders, updateOrderStatus, allowedNext };