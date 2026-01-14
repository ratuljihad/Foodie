import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { restaurantApi } from '../../api/restaurantClient';

// Order status options
const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', next: 'preparing' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800', next: 'out_for_delivery' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800', next: 'delivered' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', next: null },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', next: null },
};

const STATUS_TRANSITIONS = {
  pending: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const RestaurantOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await restaurantApi.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError(null);
      await restaurantApi.updateOrderStatus(orderId, newStatus);
      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Sort by status priority, then by date (newest first)
    const statusPriority = { pending: 1, preparing: 2, out_for_delivery: 3, delivered: 4, cancelled: 5 };
    const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getStatusInfo = (status) => {
    return ORDER_STATUSES[status] || { label: status, color: 'bg-slate-100 text-slate-800', next: null };
  };

  const getNextStatusOptions = (currentStatus) => {
    return STATUS_TRANSITIONS[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Orders" subtitle="View and manage incoming orders" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="all">All Orders</option>
          {Object.entries(ORDER_STATUSES).map(([value, info]) => (
            <option key={value} value={value}>
              {info.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading orders...</p>
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600">
            {statusFilter === 'all' ? 'No orders yet.' : `No ${ORDER_STATUSES[statusFilter]?.label.toLowerCase()} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const nextOptions = getNextStatusOptions(order.status);

            return (
              <div key={order._id || order.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Order #{order._id?.toString().slice(-8) || order.id?.slice(-8) || 'N/A'}
                      </h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {format(new Date(order.createdAt), 'PP p')}
                    </p>
                    {order.customerName && (
                      <p className="text-sm text-slate-600 mt-1">
                        Customer: {order.customerName}
                      </p>
                    )}
                    {order.deliveryAddress && (
                      <p className="text-sm text-slate-600 mt-1">
                        Address: {order.deliveryAddress}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">${order.total?.toFixed(2)}</p>
                    {order.coinDelta !== 0 && (
                      <p className="text-sm text-orange-600 mt-1">
                        Coins: {order.coinDelta > 0 ? '+' : ''}{order.coinDelta}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Items:</h4>
                  <ul className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">
                          {item.name} × {item.quantity}
                          {item.isRedeemed && (
                            <span className="ml-2 text-xs text-green-600 font-medium">(Redeemed)</span>
                          )}
                        </span>
                        <span className="text-slate-900 font-medium">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.notes && (
                  <div className="border-t border-slate-200 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Notes:</h4>
                    <p className="text-sm text-slate-600">{order.notes}</p>
                  </div>
                )}

                {nextOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                    {nextOptions.map((nextStatus) => {
                      const nextStatusInfo = getStatusInfo(nextStatus);
                      const buttonText = nextStatus === 'preparing' ? 'Start Preparing' :
                                        nextStatus === 'out_for_delivery' ? 'Mark Out for Delivery' :
                                        nextStatus === 'delivered' ? 'Mark as Delivered' :
                                        nextStatus === 'cancelled' ? 'Cancel Order' :
                                        nextStatusInfo.label;

                      const buttonClass = nextStatus === 'cancelled' 
                        ? 'rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors'
                        : nextStatus === 'delivered'
                        ? 'rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors'
                        : 'rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors';

                      return (
                        <button
                          key={nextStatus}
                          onClick={() => handleStatusChange(order._id || order.id, nextStatus)}
                          className={buttonClass}
                        >
                          {buttonText}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
