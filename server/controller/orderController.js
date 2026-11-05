async function createOrder(req, res) {
    res.json({
        message: 'Order received',
        customerId: req.user.customerId,
        items: req.body.items
    });
}

module.exports = { createOrder };