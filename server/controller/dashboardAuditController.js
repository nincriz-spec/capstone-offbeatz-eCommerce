const auditService = require('../services/auditService');

async function showAudit(req, res) {
  try {
    const rows = await auditService.getStatusHistory({ orderId: req.query.orderId });

    // Put what was typed back in the box
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
    console.error(err);
    res.status(500).send('Could not load the audit trail');
  }
}

module.exports = { showAudit };