const orderData = require('../data/orderData');

async function createOrder(customerId, items, address) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Cart is empty');
    }

    if (!address || !address.street || !address.block || !address.city || !address.postalCode) {
        throw new Error('Please enter a full address');
    }

    // check every quantity, and add up lines that repeat the same variant
    const quantities = {};
    for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('Quantity must be a whole number of at least 1');
        }
        quantities[item.variantId] = (quantities[item.variantId] || 0) + quantity;
    }

    let total = 0;
    const lines = [];

    for (const variantId of Object.keys(quantities)) {
        const quantity = quantities[variantId];
        const variant = await orderData.getVariantById(variantId);
        if (!variant) {
            throw new Error('Item not found');
        }
        if (variant.stock_qty < quantity) {
            throw new Error('Not enough stock');
        }
        total += Number(variant.price) * quantity;
        lines.push({
            variantId: variant.variant_id,
            quantity: quantity,
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

async function cancelOrder(customerId, orderId) {
    await orderData.cancelOrder(orderId, customerId);
    return { message: 'Order cancelled' };
}

module.exports = { createOrder, getOrders, cancelOrder };