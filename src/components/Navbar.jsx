import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/orders', label: 'Orders' },
];

export const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Show loading state if auth is still initializing
  if (loading) {
    return (
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-lg font-semibold text-brand-700">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">🍽️</span>
            Foodie
          </div>
          <div className="text-sm text-slate-500">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg">F</span>
          Foodie
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {/* Public Links */}
          {(!user || user.role === 'user') && (
            <Link
              to="/restaurants"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
            >
              Browse Restaurants
            </Link>
          )}

          {isAuthenticated ? (
            <>
              {user?.role === 'restaurant' ? (
                <>
                  <Link
                    to="/restaurant/dashboard"
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/restaurant/foods"
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
                  >
                    Manage Menu
                  </Link>
                </>
              ) : (
                <>
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/user/dashboard"
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </>
          ) : null}
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-medium text-slate-700 hover:text-brand-600"
              >
                {user?.name || user?.email}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

