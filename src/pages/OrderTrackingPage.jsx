import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { userApi } from '../api/userClient';
import { PageHeader } from '../components/PageHeader';
import { formatPrice } from '../utils/currency';

const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800', icon: '👨‍🍳' },
  ready: { label: 'Food Ready', color: 'bg-indigo-100 text-indigo-800', icon: '🥘' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
};

const PAYMENT_METHODS = {
  cod: 'Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Credit/Debit Card',
  online: 'Online Payment',
};

const STATUS_STEPS = [
  { status: 'pending', label: 'Order Placed' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'ready', label: 'Food Ready' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await userApi.getOrder(id);
        const previousStatus = order?.status;
        setOrder(orderData);

        // Show status update if status changed
        if (previousStatus && orderData.status !== previousStatus) {
          setStatusUpdate({
            message: `Order status updated to: ${ORDER_STATUSES[orderData.status]?.label || orderData.status}`,
            timestamp: new Date(),
          });
          setTimeout(() => setStatusUpdate(null), 5000);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <PageHeader title="Error" subtitle="Failed to load order" />
        <p className="text-rose-600">{error || 'Order not found'}</p>
        <Link
          to="/orders"
          className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const currentStepIndex = STATUS_STEPS.findIndex(step => step.status === order.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order._id?.toString().slice(-8) || order.id?.slice(-8) || 'N/A'}`}
        subtitle="Track your order status"
      />

      {/* Status Update Banner */}
      {statusUpdate && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-green-600">🔔</span>
            <p className="text-sm font-medium text-green-800">{statusUpdate.message}</p>
            <span className="text-xs text-green-600 ml-auto">
              {format(statusUpdate.timestamp, 'HH:mm:ss')}
            </span>
          </div>
        </div>
      )}

      {/* Order Status Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{statusInfo.label}</h2>
            <p className="text-sm text-slate-600 mt-1">{order.restaurantName}</p>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.label}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 text-center ${isActive ? 'text-slate-900' : 'text-slate-500'
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-slate-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {order.status === 'cancelled' && order.cancellationReason && (
          <div className="mt-8 rounded-xl bg-red-50 p-4 border border-red-100">
            <div className="flex gap-3">
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-bold text-red-900 uppercase tracking-wide">Cancellation Note from Restaurant</p>
                <p className="text-sm text-red-700 mt-1 italic">"{order.cancellationReason}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Items */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h3>
          <ul className="space-y-3">
            {order.items?.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">
                    Quantity: {item.quantity}
                    {item.isRedeemed && (
                      <span className="ml-2 text-xs text-green-600 font-medium">(Redeemed)</span>
                    )}
                  </p>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatPrice((item.price || 0) * (item.quantity || 1))}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-lg font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-900">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Order Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-600">Order ID</dt>
              <dd className="text-sm text-slate-900 font-mono">
                {order._id?.toString().slice(-12) || order.id?.slice(-12)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-600">Placed At</dt>
              <dd className="text-sm text-slate-900">
                {format(new Date(order.createdAt), 'PP p')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-600">Restaurant</dt>
              <dd className="text-sm text-slate-900">{order.restaurantName}</dd>
            </div>
            {order.deliveryAddress && (
              <div>
                <dt className="text-sm font-medium text-slate-600">Delivery Address</dt>
                <dd className="text-sm text-slate-900">{order.deliveryAddress}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-600">Payment Method</dt>
              <dd className="text-sm text-slate-900">{PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-600">Payment Status</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${PAYMENT_STATUSES[order.paymentStatus]?.color || 'bg-slate-100'}`}>
                  {PAYMENT_STATUSES[order.paymentStatus]?.label || order.paymentStatus || 'Pending'}
                </span>
              </dd>
            </div>

          </dl>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to="/orders"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

