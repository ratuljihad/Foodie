const links = [
  { href: '#offers', label: 'Offers' },
  { href: '#restaurants', label: 'Restaurants' },
  { href: '#coins', label: 'Coins' },
];

export const Navbar = () => (
  <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-lg font-semibold text-brand-700">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">🍽️</span>
        Foodie
      </div>
      <nav className="hidden items-center gap-2 md:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <a
        href="#offers"
        className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        See deals
      </a>
    </div>
  </header>
);

