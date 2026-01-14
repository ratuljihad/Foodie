import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/restaurant/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/restaurant/foods', label: 'Manage Menu', icon: '🍔' },
  { path: '/restaurant/orders', label: 'Orders', icon: '📦' },
  { path: '/restaurant/discounts', label: 'Discounts', icon: '🎫' },
  { path: '/restaurant/coins', label: 'Restaurant Coins', icon: '🪙' },
  { path: '/restaurant/profile', label: 'Profile', icon: '👤' },
];

export const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white text-xl font-bold">
            F
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Foodie</h1>
            <p className="text-xs text-slate-500">Restaurant Dashboard</p>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="border-b border-slate-200 px-6 py-4">
          <p className="text-sm font-semibold text-slate-900">{user?.name || 'Restaurant'}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>🏠</span>
            <span>Back to Home</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

