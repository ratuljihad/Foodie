import { Navbar } from './Navbar';

export const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</main>
  </div>
);

