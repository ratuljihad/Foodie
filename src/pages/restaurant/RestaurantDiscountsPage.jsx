import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { restaurantApi } from '../../api/restaurantClient';
import { formatPrice } from '../../utils/currency';

export const RestaurantDiscountsPage = () => {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'percentage',
    value: '',
    code: '',
    description: '',
    minOrder: '0',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '',
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

  const resetForm = () => {
    setFormData({
      type: 'percentage',
      value: '',
      code: '',
      description: '',
      minOrder: '0',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (discount) => {
    setFormData({
      type: discount.type,
      value: discount.value,
      code: discount.code,
      description: discount.description,
      minOrder: discount.minOrder || '0',
      validFrom: new Date(discount.validFrom).toISOString().split('T')[0],
      validUntil: new Date(discount.validUntil).toISOString().split('T')[0],
      usageLimit: discount.usageLimit || '',
    });
    setEditingId(discount._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this discount? This action cannot be undone.')) return;
    try {
      setError(null);
      await restaurantApi.deleteDiscount(discountId);
      await loadDiscounts();
    } catch (err) {
      setError(err.message || 'Failed to delete discount');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingId) {
        await restaurantApi.updateDiscount(editingId, formData);
      } else {
        await restaurantApi.createDiscount(formData);
      }
      resetForm();
      await loadDiscounts();
    } catch (err) {
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} discount`);
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
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${showForm ? 'bg-slate-500 hover:bg-slate-600' : 'bg-orange-500 hover:bg-orange-600'
            }`}
        >
          {showForm ? 'Cancel' : '+ Create Discount'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create/Edit Discount Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-in slide-in-from-top-4 duration-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Discount' : 'Create New Discount'}
          </h2>
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
                  Value {formData.type === 'percentage' ? '(%)' : '(৳)'}
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

            <div className="grid gap-4 md:grid-cols-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Usage Limit (Optional)</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. 100 users"
                  min="1"
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Order (৳)</label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                min="0"
              />
            </div>

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

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100"
              >
                {editingId ? 'Update Discount' : 'Create Discount'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
                key={discount._id}
                className={`group rounded-xl border p-6 transition-all hover:shadow-md ${active
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-slate-200 bg-white'
                  }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{discount.code}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                          }`}
                      >
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium mb-3">{discount.description}</p>

                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="font-semibold text-slate-700">Valid:</span>
                        {format(new Date(discount.validFrom), 'PP')} - {format(new Date(discount.validUntil), 'PP')}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="font-semibold text-slate-700">Usage:</span>
                        {discount.usedCount} {discount.usageLimit ? `/ ${discount.usageLimit}` : 'unlimited'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-6 border-t border-slate-200 pt-4 md:flex-col md:items-end md:justify-start md:border-0 md:pt-0">
                    <div className="text-right">
                      <p className="text-3xl font-black text-slate-900">
                        {discount.type === 'percentage' ? `${discount.value}%` : formatPrice(discount.value)}
                      </p>
                      {discount.minOrder > 0 && (
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Min: {formatPrice(discount.minOrder)}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title="Edit Discount"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-5-5l5 5m0 0l-5 5m5-5H13" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(discount._id)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                        title="Delete Discount"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
