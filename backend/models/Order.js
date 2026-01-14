import mongoose from 'mongoose';

// Order status enum
export const OrderStatus = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    items: [
      {
        menuItemId: String,
        name: String,
        price: Number,
        quantity: Number,
        isRedeemed: { type: Boolean, default: false },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    coinDelta: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);

