const userService = require('../services/userService');

async function register(req, res) {
    try {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'name, email, password and phone are required' });
        }

        const customerId = await userService.registerUser(name, email, password, phone, address);
        res.status(201).json({ message: 'Registered', customerId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const token = await userService.loginUser(email, password);
        res.json({ message: 'Logged in', ...token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}

module.exports = { register, login };
