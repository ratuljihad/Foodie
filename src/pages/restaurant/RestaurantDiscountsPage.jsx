import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { restaurantApi } from '../../api/restaurantClient';

export const RestaurantDiscountsPage = () => {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'percentage',
    value: '',
    code: '',
    description: '',
    minOrder: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantApi.getDiscounts();
      setDiscounts(data);
    } catch (err) {
      console.error('Failed to load discounts:', err);
      setError(err.message || 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await restaurantApi.createDiscount(formData);
      setShowForm(false);
      setFormData({
        type: 'percentage',
        value: '',
        code: '',
        description: '',
        minOrder: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      await loadDiscounts();
    } catch (err) {
      setError(err.message || 'Failed to create discount');
    }
  };

  const isActive = (discount) => {
    const now = new Date();
    const from = new Date(discount.validFrom);
    const until = new Date(discount.validUntil);
    return discount.isActive && now >= from && now <= until;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading discounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Discounts"
          subtitle="Create and manage discount codes for your restaurant"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Discount'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create Discount Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Discount</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Value {formData.type === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Discount Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
                placeholder="SAVE10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
                placeholder="10% off on all orders"
              />
            </div>

            {formData.type === 'flat' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Order ($)</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  min="0"
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Valid From</label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Valid Until</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                Create Discount
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts List */}
      {discounts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600">No discounts created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discounts.map((discount) => {
            const active = isActive(discount);
            return (
              <div
                key={discount.id}
                className={`rounded-xl border p-6 shadow-sm ${active
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-white'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{discount.code}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800'
                          }`}
                      >
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{discount.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                    </p>
                    {discount.minOrder && (
                      <p className="text-xs text-slate-500">Min: ${discount.minOrder}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <span className="font-medium">Valid From:</span>{' '}
                    {discount.validFrom ? format(new Date(discount.validFrom), 'PP') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Valid Until:</span>{' '}
                    {discount.validUntil ? format(new Date(discount.validUntil), 'PP') : 'N/A'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
