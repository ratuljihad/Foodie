import express from 'express';
import { Discount } from '../models/Discount.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Create a new discount (Restaurant only)
router.post('/', authenticateToken, authorizeRoles('restaurant'), async (req, res) => {
    try {
        const discountData = {
            ...req.body,
            restaurantId: req.user.id
        };

        const discount = new Discount(discountData);
        await discount.save();

        res.status(201).json(discount);
    } catch (error) {
        console.error('Create discount error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Discount code already exists for this restaurant' });
        }
        res.status(500).json({ error: 'Failed to create discount' });
    }
});

// Get all discounts for the logged-in restaurant
router.get('/restaurant', authenticateToken, authorizeRoles('restaurant'), async (req, res) => {
    try {
        const discounts = await Discount.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });
        res.json(discounts);
    } catch (error) {
        console.error('Get restaurant discounts error:', error);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
});

// Get all active discounts across the platform (Public)
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const discounts = await Discount.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        }).populate('restaurantId', 'name image').sort({ createdAt: -1 });
        res.json(discounts);
    } catch (error) {
        console.error('Get active discounts error:', error);
        res.status(500).json({ error: 'Failed to fetch active discounts' });
    }
});

// Get active discounts for a specific restaurant (Public)
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const now = new Date();
        const discounts = await Discount.find({
            restaurantId: req.params.restaurantId,
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        }).sort({ value: -1 });
        res.json(discounts);
    } catch (error) {
        console.error('Get restaurant active discounts error:', error);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
});

// Update a discount (Restaurant only)
router.put('/:id', authenticateToken, authorizeRoles('restaurant'), async (req, res) => {
    try {
        const discount = await Discount.findOneAndUpdate(
            { _id: req.params.id, restaurantId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!discount) {
            return res.status(404).json({ error: 'Discount not found or unauthorized' });
        }

        res.json(discount);
    } catch (error) {
        console.error('Update discount error:', error);
        res.status(500).json({ error: 'Failed to update discount' });
    }
});

// Delete a discount (Restaurant only)
router.delete('/:id', authenticateToken, authorizeRoles('restaurant'), async (req, res) => {
    try {
        const discount = await Discount.findOneAndDelete({
            _id: req.params.id,
            restaurantId: req.user.id
        });

        if (!discount) {
            return res.status(404).json({ error: 'Discount not found or unauthorized' });
        }

        res.json({ message: 'Discount deleted successfully' });
    } catch (error) {
        console.error('Delete discount error:', error);
        res.status(500).json({ error: 'Failed to delete discount' });
    }
});

// Validate a discount code (Public/User)
router.post('/validate', authenticateToken, async (req, res) => {
    try {
        const { code, restaurantId, total } = req.body;

        if (!code || !restaurantId) {
            return res.status(400).json({ error: 'Promo code and restaurant ID are required' });
        }

        const now = new Date();

        const discount = await Discount.findOne({
            code: code.toUpperCase(),
            restaurantId,
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        });

        if (!discount) {
            return res.status(400).json({ error: 'Invalid or expired discount code' });
        }

        if (total < discount.minOrder) {
            return res.status(400).json({
                error: `Minimum order value for this code is ${discount.minOrder}`
            });
        }

        if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
            return res.status(400).json({ error: 'Discount code usage limit reached' });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = (total * discount.value) / 100;
        } else {
            discountAmount = discount.value;
        }

        res.json({
            discountId: discount._id,
            code: discount.code,
            type: discount.type,
            value: discount.value,
            amount: discountAmount
        });
    } catch (error) {
        console.error('Validate discount error:', error);
        res.status(500).json({ error: 'Failed to validate discount' });
    }
});

export default router;
