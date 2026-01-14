import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Store authenticated socket connections
const userSockets = new Map(); // userId -> socketId
const restaurantSockets = new Map(); // restaurantId -> socketId

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket authentication middleware
// Socket authentication middleware
io.use((socket, next) => {
  // 1. Get token and strip "Bearer " if present
  let token = socket.handshake.auth.token;
  
  console.log('--- Socket Auth Attempt ---');
  console.log('Received Token:', token ? `${token.substring(0, 10)}...` : 'NULL');

  if (!token) {
    console.log('Auth Failed: No token provided');
    return next(new Error('Authentication error'));
  }

  // CLEANUP: If token comes as "Bearer eyJ...", remove "Bearer "
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }

  try {
    // 2. Verify with the secret
    const decoded = jwt.verify(token, JWT_SECRET);
    
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    
    console.log('Auth Success:', socket.userId);
    next();
  } catch (err) {
    console.error('Auth Failed: Verification Error:', err.message);
    // This is what triggers your client-side error
    next(new Error('Authentication error'));
  }
});

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Store socket connection based on role
    if (socket.userRole === 'user') {
      userSockets.set(socket.userId, socket.id);
    } else if (socket.userRole === 'restaurant') {
      restaurantSockets.set(socket.userId, socket.id);
    }

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      if (socket.userRole === 'user') {
        userSockets.delete(socket.userId);
      } else if (socket.userRole === 'restaurant') {
        restaurantSockets.delete(socket.userId);
      }
    });

    // Handle join room (for specific order tracking)
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.userId} joined order room: ${orderId}`);
    });

    // Handle leave room
    socket.on('leave:order', (orderId) => {
      socket.leave(`order:${orderId}`);
      console.log(`Socket ${socket.userId} left order room: ${orderId}`);
    });
  });

  return io;
};

// Helper function to emit events
export const emitOrderEvent = (io, event, data) => {
  // Emit to specific order room
  if (data.orderId) {
    io.to(`order:${data.orderId}`).emit(event, data);
  }

  // Emit to user who placed the order
  if (data.userId) {
    const userSocketId = userSockets.get(data.userId);
    if (userSocketId) {
      io.to(userSocketId).emit(event, data);
    }
  }

  // Emit to restaurant
  if (data.restaurantId) {
    const restaurantSocketId = restaurantSockets.get(data.restaurantId);
    if (restaurantSocketId) {
      io.to(restaurantSocketId).emit(event, data);
    }
  }

  // Also broadcast to all in the order room
  if (data.orderId) {
    io.to(`order:${data.orderId}`).emit(event, data);
  }
};

