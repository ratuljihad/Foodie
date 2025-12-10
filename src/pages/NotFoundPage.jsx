import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <p className="text-6xl">🍕</p>
    <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
    <p className="text-slate-600">The page you are looking for does not exist.</p>
    <Link
      to="/"
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      Back to restaurants
    </Link>
  </div>
);

