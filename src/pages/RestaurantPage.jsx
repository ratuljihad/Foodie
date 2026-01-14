import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../api/userClient';
import { MenuItemCard } from '../components/MenuItemCard';
import { useAppState } from '../context/AppContext';
import { nextRewardProgress } from '../utils/coin';

export const RestaurantPage = () => {
  const { id } = useParams();
  const { user } = useAppState();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [restaurantData, menuData] = await Promise.all([
          userApi.getRestaurant(id),
          userApi.getMenuItems(id),
        ]);
        setRestaurant(restaurantData);
        setMenu(menuData);
      } catch (err) {
        console.error('Failed to load restaurant:', err);
        setError(err.message || 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const restaurantId = restaurant?.id || restaurant?._id;
  const coins = restaurantId ? user?.coinBalances?.find((c) => c.restaurantId === restaurantId)?.coins ?? 0 : 0;
  const { progress, remaining } = restaurant ? nextRewardProgress(coins, restaurant.coinThreshold || 100) : { progress: 0, remaining: 0 };

  const groupedMenu = useMemo(() => {
    const groups = {};
    menu.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [menu]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading restaurant...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-rose-600">{error}</p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }
  if (!restaurant) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Restaurant not found.</p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Restaurant Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-premium px-8 py-10 text-white shadow-premium">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span>Restaurant</span>
              <span>•</span>
              <span>{restaurant.cuisine || 'Multi-cuisine'}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
            <p className="mt-3 text-lg text-brand-100">{restaurant.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium">
              {restaurant.rating && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md">
                  <span>⭐</span> {restaurant.rating.toFixed(1)}
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md">
                <span>🕒</span> ETA {restaurant.eta || '30-40 mins'}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1 shadow-sm">
                <span>🪙</span> Earn {restaurant.coinRate || 5} coins/$
              </div>
            </div>
          </div>

          {/* Coins Status Card */}
          <div className="w-full max-w-sm rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20 shadow-lg">
            <p className="text-sm font-semibold text-brand-100">Your Rewards</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{coins}</span>
              <span className="text-sm text-brand-200">coins</span>
            </div>
            <p className="mt-2 text-sm text-brand-100">
              {remaining === 0
                ? '🎉 You can redeem a free item now!'
                : `${remaining} more coins to unlock a free item.`}
            </p>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full rounded-full bg-accent-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-right text-xs text-brand-200">
              Goal: {restaurant.coinThreshold || 100}
            </div>
          </div>
        </div>

        {/* Decorative BGs */}
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent-500/20 blur-3xl"></div>
      </div>

      {Object.entries(groupedMenu).map(([category, items]) => (
        <section key={category} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{category}</h2>
            <span className="text-sm text-slate-600">{items.length} items</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <MenuItemCard key={item._id || item.id} item={item} restaurant={restaurant} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

