import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token (optional for public routes)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const userApi = {
  // Get all restaurants
  getRestaurants: async () => {
    return apiClient.get('/restaurants');
  },

  // Get restaurant by ID
  getRestaurant: async (id) => {
    return apiClient.get(`/restaurants/${id}`);
  },

  // Get menu items for a restaurant
  getMenuItems: async (restaurantId) => {
    return apiClient.get(`/foods/restaurant/${restaurantId}`);
  },

  // Get single food item
  getFoodItem: async (id) => {
    return apiClient.get(`/foods/${id}`);
  },

  // Search foods
  searchFoods: async (params = {}) => {
    return apiClient.get('/foods', { params });
  },

  // Create order (requires authentication)
  createOrder: async (orderData) => {
    return apiClient.post('/orders', orderData);
  },

  // Get user orders (requires authentication)
  getOrders: async () => {
    return apiClient.get('/orders');
  },

  // Get single order (requires authentication)
  getOrder: async (orderId) => {
    return apiClient.get(`/orders/${orderId}`);
  },

  // Get user coins (requires authentication)
  getCoins: async () => {
    return apiClient.get('/user/coins');
  },

  // Get user profile
  getProfile: async () => {
    return apiClient.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (data) => {
    return apiClient.put('/users/profile', data);
  },
};

