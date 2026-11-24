const auditService = require('../services/auditService');
const logger = require('../logger');

async function showAudit(req, res) {
  try {
    const rows = await auditService.getStatusHistory({ orderId: req.query.orderId });

    
    const values = {
      orderId: typeof req.query.orderId === 'string' ? req.query.orderId : '',
    };

    res.render('dashboard/audit', {
      title: 'Audit trail',
      admin: req.session.admin,
      rows,
      values,
    });
  } catch (err) {
    logger.error(`dashboard showAudit failed: ${err.message}`);
    res.status(500).send('Could not load the audit trail');
  }
}

module.exports = { showAudit };