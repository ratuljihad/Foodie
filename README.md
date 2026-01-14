

# File-by-file guide

### Project root
- `package.json` — Project name, scripts (`dev`, `build`, `preview`, `lint`), and dependencies.
- `vite.config.js` — Vite setup with the React plugin.
- `tailwind.config.js` — Tailwind scan paths and custom colors/shadows.
- `index.html` — Base HTML with `#root`, Google Fonts, and entry script `src/main.jsx`.
- `README.md` — This guide.

### Source (`src/`)
- `main.jsx` — Loads global CSS, renders `<App />` into `#root` with React StrictMode.
- `index.css` — Tailwind directives and base body styles.
- `App.jsx` — Wraps everything in `AppProvider` and `Layout`, shows `HomePage`.

#### Data & API
- `data/mockData.js` — Fake restaurants, menu items, user coins, and orders (in memory).
- `api/client.js` — Mock “API” that returns the data above with tiny delays; updates coins/orders on checkout.

#### State
- `context/AppContext.jsx` — Global state with reducer: restaurants, user, cart, orders, loading/error, checkout logic, and localStorage persistence. Exposes `useAppState` and `useAppActions`.

#### Components
- `components/Layout.jsx` — Page shell with `Navbar` and centered content.
- `components/Navbar.jsx` — Logo, quick anchor links, “See deals” button.
- `components/PageHeader.jsx` — Reusable section header (title + subtitle).
- `components/RestaurantCard.jsx` — Restaurant tile with image, rating, cuisine, ETA, coin info, and progress to reward.
- `components/MenuItemCard.jsx` — Menu item card (add/redeem buttons, price, description, coin rate).
- `components/CartItemRow.jsx` — Cart row with quantity controls and remove button.

#### Pages
- `pages/HomePage.jsx` — Hero banner, featured offers, search/filter, restaurant grid, “how coins work” block.
- `pages/RestaurantPage.jsx` — Loads one restaurant + menu, shows coin progress and grouped menu items.
- `pages/CartPage.jsx` — Cart grouped by restaurant, subtotal, coin deltas, checkout.
- `pages/OrdersPage.jsx` — Past orders with totals and coin delta.
- `pages/ProfilePage.jsx` — User info and per-restaurant coin balances.
- `pages/NotFoundPage.jsx` — Simple 404 fallback.

#### Utils
- `utils/coin.js` — Helpers for subtotal, coins earned, redeem check, coin delta, and progress.

---

Need another explanation? Tell me which file to zoom into and I’ll annotate it line by line.
