import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppContext';

export const OrdersPage = () => {
  const { orders, loading } = useAppState();

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Your recent orders and coin changes." />
      {loading && <p className="text-slate-600">Loading orders...</p>}
      {!loading && !orders.length && <p className="text-slate-600">No orders yet.</p>}
      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{order.restaurantName}</h3>
                <p className="text-sm text-slate-600">{format(new Date(order.createdAt), 'PP p')}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                <p className="text-sm text-brand-700">Coins Δ {order.coinDelta >= 0 ? '+' : ''}{order.coinDelta}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {order.items.map((item) => (
                <li key={item.menuItemId} className="flex items-center justify-between">
                  <span>
                    {item.name} × {item.quantity} {item.isRedeemed && <span className="text-green-600">(redeemed)</span>}
                  </span>
                  <span>${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
};

