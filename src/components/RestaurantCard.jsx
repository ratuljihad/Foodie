import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { formatPrice } from '../utils/currency';

export const RestaurantCard = ({ restaurant }) => {
  const { user } = useAppState();
  const restaurantId = restaurant?.id || restaurant?._id;

  const imageUrl = restaurant?.image
    ? (restaurant.image.startsWith('http') ? restaurant.image : `http://localhost:3001${restaurant.image}`)
    : null;

  return (
    <Link to={`/restaurants/${restaurantId}`}>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card hover:shadow-lg transition-shadow">
        <div className="relative h-40 overflow-hidden bg-slate-100">
          {imageUrl ? (
            <img src={imageUrl} alt={restaurant.name} className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
              <span className="text-5xl">🏪</span>
              <span className="mt-2 text-xs font-medium text-slate-400">No Image Available</span>
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

        </div>
      </article>
    </Link>
  );
};

