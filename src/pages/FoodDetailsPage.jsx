import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userApi } from '../api/userClient';
import { useAppActions, useAppState } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';

export const FoodDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useAppActions();
  const { restaurants } = useAppState();
  const [food, setFood] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadFood = async () => {
      try {
        setLoading(true);
        setError(null);
        const foodData = await userApi.getFoodItem(id);
        setFood(foodData);

        // Find restaurant
        const restaurantData = await userApi.getRestaurant(foodData.restaurantId);
        setRestaurant(restaurantData);
      } catch (err) {
        console.error('Failed to load food:', err);
        setError(err.message || 'Failed to load food item');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFood();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!food || !restaurant) return;

    addToCart({
      id: `cart-${food._id || food.id}-${Date.now()}`,
      menuItem: {
        id: food._id || food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        description: food.description,
      },
      restaurantId: restaurant.id || restaurant._id,
      quantity: quantity,
      isRedeemed: false,
    });

    // Navigate to cart or show success message
    navigate('/cart');
  };

  const imageUrl = food?.image 
    ? (food.image.startsWith('http') ? food.image : `http://localhost:3001${food.image}`)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading food item...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Error" subtitle="Failed to load food item" />
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

  if (!food) {
    return (
      <div className="space-y-4">
        <PageHeader title="Not Found" subtitle="Food item not found" />
        <Link
          to="/"
          className="inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={food.name} 
        subtitle={restaurant?.name || 'Food Details'} 
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={food.name} 
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-slate-100 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{food.name}</h1>
              <span className="text-3xl font-bold text-orange-600">${food.price?.toFixed(2)}</span>
            </div>
            {food.isSignature && (
              <span className="inline-block text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded mb-2">
                Signature Dish
              </span>
            )}
            <p className="text-sm text-slate-500 mb-2">Category: {food.category}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-700">{food.description}</p>
          </div>

          {restaurant && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Restaurant</h3>
              <Link
                to={`/restaurants/${restaurant.id || restaurant._id}`}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                {restaurant.name} →
              </Link>
              {restaurant.cuisine && (
                <p className="text-sm text-slate-600 mt-1">{restaurant.cuisine} cuisine</p>
              )}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium text-slate-700">Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-lg font-semibold text-slate-900 ml-auto">
                Total: ${(food.price * quantity).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

