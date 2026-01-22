import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { Order, OrderStatus } from '../models/Order.js';
import { Restaurant } from '../models/Restaurant.js';

const router = express.Router();

// All routes require restaurant authentication
router.use(authenticateToken);
router.use(authorizeRoles('restaurant'));

// GET /dashboard - Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        const restaurantId = req.user.id;

        // Fetch orders for this restaurant
        const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });

        const totalOrders = orders.length;
        const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        const recentOrders = orders.slice(0, 5); // Last 5 orders

        res.json({
            totalOrders,
            revenue,
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to load dashboard stats' });
    }
});

// GET /discounts - Get active discounts
router.get('/discounts', (req, res) => {
    // Mock response for now, or implement Discount model
    res.json([
        {
            id: 1,
            code: 'WELCOME20',
            type: 'percentage',
            value: 20,
            description: 'Welcome discount',
            active: true,
            isActive: true, // Frontend uses isActive
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
        },
        {
            id: 2,
            code: 'LUNCH10',
            type: 'percentage',
            value: 10,
            description: 'Lunch special',
            active: false,
            isActive: false,
            validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // -7 days
            validUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // -1 day (expired)
        }
    ]);
});

// POST /discounts - Create discount
router.post('/discounts', (req, res) => {
    // Mock success
    res.status(201).json({ message: 'Discount created', discount: req.body });
});

export default router;
