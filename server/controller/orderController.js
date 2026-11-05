const orderService = require('../services/orderService');

async function createOrder(req, res) {
    try {
        const result = await orderService.createOrder(req.user.customerId, req.body.items);
        res.status(201).json({ message: 'Order created', ...result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { createOrder };