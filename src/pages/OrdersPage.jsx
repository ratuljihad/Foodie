import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppContext';
import { userApi } from '../api/userClient';

const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800', icon: '👨‍🍳' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

export const OrdersPage = () => {
  const { user } = useAppState();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
    // Poll for order updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await userApi.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Orders" subtitle="Your recent orders and coin changes." />
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Orders" subtitle="Your recent orders and coin changes." />
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Your recent orders and coin changes." />
      {!loading && !orders.length && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600 mb-4">No orders yet.</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      )}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
          return (
            <Link
              key={order._id || order.id}
              to={`/orders/${order._id || order.id}/track`}
              className="block"
            >
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{order.restaurantName}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{format(new Date(order.createdAt), 'PP p')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-slate-900">${order.total?.toFixed(2)}</p>
                    {order.coinDelta !== 0 && (
                      <p className="text-sm text-orange-600">
                        Coins {order.coinDelta >= 0 ? '+' : ''}{order.coinDelta}
                      </p>
                    )}
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  {order.items?.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span>
                        {item.name} × {item.quantity}
                        {item.isRedeemed && <span className="text-green-600 ml-2">(redeemed)</span>}
                      </span>
                      <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-right">Click to track order →</p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
