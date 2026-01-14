export const restaurants = [
  {
    id: 'r1',
    name: 'Saffron Garden',
    thumbnail: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    cuisine: 'Indian',
    eta: '25-35 min',
    coinRate: 8,
    coinThreshold: 120,
    description: 'Modern Indian kitchen focused on seasonal spices.',
    highlights: ['Tandoor specials', 'Family style', 'Spicy options'],
  },
  {
    id: 'r2',
    name: 'Umami Street',
    thumbnail: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    cuisine: 'Asian',
    eta: '20-30 min',
    coinRate: 6,
    coinThreshold: 100,
    description: 'Pan-Asian street food with bold flavors.',
    highlights: ['Bao & dumplings', 'Rice bowls', 'Bubble tea'],
  },
  {
    id: 'r3',
    name: 'Coastal Italian',
    thumbnail: 'https://images.unsplash.com/photo-1544145945-f90425340c7d?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    cuisine: 'Italian',
    eta: '30-40 min',
    coinRate: 7,
    coinThreshold: 110,
    description: 'Seasonal Italian with handmade pasta and wood-fired pizza.',
    highlights: ['Neapolitan pizza', 'Fresh pasta', 'Natural wine'],
  },
];

export const menuItems = [
  {
    id: 'm1',
    restaurantId: 'r1',
    name: 'Butter Chicken',
    price: 17,
    description: 'Slow cooked tomato gravy, fenugreek, cream.',
    image: 'https://images.unsplash.com/photo-1604908177520-4024e89c1d8d?auto=format&fit=crop&w=800&q=80',
    category: 'Classics',
    isSignature: true,
  },
  {
    id: 'm2',
    restaurantId: 'r1',
    name: 'Paneer Tikka',
    price: 14,
    description: 'Charred cottage cheese, peppers, mint chutney.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    category: 'Starters',
  },
  {
    id: 'm3',
    restaurantId: 'r1',
    name: 'Garlic Naan',
    price: 4,
    description: 'Tandoor baked with garlic butter.',
    image: 'https://images.unsplash.com/photo-1603899122434-cc9c7b7a2f2c?auto=format&fit=crop&w=800&q=80',
    category: 'Sides',
  },
  {
    id: 'm4',
    restaurantId: 'r2',
    name: 'Chicken Bao',
    price: 11,
    description: 'Steamed bun, crispy chicken, gochujang mayo.',
    image: 'https://images.unsplash.com/photo-1604908177071-95a8f2f98fc0?auto=format&fit=crop&w=800&q=80',
    category: 'Bao',
    isSignature: true,
  },
  {
    id: 'm5',
    restaurantId: 'r2',
    name: 'Dan Dan Noodles',
    price: 13,
    description: 'Szechuan peppercorn, pork mince, bok choy.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    category: 'Noodles',
  },
  {
    id: 'm6',
    restaurantId: 'r2',
    name: 'Veg Dumplings',
    price: 10,
    description: 'Mushroom, cabbage, soy chilli crisp.',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
    category: 'Dumplings',
  },
  {
    id: 'm7',
    restaurantId: 'r3',
    name: 'Margherita Pizza',
    price: 15,
    description: 'San Marzano tomato, basil, fior di latte.',
    image: 'https://images.unsplash.com/photo-1548365328-9d8f2b074de2?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    isSignature: true,
  },
  {
    id: 'm8',
    restaurantId: 'r3',
    name: 'Truffle Tagliatelle',
    price: 19,
    description: 'Hand-cut pasta, parmesan, black truffle butter.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    category: 'Pasta',
  },
  {
    id: 'm9',
    restaurantId: 'r3',
    name: 'Tiramisu',
    price: 8,
    description: 'Espresso-soaked ladyfingers, mascarpone.',
    image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    category: 'Dessert',
  },
];

export let user = {
  id: 'u1',
  name: 'Alex Rivera',
  tier: 'Gold',
  coinBalances: [
    { restaurantId: 'r1', coins: 80 },
    { restaurantId: 'r2', coins: 40 },
    { restaurantId: 'r3', coins: 95 },
  ],
};

export let orders = [
  {
    id: 'o1',
    restaurantId: 'r3',
    restaurantName: 'Coastal Italian',
    total: 46,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    items: [
      { menuItemId: 'm7', name: 'Margherita Pizza', price: 15, quantity: 2, restaurantId: 'r3' },
      { menuItemId: 'm9', name: 'Tiramisu', price: 8, quantity: 1, restaurantId: 'r3' },
    ],
    coinDelta: 320,
  },
];

// Mock restaurant users
export const restaurantUsers = [
  {
    id: 'rest1',
    name: 'Saffron Garden Owner',
    email: 'restaurant@saffron.com',
    role: 'restaurant',
    restaurantId: 'r1',
    restaurantName: 'Saffron Garden',
    restaurantCoins: 15, // Restaurant earns coins from orders
  },
  {
    id: 'rest2',
    name: 'Umami Street Owner',
    email: 'restaurant@umami.com',
    role: 'restaurant',
    restaurantId: 'r2',
    restaurantName: 'Umami Street',
    restaurantCoins: 8,
  },
  {
    id: 'rest3',
    name: 'Coastal Italian Owner',
    email: 'restaurant@coastal.com',
    role: 'restaurant',
    restaurantId: 'r3',
    restaurantName: 'Coastal Italian',
    restaurantCoins: 12,
  },
];

// Mock discounts
export const discounts = [
  {
    id: 'disc1',
    restaurantId: 'r1',
    type: 'percentage',
    value: 15,
    code: 'SAFFRON15',
    description: '15% off on all orders',
    validFrom: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    isActive: true,
  },
  {
    id: 'disc2',
    restaurantId: 'r2',
    type: 'flat',
    value: 5,
    code: 'UMAMI5',
    description: '$5 off on orders over $20',
    minOrder: 20,
    validFrom: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    isActive: true,
  },
];

export const resetMockData = () => {
  user = {
    id: 'u1',
    name: 'Alex Rivera',
    tier: 'Gold',
    coinBalances: [
      { restaurantId: 'r1', coins: 80 },
      { restaurantId: 'r2', coins: 40 },
      { restaurantId: 'r3', coins: 95 },
    ],
  };

  orders = [
    {
      id: 'o1',
      restaurantId: 'r3',
      restaurantName: 'Coastal Italian',
      total: 46,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      items: [
        { menuItemId: 'm7', name: 'Margherita Pizza', price: 15, quantity: 2, restaurantId: 'r3' },
        { menuItemId: 'm9', name: 'Tiramisu', price: 8, quantity: 1, restaurantId: 'r3' },
      ],
      coinDelta: 320,
    },
  ];
};

