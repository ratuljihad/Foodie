import { http, HttpResponse } from 'msw';
import { restaurants, menuItems, user, orders } from '../data/mockData';

export const handlers = [
  http.get('/api/restaurants', () => HttpResponse.json(restaurants)),

  http.get('/api/restaurants/:id', ({ params }) => {
    const restaurant = restaurants.find((r) => r.id === params.id);
    return restaurant ? HttpResponse.json(restaurant) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.get('/api/restaurants/:id/menu', ({ params }) => {
    const data = menuItems.filter((m) => m.restaurantId === params.id);
    return HttpResponse.json(data);
  }),

  http.get('/api/user', () => HttpResponse.json(user)),

  http.get('/api/orders', () => HttpResponse.json(orders)),

  http.post('/api/orders', async ({ request }) => {
    const body = await request.json();
    const created = {
      id: `o-${Date.now()}`,
      restaurantId: body.restaurantId ?? 'unknown',
      restaurantName: body.restaurantName ?? 'Unknown',
      total: body.total ?? 0,
      createdAt: new Date().toISOString(),
      items: body.items ?? [],
      coinDelta: body.coinDelta ?? 0,
    };

    if (created.restaurantId && typeof created.coinDelta === 'number') {
      const balance = user.coinBalances.find((c) => c.restaurantId === created.restaurantId);
      if (balance) {
        balance.coins = Math.max(0, balance.coins + created.coinDelta);
      } else {
        user.coinBalances.push({ restaurantId: created.restaurantId, coins: Math.max(0, created.coinDelta) });
      }
    }

    orders.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),
];

