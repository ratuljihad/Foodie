const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

export const authApi = {
  // Register User
  registerUser: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return handleResponse(response);
  },

  // Register Restaurant
  registerRestaurant: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/restaurant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return handleResponse(response);
  },

  // Login
  login: async (email, password, role = 'user') => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    return handleResponse(response);
  },

  // Logout
  logout: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(response);
  },

  // Refresh Token
  refreshToken: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(response);
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.user;
  },

  // Generic register function that routes to correct endpoint
  register: async (formData, role) => {
    if (role === 'restaurant') {
      return authApi.registerRestaurant(formData);
    }
    return authApi.registerUser(formData);
  },
};

