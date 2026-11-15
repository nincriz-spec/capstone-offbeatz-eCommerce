const productService = require('../services/productService');
const logger = require('../logger');

async function getAllProducts(req, res) {
    try {
        const result = await productService.getAllProducts(req.query);
        res.json(result);
    } catch (error) {
        logger.error(`getAllProducts failed: ${error.message}`);
        res.status(500).json({ message: "Something went wrong"});
    }
}

module.exports = { getAllProducts };