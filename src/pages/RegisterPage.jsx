import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    // Restaurant-specific fields
    address: '',
    cuisine: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Prepare data based on role
      const submitData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
      };

      if (role === 'restaurant') {
        submitData.address = formData.address || undefined;
        submitData.cuisine = formData.cuisine || undefined;
      }

      await register(submitData, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-2 text-slate-600">Sign up to get started</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I am a
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="user"
                    checked={role === 'user'}
                    onChange={(e) => setRole(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700">User</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="restaurant"
                    checked={role === 'restaurant'}
                    onChange={(e) => setRole(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700">Restaurant</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                {role === 'restaurant' ? 'Restaurant Name' : 'Full Name'}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={role === 'restaurant' ? 'Restaurant Name' : 'Ratul Jihad'}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Phone (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="019xxxxxxxx"
              />
            </div>

            {role === 'restaurant' && (
              <>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                    Address (Optional)
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Uttara,Dhaka-1230"
                  />
                </div>

                <div>
                  <label htmlFor="cuisine" className="block text-sm font-medium text-slate-700 mb-2">
                    Cuisine Type (Optional)
                  </label>
                  <input
                    id="cuisine"
                    name="cuisine"
                    type="text"
                    value={formData.cuisine}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Desi food, Chinese,Italian, Mexican, etc."
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

