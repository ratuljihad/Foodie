import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RestaurantCard } from '../components/RestaurantCard';
import { useAppState } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';

export const RestaurantListPage = () => {
  const { restaurants, loading, error } = useAppState();
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('all');

  const filtered = useMemo(
    () =>
      restaurants.filter((r) => {
        const matchesSearch =
          r.name?.toLowerCase().includes(search.toLowerCase()) || 
          r.cuisine?.toLowerCase().includes(search.toLowerCase());
        const matchesCuisine = cuisine === 'all' || r.cuisine === cuisine;
        return matchesSearch && matchesCuisine;
      }),
    [restaurants, search, cuisine],
  );

  const cuisines = useMemo(() => {
    const uniqueCuisines = new Set(restaurants.map((r) => r.cuisine).filter(Boolean));
    return Array.from(uniqueCuisines).sort();
  }, [restaurants]);

  return (
    <div className="space-y-6">
      <PageHeader title="Restaurants" subtitle="Browse and earn coins as you order." />
      
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          aria-label="Search restaurants"
          placeholder="Search by name or cuisine"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:w-72"
        />
        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All cuisines</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-slate-600">Loading restaurants...</p>}
      {error && <p className="text-rose-600">Error: {error}</p>}
      {!loading && !filtered.length && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600 mb-4">No restaurants match that query.</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((restaurant) => (
          <RestaurantCard key={restaurant.id || restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

