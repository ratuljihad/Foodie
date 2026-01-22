import express from 'express';
import { Restaurant } from '../models/Restaurant.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all restaurants (public)
router.get('/', async (req, res) => {
  try {
    const { country } = req.query;
    const query = {};
    if (country) query.country = country;

    const restaurants = await Restaurant.find(query).select('-password').sort({ createdAt: -1 });
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

    const { name, phone, address, cuisine, country, description, image, thumbnail, gallery, logo, logoStatus, logoSettings } = req.body;

    // Update fields if provided
    if (name) restaurant.name = name;
    if (phone) restaurant.phone = phone;
    if (address) restaurant.address = address;
    if (cuisine) restaurant.cuisine = cuisine;
    if (country) restaurant.country = country;
    if (description) restaurant.description = description;
    if (image !== undefined) restaurant.image = image;
    if (thumbnail !== undefined) restaurant.thumbnail = thumbnail;
    if (gallery !== undefined) restaurant.gallery = gallery;
    if (logo !== undefined) restaurant.logo = logo;
    if (logoStatus !== undefined) restaurant.logoStatus = logoStatus;
    if (logoSettings !== undefined) restaurant.logoSettings = logoSettings;

    await restaurant.save();

    const restaurantObj = restaurant.toObject();
    delete restaurantObj.password;

    res.json({ restaurant: restaurantObj });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile image
router.post('/upload-image', authenticateToken, authorizeRoles('restaurant'), upload.single('restaurantImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = `/uploads/restaurants/${req.file.filename}`;
    res.json({ imagePath });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload logo
router.post('/upload-logo', authenticateToken, authorizeRoles('restaurant'), upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoPath = `/uploads/logos/${req.file.filename}`;
    res.json({ logoPath });
  } catch (error) {
    console.error('Logo upload error:', error);
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
