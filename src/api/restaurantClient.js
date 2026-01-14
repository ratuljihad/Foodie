import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

export const restaurantApi = {
  // Get restaurant profile
  getProfile: async () => {
    const response = await apiClient.get('/restaurants/profile');
    return response.restaurant || response;
  },

  // Update restaurant profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/restaurants/profile', profileData);
    return response.restaurant || response;
  },

  // Get restaurant's menu items
  getMenuItems: async () => {
    const response = await apiClient.get('/restaurants/menu');
    return response.items || response;
  },

  // Create menu item with optional image file
  createMenuItem: async (itemData, imageFile = null) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(itemData).forEach((key) => {
      if (key !== 'image' && key !== 'imageFile') {
        formData.append(key, itemData[key]);
      }
    });

    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (itemData.image) {
      // If image is a URL, add it as text
      formData.append('image', itemData.image);
    }

    // Create a custom axios request for FormData (without default JSON headers)
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_BASE_URL}/restaurants/menu`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        // Don't set Content-Type - let axios set it with boundary
      },
    });
    return response.data;
  },

  // Update menu item with optional image file
  updateMenuItem: async (itemId, itemData, imageFile = null) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(itemData).forEach((key) => {
      if (key !== 'image' && key !== 'imageFile') {
        formData.append(key, itemData[key]);
      }
    });

    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (itemData.image !== undefined) {
      // If image is a URL or empty, add it as text
      formData.append('image', itemData.image || '');
    }

    // Create a custom axios request for FormData (without default JSON headers)
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_BASE_URL}/restaurants/menu/${itemId}`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        // Don't set Content-Type - let axios set it with boundary
      },
    });
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (itemId) => {
    const response = await apiClient.delete(`/restaurants/menu/${itemId}`);
    return response;
  },

  // Get restaurant's orders
  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response;
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.put(`/restaurant/orders/${orderId}/status`, { status });
    return response;
  },

  // Get restaurant dashboard data
  getDashboard: async () => {
    return apiClient.get('/restaurant/dashboard');
  },

  // Get restaurant coins
  getCoins: async () => {
    return apiClient.get('/restaurant/coins');
  },

  // Get discounts
  getDiscounts: async () => {
    return apiClient.get('/restaurant/discounts');
  },

  // Create discount
  createDiscount: async (discountData) => {
    return apiClient.post('/restaurant/discounts', discountData);
  },
};
