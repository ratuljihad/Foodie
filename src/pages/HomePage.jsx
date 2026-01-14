import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RestaurantCard } from '../components/RestaurantCard';
import { useAppState } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';

export const HomePage = () => {
  const { user, restaurants, loading, error } = useAppState();
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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-premium px-8 py-16 text-white shadow-premium sm:px-12 sm:py-24">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
            🚀 Foodie Rewards are here
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Dining, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-100 to-white">Reimagined.</span>
          </h1>
          <p className="mt-6 text-lg text-brand-100 sm:text-xl">
            Order from the best local restaurants, earn coins with every bite, and unlock exclusive freebies.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/restaurants"
              className="rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand-600 shadow-lg transition-transform hover:scale-105"
            >
              Explore Restaurants
            </Link>
            {!user && (
              <Link
                to="/login"
                className="rounded-xl bg-brand-700/50 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-brand-700/70"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent-500/30 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl"></div>
      </section>

      <section id="offers" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Offers</h2>
          <Link to="/restaurants" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all deals →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.title} className="glass-panel hover-card-premium group relative rounded-2xl p-6 transition-all hover:bg-white/80">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{offer.badge}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{offer.title}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{offer.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="restaurants" className="space-y-6">
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
            <RestaurantCard key={restaurant.id || restaurant._id} restaurant={restaurant} />
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

