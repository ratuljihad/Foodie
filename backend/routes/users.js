import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(authenticateToken);

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update current user profile
router.put('/profile', async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        // Find user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

        // Handle password update if provided
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        // Return updated user without password
        const userObj = user.toObject();
        delete userObj.password;
        userObj.id = user._id;

        res.json(userObj);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
