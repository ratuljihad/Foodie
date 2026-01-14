import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppContext';
import { userApi } from '../../api/userClient';
import { nextRewardProgress } from '../../utils/coin';

export const UserCoinsPage = () => {
  const { user } = useAuth();
  const { restaurants } = useAppState();
  const [coinBalances, setCoinBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setLoading(true);
        const response = await userApi.getCoins();
        setCoinBalances(response.coinBalances || []);
      } catch (err) {
        console.error('Failed to load coins:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCoins();
    }
  }, [user]);

  const getRestaurantInfo = (restaurantId) => {
    return restaurants.find((r) => r.id === restaurantId);
  };

  const totalCoins = coinBalances.reduce((sum, b) => sum + (b.coins || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading coins...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Coins" 
        subtitle="Earn coins at each restaurant and redeem them for rewards" 
      />

      {/* Total Coins Summary */}
      <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">Total Coins</p>
            <p className="mt-2 text-4xl font-bold text-orange-900">{totalCoins}</p>
            <p className="mt-1 text-sm text-orange-600">
              Across {coinBalances.length} restaurant{coinBalances.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-6xl">🪙</div>
        </div>
      </div>

      {/* Restaurant Coin Balances */}
      {coinBalances.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600 mb-4">You don't have any coins yet.</p>
          <Link
            to="/restaurants"
            className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {coinBalances.map((balance) => {
            const restaurant = getRestaurantInfo(balance.restaurantId);
            if (!restaurant) return null;

            const { remaining, progress } = nextRewardProgress(
              balance.coins,
              restaurant.coinThreshold
            );

            return (
              <div
                key={balance.restaurantId}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{restaurant.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{restaurant.cuisine}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{balance.coins}</p>
                    <p className="text-xs text-slate-500">coins</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Progress to next reward
                    </span>
                    <span className="text-sm text-slate-600">
                      {balance.coins} / {restaurant.coinThreshold}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {remaining > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {remaining} more coins needed for next reward
                    </p>
                  )}
                  {remaining === 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      🎉 You can redeem a reward!
                    </p>
                  )}
                </div>

                {/* Coin Earning Info */}
                <div className="rounded-lg bg-slate-50 p-3 mb-4">
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Earning rate:</span> {restaurant.coinRate} coins per $5 spent
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-medium">Reward threshold:</span> {restaurant.coinThreshold} coins
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Order More
                  </Link>
                  {balance.coins >= restaurant.coinThreshold && (
                    <Link
                      to={`/restaurants/${restaurant.id}`}
                      className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                    >
                      Redeem Reward
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How Coins Work</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Earn coins when you order from restaurants</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Each restaurant has its own coin balance and reward threshold</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Redeem coins for free items or discounts at checkout</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Coins are specific to each restaurant</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
