import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userApi } from '../api/userClient';
import { formatPrice } from '../utils/currency';

export const SearchBar = ({ className = '' }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ restaurants: [], foods: [] });
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length < 2) {
                setResults({ restaurants: [], foods: [] });
                return;
            }

            setLoading(true);
            try {
                const [allRestaurants, foundFoods] = await Promise.all([
                    userApi.getRestaurants(),
                    userApi.searchFoods({ search: query })
                ]);

                const foundRestaurants = allRestaurants.filter(r =>
                    r.name.toLowerCase().includes(query.toLowerCase()) ||
                    r.cuisine.toLowerCase().includes(query.toLowerCase())
                );

                setResults({
                    restaurants: foundRestaurants.slice(0, 3),
                    foods: foundFoods.slice(0, 5)
                });
                setIsOpen(true);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (url) => {
        setIsOpen(false);
        navigate(url);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className={`relative z-50 ${className}`}>
            <form onSubmit={handleSearch} className="relative flex items-center">
                <div className="relative w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-full border-0 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-lg ring-1 ring-slate-200 transition-shadow placeholder:text-slate-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-base"
                        placeholder={t('search.placeholder')}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                    />
                </div>
                <button
                    type="submit"
                    className="absolute right-2 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                    {t('search.button')}
                </button>
            </form>

            {/* Dropdown Results */}
            {isOpen && (query.length >= 2) && (
                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500">{t('search.results.searching')}</div>
                    ) : (results.restaurants.length === 0 && results.foods.length === 0) ? (
                        <div className="p-4 text-center text-slate-500">{t('search.results.noResults')}</div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                            {/* Restaurants Section */}
                            {results.restaurants.length > 0 && (
                                <div className="mb-2">
                                    <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {t('search.results.restaurants')}
                                    </div>
                                    <ul>
                                        {results.restaurants.map((restaurant) => (
                                            <li key={restaurant.id || restaurant._id}>
                                                <button
                                                    onClick={() => handleSelect(`/restaurants?id=${restaurant.id || restaurant._id}`)} // Or specific restaurant page if available
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                                                >
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-lg">
                                                        🏠
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{restaurant.name}</p>
                                                        <p className="text-xs text-slate-500">{restaurant.cuisine}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Dishes Section */}
                            {results.foods.length > 0 && (
                                <div>
                                    <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {t('search.results.dishes')}
                                    </div>
                                    <ul>
                                        {results.foods.map((food) => (
                                            <li key={food._id || food.id}>
                                                <button
                                                    onClick={() => handleSelect(`/foods/${food._id || food.id}`)}
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                                                >
                                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                        {food.image ? (
                                                            <img src={food.image.startsWith('http') ? food.image : `http://localhost:3001${food.image}`} alt={food.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-lg">🍲</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{food.name}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{food.description}</p>
                                                    </div>
                                                    <div className="text-sm font-semibold text-brand-600">
                                                        {formatPrice(food.price)}
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
