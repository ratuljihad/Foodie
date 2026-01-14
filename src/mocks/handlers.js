import { http, HttpResponse } from 'msw';
import { restaurants, menuItems, user, orders, restaurantUsers, discounts } from '../data/mockData';
import { encodeJWT, decodeJWT } from '../utils/jwt';

// Mock users database
const mockUsers = [
  {
    id: 'u1',
    email: 'user@example.com',
    password: 'password123',
    name: 'Alex Rivera',
    role: 'user',
    tier: 'Gold',
    coinBalances: [
      { restaurantId: 'r1', coins: 80 },
      { restaurantId: 'r2', coins: 40 },
      { restaurantId: 'r3', coins: 95 },
    ],
  },
  ...restaurantUsers.map((ru) => ({
    ...ru,
    password: 'password123',
  })),
];

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password, role } = await request.json();
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );

    if (!foundUser) {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      restaurantId: foundUser.restaurantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const accessToken = encodeJWT(payload);
    const refreshToken = encodeJWT({ ...payload, type: 'refresh' });

    return HttpResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        restaurantId: foundUser.restaurantId,
        restaurantName: foundUser.restaurantName,
        coinBalances: foundUser.coinBalances,
        restaurantCoins: foundUser.restaurantCoins,
      },
    });
  }),

  http.post('/api/auth/register/user', async ({ request }) => {
    const { email, password, name } = await request.json();
    const newUser = {
      id: `u${Date.now()}`,
      email,
      password,
      name,
      role: 'user',
      tier: 'Bronze',
      coinBalances: [],
    };
    mockUsers.push(newUser);

    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    };

    const accessToken = encodeJWT(payload);
    const refreshToken = encodeJWT({ ...payload, type: 'refresh' });

    return HttpResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        coinBalances: newUser.coinBalances,
      },
    }, { status: 201 });
  }),

  http.post('/api/auth/register/restaurant', async ({ request }) => {
    const { email, password, name, restaurantName } = await request.json();
    const restaurantId = `r${Date.now()}`;
    const newUser = {
      id: `rest${Date.now()}`,
      email,
      password,
      name,
      role: 'restaurant',
      restaurantId,
      restaurantName,
      restaurantCoins: 0,
    };
    mockUsers.push(newUser);

    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      restaurantId: newUser.restaurantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    };

    const accessToken = encodeJWT(payload);
    const refreshToken = encodeJWT({ ...payload, type: 'refresh' });

    return HttpResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        restaurantId: newUser.restaurantId,
        restaurantName: newUser.restaurantName,
        restaurantCoins: newUser.restaurantCoins,
      },
    }, { status: 201 });
  }),

  http.post('/api/auth/refresh', async ({ request }) => {
    const { refreshToken } = await request.json();
    // In a real app, we'd verify the refresh token
    // For mocking, we'll just return a new access token
    const payload = {
      id: 'u1',
      email: 'user@example.com',
      name: 'Alex Rivera',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    };
    return HttpResponse.json({
      accessToken: encodeJWT(payload),
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (!decoded) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const foundUser = mockUsers.find((u) => u.id === decoded.id);
    if (!foundUser) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        restaurantId: foundUser.restaurantId,
        restaurantName: foundUser.restaurantName,
        coinBalances: foundUser.coinBalances,
        restaurantCoins: foundUser.restaurantCoins,
      },
    });
  }),

  // Restaurant endpoints
  http.get('/api/restaurants', () => HttpResponse.json(restaurants)),

  http.get('/api/restaurants/:id', ({ params }) => {
    const restaurant = restaurants.find((r) => r.id === params.id);
    return restaurant ? HttpResponse.json(restaurant) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.get('/api/restaurants/:id/menu', ({ params }) => {
    const data = menuItems.filter((m) => m.restaurantId === params.id);
    return HttpResponse.json(data);
  }),

  http.get('/api/foods/restaurant/:id', ({ params }) => {
    const data = menuItems.filter((m) => m.restaurantId === params.id);
    return HttpResponse.json(data);
  }),

  http.get('/api/foods/:id', ({ params }) => {
    const item = menuItems.find((m) => m.id === params.id);
    return item ? HttpResponse.json(item) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // User endpoints
  http.get('/api/user', () => HttpResponse.json(user)),

  http.get('/api/user/coins', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    const foundUser = mockUsers.find((u) => u.id === decoded.id);
    return HttpResponse.json({ coinBalances: foundUser?.coinBalances || [] });
  }),

  // Orders endpoints
  http.get('/api/orders', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    // Filter orders based on user role
    if (decoded.role === 'restaurant') {
      const restaurantOrders = orders.filter((o) => o.restaurantId === decoded.restaurantId);
      return HttpResponse.json(restaurantOrders);
    }
    return HttpResponse.json(orders);
  }),

  http.get('/api/orders/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const order = orders.find((o) => (o.id || o._id) === params.id);
    return order ? HttpResponse.json(order) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.post('/api/orders', async ({ request }) => {
    const body = await request.json();
    const created = {
      id: `o-${Date.now()}`,
      restaurantId: body.restaurantId ?? 'unknown',
      restaurantName: body.restaurantName ?? 'Unknown',
      total: body.total ?? 0,
      status: 'pending',
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

    // Award restaurant coins (1 coin per completed order)
    // Note: In real app, this would happen when order status changes to 'delivered'
    // For now, we'll award coins immediately
    const restaurantUser = mockUsers.find((u) => u.restaurantId === created.restaurantId);
    if (restaurantUser) {
      restaurantUser.restaurantCoins = (restaurantUser.restaurantCoins || 0) + 1;
    }

    orders.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  // Restaurant dashboard endpoints
  http.get('/api/restaurant/dashboard', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const restaurantOrders = orders.filter((o) => o.restaurantId === decoded.restaurantId);
    const totalRevenue = restaurantOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const foundUser = mockUsers.find((u) => u.id === decoded.id);

    return HttpResponse.json({
      totalOrders: restaurantOrders.length,
      revenue: totalRevenue,
      restaurantCoins: foundUser?.restaurantCoins || 0,
      activeDiscounts: discounts.filter((d) => d.restaurantId === decoded.restaurantId && d.isActive).length,
      recentOrders: restaurantOrders.slice(0, 5),
    });
  }),

  http.get('/api/restaurant/coins', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const foundUser = mockUsers.find((u) => u.id === decoded.id);
    return HttpResponse.json({ restaurantCoins: foundUser?.restaurantCoins || 0 });
  }),

  // Discount endpoints
  http.get('/api/restaurant/discounts', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const restaurantDiscounts = discounts.filter((d) => d.restaurantId === decoded.restaurantId);
    return HttpResponse.json(restaurantDiscounts);
  }),

  http.post('/api/restaurant/discounts', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const newDiscount = {
      id: `disc${Date.now()}`,
      restaurantId: decoded.restaurantId,
      ...body,
      createdAt: new Date().toISOString(),
    };
    discounts.push(newDiscount);
    return HttpResponse.json(newDiscount, { status: 201 });
  }),

  http.put('/api/restaurant/orders/:id/status', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await request.json();
    const order = orders.find((o) => (o.id || o._id) === params.id);
    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    return HttpResponse.json(order);
  }),

  // Restaurant menu endpoints
  http.get('/api/restaurants/menu', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const restaurantMenu = menuItems.filter((m) => m.restaurantId === decoded.restaurantId);
    return HttpResponse.json(restaurantMenu);
  }),

  http.post('/api/restaurants/menu', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const newItem = {
      id: `m${Date.now()}`,
      restaurantId: decoded.restaurantId,
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      description: formData.get('description'),
      category: formData.get('category'),
      image: formData.get('image') || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isSignature: formData.get('isSignature') === 'true',
    };
    menuItems.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.put('/api/restaurants/menu/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const item = menuItems.find((m) => (m.id || m._id) === params.id);
    if (!item || item.restaurantId !== decoded.restaurantId) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    item.name = formData.get('name') || item.name;
    item.price = formData.get('price') ? parseFloat(formData.get('price')) : item.price;
    item.description = formData.get('description') || item.description;
    item.category = formData.get('category') || item.category;
    item.image = formData.get('image') || item.image;
    item.isSignature = formData.get('isSignature') === 'true';

    return HttpResponse.json(item);
  }),

  http.delete('/api/restaurants/menu/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const index = menuItems.findIndex((m) => (m.id || m._id) === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = menuItems[index];
    if (item.restaurantId !== decoded.restaurantId) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    menuItems.splice(index, 1);
    return HttpResponse.json({ message: 'Item deleted' });
  }),

  // Restaurant profile endpoints
  http.get('/api/restaurants/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const restaurant = restaurants.find((r) => r.id === decoded.restaurantId);
    return HttpResponse.json(restaurant || {});
  }),

  http.put('/api/restaurants/profile', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (decoded.role !== 'restaurant') {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const restaurant = restaurants.find((r) => r.id === decoded.restaurantId);
    if (restaurant) {
      Object.assign(restaurant, body);
      return HttpResponse.json(restaurant);
    }
    return HttpResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }),
];

