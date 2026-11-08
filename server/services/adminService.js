const adminData = require('../data/adminData');

// which status can go to which
const allowedNext = {
    pending: ['paid', 'shipped', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

async function getAllOrders() {
    const orders = await adminData.getAllOrders();
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