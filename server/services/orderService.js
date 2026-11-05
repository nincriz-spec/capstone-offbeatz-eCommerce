const orderData = require('../data/orderData');

async function createOrder(customerId, items) {
    if (!items || items.length === 0) {
        throw new Error('Cart is empty');
    }

    const address = await orderData.getAddressByCustomer(customerId);
    if (!address) {
        throw new Error('Please add an address first');
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

    const orderId = await orderData.createOrder(customerId, address.address_id, total, lines);
    return { orderId, total };
}


module.exports = { createOrder };