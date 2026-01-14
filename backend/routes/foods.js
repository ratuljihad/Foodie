import express from 'express';
import { Food } from '../models/Food.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// All routes require restaurant authentication
router.use(authenticateToken);
router.use(authorizeRoles('restaurant'));

// Get all food items for the authenticated restaurant
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });
    res.json({ items: foods });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// Get single food item
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findOne({ _id: req.params.id, restaurantId: req.user.id });
    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json(food);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

// Create new food item with optional image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category, isSignature } = req.body;

    // Validate required fields
    if (!name || !price || !description || !category) {
      return res.status(400).json({ error: 'Name, price, description, and category are required' });
    }

    // Build image path if file was uploaded
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/foods/${req.file.filename}`;
    } else if (req.body.image) {
      // Allow URL as fallback
      imagePath = req.body.image;
    }

    const food = new Food({
      restaurantId: req.user.id,
      name,
      price: parseFloat(price),
      description,
      category,
      image: imagePath,
      isSignature: isSignature === 'true' || isSignature === true,
    });

    await food.save();
    res.status(201).json(food);
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

// Update food item
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const food = await Food.findOne({ _id: req.params.id, restaurantId: req.user.id });
    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const { name, price, description, category, isSignature } = req.body;

    // Update fields
    if (name) food.name = name;
    if (price !== undefined) food.price = parseFloat(price);
    if (description) food.description = description;
    if (category) food.category = category;
    if (isSignature !== undefined) {
      food.isSignature = isSignature === 'true' || isSignature === true;
    }

    // Handle image update
    if (req.file) {
      // Delete old image if it exists and is a local file
      if (food.image && food.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', food.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      food.image = `/uploads/foods/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      // Allow URL update or clearing image
      if (req.body.image && !req.body.image.startsWith('/uploads/')) {
        // If it's not a local path, treat as URL
        food.image = req.body.image;
      }
    }

    await food.save();
    res.json(food);
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

// Delete food item
router.delete('/:id', async (req, res) => {
  try {
    const food = await Food.findOne({ _id: req.params.id, restaurantId: req.user.id });
    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    // Delete associated image file if it exists
    if (food.image && food.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', food.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Food.deleteOne({ _id: req.params.id });
    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

export default router;

