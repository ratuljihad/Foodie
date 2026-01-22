import React, { useState } from 'react';

export const OrderCancelModal = ({ isOpen, onClose, onConfirm, orderId }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const reasons = [
        'Out of stock',
        'Restaurant closing soon',
        'Too many orders',
        'Invalid delivery address',
        'Price mismatch',
        'Other'
    ];

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setLoading(true);
        await onConfirm(orderId, reason);
        setLoading(false);
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Cancel Order</h3>
                    <p className="text-sm text-slate-500 mt-1">Please provide a reason for cancelling this order.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Select a reason</label>
                        <div className="grid grid-cols-1 gap-2">
                            {reasons.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setReason(r)}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${reason === r
                                            ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {r}
                                    {reason === r && <span className="text-lg font-bold">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {reason === 'Other' && (
                        <div className="space-y-2">
                            <textarea
                                autoFocus
                                value={reason === 'Other' ? '' : reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Type your reason here..."
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[100px]"
                                required
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            type="submit"
                            disabled={!reason.trim() || loading}
                            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-200"
                        >
                            {loading ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
