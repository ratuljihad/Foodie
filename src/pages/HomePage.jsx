import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RestaurantCard } from '../components/RestaurantCard';
import { SearchBar } from '../components/SearchBar';
import { CuisineSection } from '../components/CuisineSection';
import { DealsSection } from '../components/DealsSection';
import { useAppState } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { formatPrice } from '../utils/currency';

export const HomePage = () => {
  const { user, restaurants, loading, error } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  const country = searchParams.get('country') || '';

  const handleCountrySelect = (selectedCountry) => {
    if (!selectedCountry) {
      searchParams.delete('country');
    } else {
      searchParams.set('country', selectedCountry);
    }
    setSearchParams(searchParams);
  };



  const filtered = useMemo(
    () =>
      restaurants.filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
        const matchesCountry = !country || r.country === country;
        return matchesSearch && matchesCountry;
      }),
    [restaurants, search, country],
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-premium px-8 py-16 text-white shadow-premium sm:px-12 sm:py-24">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
            {t('hero.badge')}
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t('hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-100 to-white">{t('hero.titleSuffix')}</span>
          </h1>
          <p className="mt-6 text-lg text-brand-100 sm:text-xl">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-full max-w-lg">
              <SearchBar />
            </div>
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


      {/* Cuisine Section */}
      <CuisineSection />

      <section id="restaurants" className="space-y-6">
        <PageHeader id="restaurants" title="Restaurants" subtitle="Browse our partner restaurants." />
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            aria-label="Search restaurants"
            placeholder="Search by name or cuisine"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:w-72"
          />
          <select
            value={country}
            onChange={(e) => handleCountrySelect(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Select Country</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="India">India</option>
            <option value="Italy">Italy</option>
            <option value="China">China</option>
            <option value="Thailand">Thailand</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Mexico">Mexico</option>
            <option value="Japan">Japan</option>
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


    </div>
  );
};

