import { nextRewardProgress } from '../utils/coin';
import { useAppState } from '../context/AppContext';

export const RestaurantCard = ({ restaurant }) => {
  const { user } = useAppState();
  const coins = user?.coinBalances.find((c) => c.restaurantId === restaurant.id)?.coins ?? 0;
  const { remaining, progress } = nextRewardProgress(coins, restaurant.coinThreshold);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="relative h-40 overflow-hidden">
        <img src={restaurant.thumbnail} alt={restaurant.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow">
          ⭐ {restaurant.rating.toFixed(1)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{restaurant.name}</h3>
            <p className="text-sm text-slate-600">{restaurant.cuisine}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{restaurant.eta}</span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{restaurant.description}</p>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-1">Coins: {restaurant.coinRate}/$</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">Redeem @ {restaurant.coinThreshold}</span>
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
  );
};

