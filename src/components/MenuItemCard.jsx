import { useAppActions, useAppState } from '../context/AppContext';
import { canRedeem } from '../utils/coin';

export const MenuItemCard = ({ item, restaurant }) => {
  const { addToCart } = useAppActions();
  const { user, cart } = useAppState();
  const restaurantId = restaurant?.id || restaurant?._id;
  const coins = restaurantId ? user?.coinBalances?.find((c) => c.restaurantId === restaurantId)?.coins ?? 0 : 0;
  const coinsCommitted = cart.filter((c) => c.restaurantId === restaurantId && c.isRedeemed).length * (restaurant?.coinThreshold || 100);
  const redeemable = canRedeem(Math.max(0, coins - coinsCommitted), restaurant?.coinThreshold || 100);

  const handleAdd = (isRedeemed) => {
    addToCart({
      id: `${item._id || item.id}${isRedeemed ? '-redeem' : ''}-${Date.now()}`,
      menuItem: item,
      quantity: 1,
      restaurantId: restaurantId,
      isRedeemed,
    });
  };

  const imageUrl = item.image 
    ? (item.image.startsWith('http') ? item.image : `http://localhost:3001${item.image}`)
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {item.isSignature && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow">
            Signature
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">${item.price}</span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-1">Coins: +{restaurant?.coinRate || 5}/$</span>
          {redeemable && (
            <button
              onClick={() => handleAdd(true)}
              className="rounded-full border border-brand-500 px-3 py-1 text-brand-700 transition hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Redeem for free
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAdd(false)}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

