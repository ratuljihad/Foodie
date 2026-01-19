import { useAppActions } from '../context/AppContext';
import { formatPrice } from '../utils/currency';

export const CartItemRow = ({ item, restaurant }) => {
  const { updateQty, removeFromCart } = useAppActions();

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-base font-semibold text-slate-900">{item.menuItem.name}</h4>
          {item.isRedeemed && (
            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Redeemed</span>
          )}
        </div>
        <p className="text-sm text-slate-600">{item.menuItem.description}</p>
        <p className="text-sm font-semibold text-slate-800">
          {item.isRedeemed ? 'Free' : formatPrice(item.menuItem.price)} · {restaurant?.name}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
          <button
            aria-label="Decrease quantity"
            className="px-3 py-2 text-lg font-semibold text-slate-700 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            onClick={() => updateQty(item.id, Math.max(0, item.quantity - 1))}
          >
            -
          </button>
          <span className="w-10 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
          <button
            aria-label="Increase quantity"
            className="px-3 py-2 text-lg font-semibold text-slate-700 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            onClick={() => updateQty(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>
        <button
          onClick={() => removeFromCart(item.id)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

