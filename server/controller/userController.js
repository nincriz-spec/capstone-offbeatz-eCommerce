const userService = require('../services/userService');

async function register(req, res) {
    try {
        const { name, email, password, phone, address } = req.body;
        const customerId = await userService.registerUser(name, email, password, phone, address);
        res.status(201).json({ message: 'Account created', customerId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        res.json({ message: 'Logged in', ...result });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

async function getProfile(req, res) {
    try {
        const profile = await userService.getProfile(req.user.customerId);
        res.json(profile);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

async function getAddresses(req, res) {
    try {
        const addresses = await userService.getAddresses(req.user.customerId);
        res.json(addresses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not load addresses' });
    }
}
async function updateProfile(req, res) {
    try {
        const profile = await userService.updateProfile(
            req.user.customerId,
            req.body.name,
            req.body.phone
        );
        res.json(profile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
async function addAddress(req, res) {
    try {
        const list = await userService.addAddress(req.user.customerId, req.body);
        res.status(201).json(list);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function updateAddress(req, res) {
    try {
        const list = await userService.updateAddress(req.user.customerId, req.params.id, req.body);
        res.json(list);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function removeAddress(req, res) {
    try {
        const list = await userService.removeAddress(req.user.customerId, req.params.id);
        res.json(list);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
module.exports = { register, login, getProfile, getAddresses, updateProfile, addAddress, updateAddress, removeAddress };