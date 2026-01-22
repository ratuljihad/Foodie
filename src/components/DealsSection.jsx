import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../utils/currency';

export const DealsSection = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/discounts/active`);
                setDiscounts(response.data);
            } catch (error) {
                console.error('Failed to fetch active discounts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscounts();
    }, []);

    if (loading || discounts.length === 0) return null;

    return (
        <section id="deals" className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Featured Deals</h2>
                    <p className="mt-2 text-slate-600 font-medium">Exclusive offers from our partner restaurants</p>
                </div>
                <Link
                    to="/restaurants"
                    className="group flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                    View all restaurants
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {discounts.slice(0, 6).map((discount) => (
                    <Link
                        key={discount._id}
                        to={`/restaurant/${discount.restaurantId?._id}`}
                        className="hover-card-premium group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-orange-50/30"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            {discount.restaurantId?.image && (
                                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${discount.restaurantId.image}`}
                                        alt={discount.restaurantId.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                    {discount.restaurantId?.name}
                                </h3>
                                <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-orange-700">
                                    {discount.code}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="text-4xl font-black text-slate-900">
                                {discount.type === 'percentage' ? `${discount.value}%` : `৳${discount.value}`}
                                <span className="ml-1 text-lg font-bold text-orange-500 uppercase tracking-tighter">OFF</span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-slate-600 leading-relaxed line-clamp-2">
                                {discount.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {discount.minOrder > 0 ? `Min: ৳${discount.minOrder}` : 'No minimum'}
                                </span>
                                <span className="text-xs font-bold text-orange-600">Order Now →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
