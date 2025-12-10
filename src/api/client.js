import { restaurants, menuItems, user, orders } from '../data/mockData';

const delay = (value, ms = 50) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const api = {
  getRestaurants: () => delay([...restaurants]),
  getRestaurant: (id) => delay(restaurants.find((r) => r.id === id)),
  getMenu: (id) => delay(menuItems.filter((m) => m.restaurantId === id)),
  getUser: () => delay({ ...user, coinBalances: [...user.coinBalances] }),
  getOrders: () => delay([...orders]),
  postOrder: async (order) => {
    const created = {
      id: `o-${Date.now()}`,
      restaurantId: order.restaurantId ?? 'unknown',
      restaurantName: order.restaurantName ?? 'Unknown',
      total: order.total ?? 0,
      createdAt: new Date().toISOString(),
      items: order.items ?? [],
      coinDelta: order.coinDelta ?? 0,
    };
    const balance = user.coinBalances.find((c) => c.restaurantId === created.restaurantId);
    if (balance) {
      balance.coins = Math.max(0, balance.coins + created.coinDelta);
    } else {
      user.coinBalances.push({ restaurantId: created.restaurantId, coins: Math.max(0, created.coinDelta) });
    }
    orders.unshift(created);
    return delay(created);
  },
};

