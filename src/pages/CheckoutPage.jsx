import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PageHeader } from '../components/PageHeader';
import { useAppActions, useAppState } from '../context/AppContext';
import { calculateSubtotal } from '../utils/order';
import { formatPrice } from '../utils/currency';

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

    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [promoError, setPromoError] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/discounts/validate`, {
                code: promoCode,
                restaurantId,
                total: subtotal
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            setAppliedDiscount(response.data);
            setPromoError(null);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setPromoError('Your session has expired. Please log in again to apply promo codes.');
            } else {
                setPromoError(err.response?.data?.error || 'Invalid promo code');
            }
            setAppliedDiscount(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedDiscount(null);
        setPromoCode('');
        setPromoError(null);
    };

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
    const total = appliedDiscount ? Math.max(0, subtotal - appliedDiscount.amount) : subtotal;

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
                discount: appliedDiscount ? {
                    code: appliedDiscount.code,
                    amount: appliedDiscount.amount,
                    id: appliedDiscount.discountId
                } : null
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
                                        {formatPrice(item.menuItem.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="text-slate-900 font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount ({appliedDiscount.code})</span>
                                    <span>-{formatPrice(appliedDiscount.amount)}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center font-extrabold text-xl text-slate-900">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>

                        {/* Promo Code Input */}
                        {!appliedDiscount ? (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Promo Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        className="flex-1 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm font-bold tracking-widest"
                                        placeholder="ENTER CODE"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !promoCode}
                                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition-colors disabled:opacity-50 uppercase tracking-widest"
                                    >
                                        {promoLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {promoError && (
                                    <p className="mt-2 text-xs font-bold text-rose-500">{promoError}</p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between rounded-xl bg-green-50 p-4 border-2 border-dashed border-green-200">
                                <div>
                                    <p className="text-xs font-black text-green-800 uppercase tracking-widest">Code Applied!</p>
                                    <p className="text-sm font-bold text-green-700">{appliedDiscount.code}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemovePromo}
                                    className="text-xs font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 flex items-center gap-2">
                                            <span>💵</span> Cash on Delivery
                                        </span>
                                        <span className="text-xs text-slate-500">Pay when you receive</span>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'bkash' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bkash"
                                        checked={formData.paymentMethod === 'bkash'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 flex items-center gap-2">
                                            <span>📱</span> bKash
                                        </span>
                                        <span className="text-xs text-slate-500">Fast mobile payment</span>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 flex items-center gap-2">
                                            <span>💳</span> Card
                                        </span>
                                        <span className="text-xs text-slate-500">Visa, Mastercard</span>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="nagad"
                                        checked={formData.paymentMethod === 'nagad'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 flex items-center gap-2">
                                            <span>📱</span> Nagad
                                        </span>
                                        <span className="text-xs text-slate-500">Local mobile wallet</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Placing Order...' : `Place Order (${formatPrice(total)})`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
