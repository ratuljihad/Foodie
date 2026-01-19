import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAppActions, useAppState } from '../context/AppContext';
import { calculateSubtotal } from '../utils/coin';

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, user, restaurants } = useAppState();
    const { checkout } = useAppActions();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        paymentMethod: 'cod', // Default to Cash on Delivery
        notes: '',
    });

    // Get checkout context (restaurant info) passed from CartPage
    const { restaurantId, restaurantName } = location.state || {};

    useEffect(() => {
        // Redirect if no direct access or empty cart
        if (!cart.length || !restaurantId) {
            navigate('/cart');
        }
    }, [cart, restaurantId, navigate]);

    // Filter items for the specific restaurant being checked out
    const checkoutItems = cart.filter(item => item.restaurantId === restaurantId);
    const subtotal = calculateSubtotal(checkoutItems);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.address || !formData.phone || !formData.name) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const orderData = {
                restaurantId,
                restaurantName,
                customerName: formData.name,
                customerPhone: formData.phone,
                deliveryAddress: formData.address,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
            };

            const order = await checkout(orderData);
            navigate(`/orders/${order._id || order.id}/track`);
        } catch (err) {
            console.error('Checkout failed:', err);
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart.length || !checkoutItems.length) return null;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader title="Checkout" subtitle={`Ordering from ${restaurantName}`} />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Order Summary */}
                <div className="md:order-2 space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-4">
                            {checkoutItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        {item.quantity}x {item.menuItem.name}
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center font-bold text-lg text-slate-900">
                            <span>Total</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="md:order-1">
                    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Delivery Details</h3>

                        {error && (
                            <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                placeholder="+1 234 567 890"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                placeholder="123 Main St, Apt 4B"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Order Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="2"
                                className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                placeholder="Any special instructions?"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Payment Method</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                        className="text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="font-medium text-slate-900">Cash on Delivery</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 opacity-60">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        disabled
                                        className="text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="font-medium text-slate-900">Credit Card (Coming Soon)</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Placing Order...' : `Place Order ($${subtotal.toFixed(2)})`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
