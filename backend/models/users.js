// In-memory storage (replace with database in production)
let users = [];
let restaurants = [];

export const userModel = {
  create: (userData) => {
    const user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      role: 'user',
      coinBalances: [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  findByEmail: (email) => {
    return users.find((u) => u.email === email);
  },

  findById: (id) => {
    return users.find((u) => u.id === id);
  },
};

export const restaurantModel = {
  create: (restaurantData) => {
    const restaurant = {
      id: `restaurant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...restaurantData,
      role: 'restaurant',
      createdAt: new Date().toISOString(),
    };
    restaurants.push(restaurant);
    return restaurant;
  },

  findByEmail: (email) => {
    return restaurants.find((r) => r.email === email);
  },

  findById: (id) => {
    return restaurants.find((r) => r.id === id);
  },

  getAll: () => {
    return restaurants;
  },
};

// Helper to get user or restaurant by ID
export const findUserOrRestaurant = (id, role) => {
  if (role === 'user') {
    return userModel.findById(id);
  } else if (role === 'restaurant') {
    return restaurantModel.findById(id);
  }
  return null;
};

