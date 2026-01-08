const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('[ERROR] JWT verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized: ' + error.message });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (!req.user) {
        console.error('[ERROR] No user found in request.');
        res.status(401).json({ message: 'Not authorized as an admin: no user' });
        return;
    }
    if (req.user.role !== 'admin') {
        console.error('[ERROR] User is not admin:', req.user);
        res.status(401).json({ message: 'Not authorized as an admin: not admin' });
        return;
    }
    next();
};

module.exports = { protect, admin };
