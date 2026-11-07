const adminService = require('../services/adminService');

async function getAllOrders(req, res) {
    try {
        const orders = await adminService.getAllOrders();
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not load orders' });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const result = await adminService.updateOrderStatus(
            req.user.customerId,
            req.params.id,
            req.body.status
        );
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = { getAllOrders, updateOrderStatus };