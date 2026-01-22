import express from 'express';
import { Order, OrderStatus } from '../models/Order.js';
import { User } from '../models/User.js';
import { Discount } from '../models/Discount.js';
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
    // Debug log for incoming order
    console.log('Creating order with body:', JSON.stringify(req.body, null, 2));

    const { restaurantId, restaurantName, total, items, deliveryAddress, notes, customerName, customerPhone, paymentMethod, discount } = req.body;

    if (!restaurantId || !total || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    // Get user info from auth context (if available)
    const userEmail = req.user.email || '';

    const order = new Order({
      userId: req.user.id,
      restaurantId,
      restaurantName: restaurantName || 'Unknown',
      customerName: customerName || req.user.name || '',
      customerEmail: userEmail,
      customerPhone: customerPhone || '',
      items: items.map((item) => ({
        menuItemId: item.menuItemId || item.menuItem?.id || item.menuItem?._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isRedeemed: item.isRedeemed || false,
      })),
      total: parseFloat(total),
      status: OrderStatus.PENDING,
      paymentStatus: (paymentMethod === 'cod') ? 'pending' : 'pending', // Both start as pending, but could be 'paid' if gateway redirect happened immediately
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      notes: notes || '',
      discount: discount ? {
        code: discount.code,
        amount: parseFloat(discount.amount),
        id: discount.id
      } : null,
    });

    await order.save();

    // Increment discount used count if applied
    if (discount && discount.id) {
      try {
        await Discount.findByIdAndUpdate(discount.id, { $inc: { usedCount: 1 } });
      } catch (err) {
        console.error('Failed to increment discount usage:', err);
      }
    }

    // Emit orderCreated event via Socket.io

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

router.patch('/:id/status', authorizeRoles('restaurant'), async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

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
    if (status === OrderStatus.CANCELLED && cancellationReason) {
      order.cancellationReason = cancellationReason;
    }
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

router.patch('/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.user.id && req.user.role !== 'restaurant') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

export default router;
