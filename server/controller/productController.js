const productService = require('../services/productService');

async function getAllProducts(req, res) {
    try {
        const result = await productService.getAllProducts();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong"});
    }
}

module.exports = { getAllProducts };