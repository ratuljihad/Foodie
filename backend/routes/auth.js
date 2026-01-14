import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Store refresh tokens (in production, use Redis or database)
const refreshTokens = new Set();

// Helper function to generate tokens
const generateTokens = (payload) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production';

  const accessToken = jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

// Register User
router.post('/register/user', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      coinBalances: [],
    });

    await user.save();

    // Generate tokens
    const payload = { id: user._id, email: user.email, role: 'user' };
    const { accessToken, refreshToken } = generateTokens(payload);
    refreshTokens.add(refreshToken);

    // Return user data (without password)
    const userObj = user.toObject();
    delete userObj.password;

    // Ensure 'id' field is present for frontend compatibility
    userObj.id = user._id;

    res.status(201).json({
      user: userObj,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register Restaurant
router.post('/register/restaurant', async (req, res) => {
  try {
    const { email, password, name, phone, address, cuisine } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if restaurant already exists
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(409).json({ error: 'Restaurant with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create restaurant
    const restaurant = new Restaurant({
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      address: address || '',
      cuisine: cuisine || '',
    });

    await restaurant.save();

    // Generate tokens
    const payload = { id: restaurant._id, email: restaurant.email, role: 'restaurant' };
    const { accessToken, refreshToken } = generateTokens(payload);
    refreshTokens.add(refreshToken);

    // Return restaurant data (without password)
    const restaurantObj = restaurant.toObject();
    delete restaurantObj.password;
    restaurantObj.id = restaurant._id;

    res.status(201).json({
      user: restaurantObj,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register restaurant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user or restaurant based on role
    let account = null;
    let accountRole = role || 'user'; // Default to user if not specified

    if (accountRole === 'restaurant') {
      account = await Restaurant.findOne({ email });
    } else {
      account = await User.findOne({ email });
    }

    // If not found in specified role, try the other one (optional, but good UX)
    if (!account && !role) {
      // Try restaurant if user not found and role wasn't specified
      account = await Restaurant.findOne({ email });
      if (account) accountRole = 'restaurant';
    }

    if (!account) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, account.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const payload = { id: account._id, email: account.email, role: accountRole };
    const { accessToken, refreshToken } = generateTokens(payload);
    refreshTokens.add(refreshToken);

    // Return account data (without password)
    const accountObj = account.toObject();
    delete accountObj.password;
    accountObj.id = account._id;

    res.json({
      user: accountObj,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh Token
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production', (err, decoded) => {
      if (err) {
        refreshTokens.delete(refreshToken);
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      // Generate new tokens
      const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);

      // Remove old refresh token and add new one
      refreshTokens.delete(refreshToken);
      refreshTokens.add(newRefreshToken);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // Find user or restaurant
      let account = null;
      if (decoded.role === 'restaurant') {
        account = await Restaurant.findById(decoded.id);
      } else {
        account = await User.findById(decoded.id);
      }

      if (!account) {
        return res.status(404).json({ error: 'User not found' });
      }

      const accountObj = account.toObject();
      delete accountObj.password;
      accountObj.id = account._id;

      res.json({ user: accountObj });
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

