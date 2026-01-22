import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm z-10">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Management Console</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.name || 'Restaurant'}</p>
            <p className="text-xs text-slate-500">{user?.role === 'restaurant' ? 'Restaurant Owner' : ''}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

