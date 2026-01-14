import { Link } from 'react-router-dom';
import { nextRewardProgress } from '../utils/coin';
import { useAppState } from '../context/AppContext';

export const RestaurantCard = ({ restaurant }) => {
  const { user } = useAppState();
  const restaurantId = restaurant?.id || restaurant?._id;
  const coins = restaurantId ? user?.coinBalances?.find((c) => c.restaurantId === restaurantId)?.coins ?? 0 : 0;
  const { remaining, progress } = nextRewardProgress(coins, restaurant?.coinThreshold || 100);

  const thumbnailUrl = restaurant?.thumbnail 
    ? (restaurant.thumbnail.startsWith('http') ? restaurant.thumbnail : `http://localhost:3001${restaurant.thumbnail}`)
    : null;

  return (
    <Link to={`/restaurants/${restaurantId}`}>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card hover:shadow-lg transition-shadow">
        <div className="relative h-40 overflow-hidden bg-slate-100">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={restaurant.name} className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-5xl">🍽️</span>
            </div>
          )}
          {restaurant?.rating && (
            <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow">
              ⭐ {restaurant.rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{restaurant.name}</h3>
              {restaurant.cuisine && (
                <p className="text-sm text-slate-600">{restaurant.cuisine}</p>
              )}
            </div>
            {restaurant?.eta && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{restaurant.eta}</span>
            )}
          </div>
          {restaurant.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{restaurant.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-slate-100 px-2 py-1">Coins: {restaurant?.coinRate || 5}/$</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">Redeem @ {restaurant?.coinThreshold || 100}</span>
          </div>
          <div className="mt-auto">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>Coins here: {coins}</span>
              <span>{remaining === 0 ? 'Ready to redeem' : `${remaining} to next reward`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

