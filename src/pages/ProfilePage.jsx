import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppContext';
import { nextRewardProgress } from '../utils/coin';

export const ProfilePage = () => {
  const { user, restaurants } = useAppState();

  if (!user) return <p className="text-slate-600">Loading profile...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Track your loyalty coins per restaurant." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Member</p>
        <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
        <p className="text-sm text-slate-600">Tier: {user.tier}</p>
      </div>
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Coin balances</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {user.coinBalances.map((balance) => {
            const restaurant = restaurants.find((r) => r.id === balance.restaurantId);
            if (!restaurant) return null;
            const { progress, remaining } = nextRewardProgress(balance.coins, restaurant.coinThreshold);
            return (
              <div key={balance.restaurantId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{restaurant.name}</p>
                    <p className="text-xs text-slate-500">{restaurant.cuisine}</p>
                  </div>
                  <span className="text-lg font-bold text-brand-700">{balance.coins} coins</span>
                </div>
                <p className="text-sm text-slate-600">
                  {remaining === 0 ? 'Ready for a free item!' : `${remaining} coins to next reward`}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

