const adminService = require('../services/adminService');
const logger = require('../logger');

async function getAllOrders(req, res) {
    try {
        const orders = await adminService.getAllOrders();
        res.json(orders);
    } catch (err) {
        logger.error(`admin getAllOrders failed: ${err.message}`);
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