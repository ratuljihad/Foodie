import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { userApi } from '../api/userClient';
import { PageHeader } from '../components/PageHeader';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    category: searchParams.get('category') || '',
    restaurantId: searchParams.get('restaurant') || '',
  });

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim() && !filter.category && !filter.restaurantId) {
        setFoods([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [foodsData, restaurantsData] = await Promise.all([
          userApi.searchFoods({
            search: query,
            category: filter.category,
            restaurantId: filter.restaurantId,
          }),
          userApi.getRestaurants(),
        ]);

        setFoods(foodsData);
        setRestaurants(restaurantsData);
      } catch (err) {
        console.error('Search failed:', err);
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, filter.category, filter.restaurantId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim(), ...filter });
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilter = { ...filter, [key]: value };
    setFilter(newFilter);
    setSearchParams({ q: query, ...newFilter });
  };

  const categories = useMemo(() => {
    const cats = new Set(foods.map((f) => f.category));
    return Array.from(cats).sort();
  }, [foods]);

  const getImageUrl = (image) => {
    if (!image) return null;
    return image.startsWith('http') ? image : `http://localhost:3001${image}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Search" subtitle="Find your favorite foods" />

      {/* Search Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for foods..."
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={filter.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Restaurant</label>
              <select
                value={filter.restaurantId}
                onChange={(e) => handleFilterChange('restaurantId', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">All Restaurants</option>
                {restaurants.map((r) => (
                  <option key={r.id || r._id} value={r.id || r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Searching...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600 mb-4">No results found</p>
          <p className="text-sm text-slate-500">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Found {foods.length} {foods.length === 1 ? 'item' : 'items'}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => {
              const imageUrl = getImageUrl(food.image);
              const restaurant = restaurants.find((r) => (r.id || r._id) === food.restaurantId);
              return (
                <Link
                  key={food._id || food.id}
                  to={`/foods/${food._id || food.id}`}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {imageUrl && (
                    <img src={imageUrl} alt={food.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{food.name}</h3>
                        {food.isSignature && (
                          <span className="inline-block mt-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            Signature
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-slate-900">${food.price?.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{food.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{food.category}</span>
                      {restaurant && <span>{restaurant.name}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

