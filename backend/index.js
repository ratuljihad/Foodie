import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import orderRoutes from './routes/orders.js';
import dashboardRoutes from './routes/dashboard.js';
import foodRoutes from './routes/foods.js';
import publicFoodRoutes from './routes/publicFoods.js';
import userRoutes from './routes/users.js';
import { authenticateToken } from './middleware/auth.js';
import connectDB from './config/database.js';
import { initializeSocket } from './socket/socketServer.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for Socket.io
const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174'
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // User profile routes
app.use('/api/restaurant', dashboardRoutes); // New dashboard routes
app.use('/api/restaurants/menu', authenticateToken, foodRoutes); // Specific route FIRST
app.use('/api/restaurants', restaurantRoutes); // Generic route LAST
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/foods', publicFoodRoutes); // Public routes for users

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize Socket.io
export const io = initializeSocket(httpServer);

// Make io available to routes
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io server initialized`);
});

