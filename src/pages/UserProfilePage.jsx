import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userClient';
import { toast } from 'react-hot-toast';

export const UserProfilePage = () => {
    const { user, login } = useAuth(); // We might need to update user in context
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        coinBalances: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await userApi.getProfile();
            setProfile(data);
            setFormData({
                name: data.name,
                phone: data.phone || ''
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatedUser = await userApi.updateProfile(formData);
            setProfile(prev => ({ ...prev, ...updatedUser }));
            setIsEditing(false);
            toast.success('Profile updated successfully');

            // Ideally update global auth user context if name changed
            // But usually checking 'profile' local state is sufficient for this page
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold text-slate-900">My Profile</h1>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Profile Card */}
                    <div className="md:col-span-2">
                        <div className="glass-panel overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="bg-gradient-premium px-6 py-8 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                                        <p className="text-white/80">{profile.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-medium uppercase text-slate-400">Full Name</label>
                                                <p className="mt-1 text-lg font-medium text-slate-900">{profile.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium uppercase text-slate-400">Email</label>
                                                <p className="mt-1 text-lg font-medium text-slate-900">{profile.email}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium uppercase text-slate-400">Phone</label>
                                                <p className="mt-1 text-lg font-medium text-slate-900">{profile.phone || 'Not set'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium uppercase text-slate-400">Joined</label>
                                                <p className="mt-1 text-lg font-medium text-slate-900">
                                                    {new Date(profile.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Side Card: Wallet Summary */}
                    <div>
                        <div className="glass-panel overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                                <span className="text-xl">👛</span> Wallet Summary
                            </h3>
                            <div className="space-y-4">
                                {profile.coinBalances?.length > 0 ? (
                                    profile.coinBalances.map((balance, idx) => (
                                        <div key={idx} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                                            <span className="text-sm font-medium text-slate-600">Restaurant ID: {balance.restaurantId.substring(0, 6)}...</span>
                                            <span className="font-bold text-amber-500">{balance.coins} 🪙</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">No coins earned yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
