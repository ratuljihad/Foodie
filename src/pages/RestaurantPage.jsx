import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
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
      try {
        const [restaurantData, menuData] = await Promise.all([api.getRestaurant(id), api.getMenu(id)]);
        setRestaurant(restaurantData);
        setMenu(menuData);
        setError(undefined);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const coins = restaurant ? user?.coinBalances.find((c) => c.restaurantId === restaurant.id)?.coins ?? 0 : 0;
  const { progress, remaining } = restaurant ? nextRewardProgress(coins, restaurant.coinThreshold) : { progress: 0, remaining: 0 };

  const groupedMenu = useMemo(() => {
    const groups = {};
    menu.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [menu]);

  if (loading) return <p className="text-slate-600">Loading restaurant...</p>;
  if (error) return <p className="text-rose-600">Error: {error}</p>;
  if (!restaurant) return <p className="text-slate-600">Restaurant not found.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Restaurant</p>
            <h1 className="text-3xl font-bold text-slate-900">{restaurant.name}</h1>
            <p className="text-slate-600">{restaurant.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">⭐ {restaurant.rating.toFixed(1)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{restaurant.cuisine}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">ETA {restaurant.eta}</span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                Coins {restaurant.coinRate}/$ · Redeem at {restaurant.coinThreshold}
              </span>
            </div>
          </div>
          <div className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Your coins here</p>
            <div className="mt-2 text-2xl font-bold text-brand-700">{coins}</div>
            <p className="text-sm text-slate-600">
              {remaining === 0 ? 'You can redeem a free item now!' : `${remaining} coins to unlock a free item.`}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {Object.entries(groupedMenu).map(([category, items]) => (
        <section key={category} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{category}</h2>
            <span className="text-sm text-slate-600">{items.length} items</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

