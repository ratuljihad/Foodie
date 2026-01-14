import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { restaurantApi } from '../../api/restaurantClient';

export const RestaurantDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuItemsCount, setMenuItemsCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dashboard, menuItems] = await Promise.all([
          restaurantApi.getDashboard(),
          restaurantApi.getMenuItems(),
        ]);
        setDashboardData(dashboard);
        setMenuItemsCount(menuItems?.length || 0);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
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
        subtitle={`Welcome back, ${user?.name || 'Restaurant'}!`} 
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {dashboardData?.totalOrders || 0}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ${(dashboardData?.revenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Menu Items</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{menuItemsCount}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <span className="text-2xl">🍔</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Restaurant Coins</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {dashboardData?.restaurantCoins || 0}
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3">
              <span className="text-2xl">🪙</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            to="/restaurant/foods"
            className="flex items-center gap-3 rounded-lg border-2 border-orange-200 bg-orange-50 p-4 hover:bg-orange-100 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-semibold text-slate-900">Add Menu Item</p>
              <p className="text-sm text-slate-600">Create new item</p>
            </div>
          </Link>
          <Link
            to="/restaurant/foods"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="text-2xl">🍔</span>
            <div>
              <p className="font-medium text-slate-900">Manage Menu</p>
              <p className="text-sm text-slate-600">View all items</p>
            </div>
          </Link>
          <Link
            to="/restaurant/orders"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-slate-900">View Orders</p>
              <p className="text-sm text-slate-600">Check orders</p>
            </div>
          </Link>
          <Link
            to="/restaurant/discounts"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="text-2xl">🎫</span>
            <div>
              <p className="font-medium text-slate-900">Discounts</p>
              <p className="text-sm text-slate-600">Manage codes</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {dashboardData.recentOrders.map((order) => (
              <div
                key={order.id || order._id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">Order #{order.id?.slice(-8) || order._id?.toString().slice(-8)}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${order.total?.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{order.status || 'pending'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

