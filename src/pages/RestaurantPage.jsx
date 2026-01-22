import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { userApi } from '../api/userClient';
import { MenuItemCard } from '../components/MenuItemCard';
import { useAppState } from '../context/AppContext';
import { formatPrice } from '../utils/currency';

export const RestaurantPage = () => {
  const { id } = useParams();
  const { user } = useAppState();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [restaurantData, menuData, discountData] = await Promise.all([
          userApi.getRestaurant(id),
          userApi.getMenuItems(id),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/discounts/restaurant/${id}`).then(res => res.data)
        ]);
        setRestaurant(restaurantData);
        setMenu(menuData);
        setDiscounts(discountData);
      } catch (err) {
        console.error('Failed to load restaurant:', err);
        setError(err.message || 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);



  const groupedMenu = useMemo(() => {
    const groups = {};
    const filteredMenu = countryFilter
      ? menu.filter(item => item.country === countryFilter)
      : menu;

    filteredMenu.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [menu, countryFilter]);

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

  const imageUrl = restaurant?.image
    ? (restaurant.image.startsWith('http') ? restaurant.image : `http://localhost:3001${restaurant.image}`)
    : null;

  return (
    <div className="space-y-8">
      {/* Restaurant Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-premium min-h-[300px]">
        {/* Background Image with Overlay */}
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={restaurant.name}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-premium"></div>
        )}

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between px-8 py-10 text-white">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span>Restaurant</span>
              <span>•</span>
              <span>{restaurant.cuisine || 'Multi-cuisine'}</span>
            </div>
            <div className="flex items-center gap-4">
              {restaurant.logo && restaurant.logoStatus === 'approved' && (
                <div
                  className="hidden md:block overflow-hidden rounded-lg bg-white/10 p-2 backdrop-blur-sm border border-white/20"
                  style={{
                    width: `${(restaurant.logoSettings?.width || 40) * 1.5}px`,
                    height: `${(restaurant.logoSettings?.height || 40) * 1.5}px`
                  }}
                >
                  <img
                    src={restaurant.logo.startsWith('http') ? restaurant.logo : `http://localhost:3001${restaurant.logo}`}
                    alt={`${restaurant.name} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{restaurant.name}</h1>
            </div>
            <p className="mt-4 text-lg text-brand-100/90 max-w-xl">{restaurant.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium">
              {restaurant.rating && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md">
                  <span>⭐</span> {restaurant.rating.toFixed(1)}
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md">
                <span>🕒</span> ETA {restaurant.eta || '30-40 mins'}
              </div>
            </div>
          </div>


        </div>

        {/* Decorative BGs */}
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent-500/20 blur-3xl"></div>
      </div>

      {/* Dynamic Discounts Section */}
      {discounts.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎁</span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Offers</h2>
          </div>
          <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {discounts.map((discount) => (
              <div
                key={discount._id}
                className="flex-shrink-0 w-72 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-5 hover:border-orange-400 transition-all hover:bg-orange-50 group hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="rounded-lg bg-orange-500 px-3 py-1 text-xs font-black text-white uppercase tracking-wider shadow-sm">
                    {discount.code}
                  </div>
                  <div className="text-xl font-black text-orange-600">
                    {discount.type === 'percentage' ? `${discount.value}% OFF` : `৳${discount.value} OFF`}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{discount.description}</h3>
                {discount.minOrder > 0 && (
                  <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Min order: {formatPrice(discount.minOrder)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Restaurant Gallery */}
      {restaurant.gallery && restaurant.gallery.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Photos</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {restaurant.gallery.map((img, index) => (
              <div
                key={index}
                className="relative h-48 w-72 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]"
              >
                <img
                  src={img.startsWith('http') ? img : `http://localhost:3001${img}`}
                  alt={`${restaurant.name} gallery ${index}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Menu</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Origin:</span>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Countries</option>
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
        </div>
      </section>
      {Object.entries(groupedMenu).map(([category, items]) => (
        <section key={category} className="space-y-3 mt-8">
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

