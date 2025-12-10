import { useMemo, useState } from 'react';
import { RestaurantCard } from '../components/RestaurantCard';
import { useAppState } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';

export const HomePage = () => {
  const { restaurants, loading, error } = useAppState();
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('all');

  const offers = [
    {
      title: '20% off on your first order',
      description: 'Use code WELCOME20 at checkout. Min $25.',
      badge: 'Limited',
    },
    {
      title: 'Free dessert at Coastal Italian',
      description: 'Redeem once you hit 110 coins. Add to cart to apply.',
      badge: 'Coins',
    },
    {
      title: 'Zero delivery fee tonight',
      description: 'Applies to Umami Street orders over $30.',
      badge: 'Delivery',
    },
  ];

  const filtered = useMemo(
    () =>
      restaurants.filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
        const matchesCuisine = cuisine === 'all' || r.cuisine === cuisine;
        return matchesSearch && matchesCuisine;
      }),
    [restaurants, search, cuisine],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 text-white shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">Foodie Rewards</p>
            <h1 className="text-3xl font-bold">Earn coins, unlock freebies, enjoy fresh food fast.</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-100">
              Pick a restaurant, add to cart, and watch your per-restaurant coins grow. Redeem when you hit the threshold.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold shadow-inner">
            Tonight&apos;s picks: spicy bao · wood-fired pizza · creamy butter chicken
          </div>
        </div>
      </section>

      <section id="offers" className="space-y-3">
        <PageHeader title="Featured offers" subtitle="Limited-time deals and coin perks." />
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{offer.badge}</span>
                <h3 className="text-base font-semibold text-slate-900">{offer.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="restaurants" className="space-y-4">
        <PageHeader id="restaurants" title="Restaurants" subtitle="Browse and earn coins as you order." />
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            aria-label="Search restaurants"
            placeholder="Search by name or cuisine"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:w-72"
          />
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All cuisines</option>
            <option value="Indian">Indian</option>
            <option value="Asian">Asian</option>
            <option value="Italian">Italian</option>
          </select>
        </div>
        {loading && <p className="text-slate-600">Loading restaurants...</p>}
        {error && <p className="text-rose-600">Error: {error}</p>}
        {!loading && !filtered.length && <p className="text-slate-600">No restaurants match that query.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      <section id="coins" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">How coins work</h3>
            <p className="text-sm text-slate-600">
              Earn coins per restaurant based on their coin rate. When your balance hits the threshold, you can redeem any item
              from that restaurant for free.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Tip: Add a signature item when you have enough coins to maximize value.
          </div>
        </div>
      </section>
    </div>
  );
};

