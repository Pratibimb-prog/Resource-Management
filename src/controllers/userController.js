const User = require('../models/User');

// Get current user (Private)
const getMe = async (req, res, next) => {
    try {
        const user = {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMe,
    getAllUsers
};
