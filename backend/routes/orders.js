import express from 'express';
import { Order, OrderStatus } from '../models/Order.js';
import { User } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get orders (user can see their own, restaurant can see their restaurant's orders)
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'user') {
      // Users see their own orders
      const userOrders = await Order.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(100);
      res.json(userOrders);
    } else if (req.user.role === 'restaurant') {
      // Restaurants see orders for their restaurant
      const restaurantOrders = await Order.find({ restaurantId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(100);
      res.json(restaurantOrders);
    } else {
      res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    if (req.user.role === 'restaurant' && order.restaurantId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order (users only)
router.post('/', authorizeRoles('user'), async (req, res) => {
  try {
    const { restaurantId, restaurantName, total, items, coinDelta, deliveryAddress, notes } = req.body;

    if (!restaurantId || !total || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Get user info from auth context (if available)
    const customerName = req.user.name || '';
    const customerEmail = req.user.email || '';

    const order = new Order({
      userId: req.user.id,
      restaurantId,
      restaurantName: restaurantName || 'Unknown',
      customerName,
      customerEmail,
      items: items.map((item) => ({
        menuItemId: item.menuItemId || item.menuItem?.id || item.menuItem?._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isRedeemed: item.isRedeemed || false,
      })),
      total: parseFloat(total),
      coinDelta: coinDelta || 0,
      status: OrderStatus.PENDING,
      deliveryAddress: deliveryAddress || '',
      notes: notes || '',
    });

    await order.save();

    // UPDATE USER COINS (In-memory persistence)
    try {
      const user = userModel.findById(req.user.id);
      if (user) {
        if (!user.coinBalances) user.coinBalances = [];

        const existingIndex = user.coinBalances.findIndex(c => c.restaurantId === restaurantId);

        if (existingIndex >= 0) {
          // Update existing balance
          const current = user.coinBalances[existingIndex].coins || 0;
          user.coinBalances[existingIndex].coins = Math.max(0, current + (coinDelta || 0));
        } else if ((coinDelta || 0) > 0) {
          // Add new balance
          user.coinBalances.push({
            restaurantId,
            coins: coinDelta || 0
          });
        }
      }
    } catch (err) {
      console.error('Failed to update user coins:', err);
    }

    // Emit orderCreated event via Socket.io
    const io = req.app.get('io');
    if (io) {
      const orderData = {
        orderId: order._id.toString(),
        userId: order.userId,
        restaurantId: order.restaurantId,
        order: order.toObject(),
      };

      // Emit to order room
      io.to(`order:${order._id}`).emit('orderCreated', orderData);
      // Emit to all connected clients (will be filtered on client side)
      io.emit('orderCreated', orderData);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status (restaurants only)
router.patch('/:id/status', authorizeRoles('restaurant'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.restaurantId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    // Emit orderUpdated event via Socket.io
    const io = req.app.get('io');
    if (io) {
      const orderObj = order.toObject();

      // Emit to order room
      io.to(`order:${order._id}`).emit('orderUpdated', {
        orderId: order._id.toString(),
        userId: order.userId,
        restaurantId: order.restaurantId,
        status: order.status,
        order: orderObj,
      });

      // Emit deliveryTracking event if status is out_for_delivery or delivered
      if (status === 'out_for_delivery' || status === 'delivered') {
        io.to(`order:${order._id}`).emit('deliveryTracking', {
          orderId: order._id.toString(),
          userId: order.userId,
          restaurantId: order.restaurantId,
          status: order.status,
          order: orderObj,
        });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
