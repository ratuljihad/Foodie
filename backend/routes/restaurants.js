import express from 'express';
import { Restaurant } from '../models/Restaurant.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all restaurants (public)
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select('-password').sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get current restaurant's profile (protected - restaurant only)
router.get('/profile', authenticateToken, authorizeRoles('restaurant'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id).select('-password');

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ restaurant });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current restaurant's profile (protected - restaurant only)
router.put('/profile', authenticateToken, authorizeRoles('restaurant'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { name, phone, address, cuisine, description, coinRate, coinThreshold } = req.body;

    // Update fields if provided
    if (name) restaurant.name = name;
    if (phone) restaurant.phone = phone;
    if (address) restaurant.address = address;
    if (cuisine) restaurant.cuisine = cuisine;
    if (description) restaurant.description = description;
    if (coinRate !== undefined) restaurant.coinRate = Number(coinRate);
    if (coinThreshold !== undefined) restaurant.coinThreshold = Number(coinThreshold);

    await restaurant.save();

    const restaurantObj = restaurant.toObject();
    delete restaurantObj.password;

    res.json({ restaurant: restaurantObj });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get restaurant by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select('-password');

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
