import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</main>
    <Footer />
  </div>
);

