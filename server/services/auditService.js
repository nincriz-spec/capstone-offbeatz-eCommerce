const auditData = require('../data/auditData');

// Keep only a valid order number. Anything strange is ignored.
async function getStatusHistory(filters = {}) {
    const clean = {};

    const orderId = Number(filters.orderId);
    if (typeof filters.orderId === 'string' && Number.isInteger(orderId) && orderId > 0) {
        clean.orderId = orderId;
    }

    return auditData.getStatusHistory(clean);
}

module.exports = { getStatusHistory };