const orderData = require('../data/orderData');

async function createOrder(customerId, items, address) {
    if (!items || items.length === 0) {
        throw new Error('Cart is empty');
    }

    if (!address || !address.street || !address.block || !address.city || !address.postalCode) {
        throw new Error('Please enter a full address');
    }

    let total = 0;
    const lines = [];

    for (const item of items) {
        const variant = await orderData.getVariantById(item.variantId);
        if (!variant) {
            throw new Error('Item not found');
        }
        if (variant.stock_qty < item.quantity) {
            throw new Error('Not enough stock');
        }
        total += Number(variant.price) * item.quantity;
        lines.push({
            variantId: variant.variant_id,
            quantity: item.quantity,
            unitPrice: Number(variant.price)
        });
    }

    const orderId = await orderData.createOrder(customerId, address, total, lines);
    return { orderId, total };
}

async function getOrders(customerId) {
    const orders = await orderData.getOrdersByCustomer(customerId);
    const items = await orderData.getOrderItemsByCustomer(customerId);

    return orders.map((o) => ({
        ...o,
        items: items.filter((i) => i.order_id === o.order_id),
    }));
}

module.exports = { createOrder, getOrders };