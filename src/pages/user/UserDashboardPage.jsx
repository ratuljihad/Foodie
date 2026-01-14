import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userClient';

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalCoins: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const ordersData = await userApi.getOrders();
        setOrders(ordersData);

        const totalOrders = ordersData.length;
        const totalSpent = ordersData.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalCoins = (user?.coinBalances || []).reduce((sum, b) => sum + (b.coins || 0), 0);

        setStats({ totalOrders, totalSpent, totalCoins });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name || 'User'}!`} 
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Spent</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">${stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Coins</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">{stats.totalCoins}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <span className="text-2xl">🪙</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            to="/restaurants"
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Browse Restaurants
          </Link>
          <Link
            to="/user/coins"
            className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-center font-medium text-orange-700 hover:bg-orange-100 transition-colors"
          >
            View Coins
          </Link>
          <Link
            to="/orders"
            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
          <Link
            to="/orders"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View All →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-slate-600 py-4">No orders yet. Start ordering to see them here!</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id || order._id}
                to={`/orders/${order.id || order._id}/track`}
                className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{order.restaurantName}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${order.total?.toFixed(2)}</p>
                    {order.coinDelta !== 0 && (
                      <p className="text-sm text-orange-600">
                        {order.coinDelta > 0 ? '+' : ''}{order.coinDelta} coins
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
