const orderService = require('../services/orderService');

async function createOrder(req, res) {
    try {
        const result = await orderService.createOrder(
            req.user.customerId,
            req.body.items,
            req.body.address
        );
        res.status(201).json({ message: 'Order created', ...result });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

async function getOrders(req, res) {
    try {
        const orders = await orderService.getOrders(req.user.customerId);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load orders' });
    }
}
async function cancelOrder(req, res) {
    try {
        const result = await orderService.cancelOrder(req.user.customerId, req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { createOrder, getOrders , cancelOrder};