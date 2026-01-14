import express from 'express';
import { Food } from '../models/Food.js';

const router = express.Router();

// Get all menu items for a specific restaurant (public)
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const foods = await Food.find({ restaurantId }).sort({ category: 1, createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error('Get restaurant menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get single food item by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json(food);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

// Search foods (public)
router.get('/', async (req, res) => {
  try {
    const { search, restaurantId, category } = req.query;
    const query = {};

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const foods = await Food.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(foods);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ error: 'Failed to search foods' });
  }
});

export default router;

