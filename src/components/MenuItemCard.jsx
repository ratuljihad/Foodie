import { useNavigate } from 'react-router-dom';
import { useAppActions, useAppState } from '../context/AppContext';
import { formatPrice } from '../utils/currency';

export const MenuItemCard = ({ item, restaurant }) => {
  const navigate = useNavigate();
  const { addToCart } = useAppActions();
  const { user, cart } = useAppState();
  const restaurantId = restaurant?.id || restaurant?._id;

  const handleCardClick = (e) => {
    // Don't navigate if clicking on a button or interactive element
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    navigate(`/foods/${item._id || item.id}`);
  };

  const handleAdd = (e, isRedeemed) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md text-left cursor-pointer"
    >
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
            <span className="text-4xl text-slate-300">🍲</span>
            <span className="mt-1 text-[10px] font-medium text-slate-400">Deliciousness Pending...</span>
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
            <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">{formatPrice(item.price)}</span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
          {item.country && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-600 border border-orange-100">
              🌍 {item.country}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Best Seller</span>
        </div>

      </div>
    </div>
  );
};

