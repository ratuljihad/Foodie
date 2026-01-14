import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { restaurantApi } from '../../api/restaurantClient';

export const RestaurantCoinsPage = () => {
  const { user } = useAuth();
  const [restaurantCoins, setRestaurantCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await restaurantApi.getCoins();
        setRestaurantCoins(response.restaurantCoins || 0);
      } catch (err) {
        console.error('Failed to load restaurant coins:', err);
        setError(err.message || 'Failed to load coins');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCoins();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading coins...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Restaurant Coins" subtitle="Manage your restaurant coins" />
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Restaurant Coins" 
        subtitle="Earn coins from orders and convert them into promotions" 
      />

      {/* Coins Summary */}
      <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">Total Restaurant Coins</p>
            <p className="mt-2 text-4xl font-bold text-orange-900">{restaurantCoins}</p>
            <p className="mt-1 text-sm text-orange-600">
              Earned from completed orders
            </p>
          </div>
          <div className="text-6xl">🪙</div>
        </div>
      </div>

      {/* Conversion Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Special Discount Campaign</h3>
          <p className="text-sm text-slate-600 mb-4">
            Convert 10 restaurant coins into a special discount campaign
          </p>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Progress</span>
              <span className="text-sm font-medium text-slate-900">
                {restaurantCoins} / 10 coins
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300"
                style={{ width: `${Math.min((restaurantCoins / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
          <button
            disabled={restaurantCoins < 10}
            className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {restaurantCoins >= 10 ? 'Create Campaign' : 'Not Enough Coins'}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Platform Promotion</h3>
          <p className="text-sm text-slate-600 mb-4">
            Convert 15 restaurant coins into a featured platform promotion
          </p>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Progress</span>
              <span className="text-sm font-medium text-slate-900">
                {restaurantCoins} / 15 coins
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-300"
                style={{ width: `${Math.min((restaurantCoins / 15) * 100, 100)}%` }}
              />
            </div>
          </div>
          <button
            disabled={restaurantCoins < 15}
            className="w-full rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {restaurantCoins >= 15 ? 'Create Promotion' : 'Not Enough Coins'}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How Restaurant Coins Work</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Earn 1 restaurant coin for each completed order</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use coins to create special discounts and promotions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>10 coins = Special discount campaign</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>15 coins = Featured platform promotion</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
