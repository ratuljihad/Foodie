import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItemRow } from '../components/CartItemRow';
import { PageHeader } from '../components/PageHeader';
import { useAppActions, useAppState } from '../context/AppContext';
import { calculateCoinDelta, calculateSubtotal } from '../utils/coin';
import { formatPrice } from '../utils/currency';

export const CartPage = () => {
  const { cart, restaurants, user } = useAppState();
  const { checkout } = useAppActions();
  const navigate = useNavigate();
  const [status, setStatus] = useState();

  const cartByRestaurant = useMemo(() => {
    const map = new Map();
    cart.forEach((item) => {
      const restaurant = restaurants.find((r) => r.id === item.restaurantId);
      const entry = map.get(item.restaurantId) ?? { items: [], restaurantName: restaurant?.name ?? 'Restaurant' };
      entry.items.push(item);
      map.set(item.restaurantId, entry);
    });
    return Array.from(map.entries());
  }, [cart, restaurants]);

  const handleCheckout = async (restaurantId, restaurantName) => {
    if (!user) {
      setStatus('You must be logged in to checkout.');
      // Optional: Redirect to login or show modal
      return;
    }

    setStatus('Processing order...');
    try {
      const order = await checkout({ restaurantId, restaurantName });
      if (order) {
        setStatus('Order placed! Redirecting to orders…');
        setTimeout(() => navigate('/orders'), 800);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      // Display the actual error message from the backend if available
      setStatus(err.message || 'Unable to checkout. Please try again.');
    }
  };

  if (!cart.length) {
    return (
      <div className="space-y-4">
        <PageHeader title="Cart" subtitle="Add delicious items to get started." />
        <p className="text-slate-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cart" subtitle="Review your items, coins and redeem rewards." />
      {cartByRestaurant.map(([restaurantId, data]) => {
        const restaurant = restaurants.find((r) => r.id === restaurantId);
        const subtotal = calculateSubtotal(data.items);
        const coinSnapshot =
          user?.coinBalances.reduce((acc, c) => {
            acc[c.restaurantId] = c.coins;
            return acc;
          }, {}) ?? {};
        const { earnings, redemptions } = calculateCoinDelta(data.items, restaurants);
        const earned = earnings[restaurantId] ?? 0;
        const spent = redemptions[restaurantId] ?? 0;
        const netCoins = (coinSnapshot[restaurantId] ?? 0) + earned - spent;
        return (
          <section key={restaurantId} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{data.restaurantName}</h2>
                <p className="text-sm text-slate-600">Subtotal {formatPrice(subtotal)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
                Coins now: {coinSnapshot[restaurantId] ?? 0} · Earn {earned} this order · Spend {spent} · After: {netCoins}
              </div>
            </div>
            <div className="space-y-3">
              {data.items.map((item) => (
                <CartItemRow key={item.id} item={item} restaurant={restaurant} />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-700">
                Coins earned are based on subtotal and restaurant coin rate. Redeemed items consume the restaurant
                threshold amount.
              </div>
              <button
                onClick={() => navigate('/checkout', { state: { restaurantId, restaurantName: data.restaurantName } })}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Proceed to Checkout
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
};

