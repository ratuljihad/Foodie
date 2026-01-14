import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { userApi } from '../api/userClient';
import { calculateCoinDelta, calculateSubtotal } from '../utils/coin';

const initialState = {
  restaurants: [],
  user: null,
  cart: [],
  orders: [],
  loading: true,
  error: undefined,
};

const STORAGE_KEY = 'food-app-cart';
const USER_STORAGE_KEY = 'food-app-user';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_RESTAURANTS':
      return { ...state, restaurants: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_TO_CART': {
      const existing = state.cart.find((item) => item.id === action.payload.id);
      const updated = existing
        ? state.cart.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
          )
        : [...state.cart, action.payload];
      return { ...state, cart: updated };
    }
    case 'UPDATE_CART_QTY':
      return {
        ...state,
        cart: state.cart
          .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
          .filter((item) => item.quantity > 0),
      };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((item) => item.id !== action.payload.id) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'UPDATE_COINS': {
      if (!state.user) return state;
      const existing = state.user.coinBalances.find((c) => c.restaurantId === action.payload.restaurantId);
      const coinBalances = existing
        ? state.user.coinBalances.map((c) =>
            c.restaurantId === action.payload.restaurantId ? { ...c, coins: action.payload.coins } : c,
          )
        : [...state.user.coinBalances, { restaurantId: action.payload.restaurantId, coins: action.payload.coins }];
      return { ...state, user: { ...state.user, coinBalances } };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_CART':
      return { ...state, cart: action.payload };
    default:
      return state;
  }
};

const AppStateContext = createContext(undefined);
const AppDispatchContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    if (storedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(storedCart) });
    }
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(storedUser) });
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const restaurantsData = await userApi.getRestaurants();
        dispatch({ type: 'SET_RESTAURANTS', payload: restaurantsData });
        dispatch({ type: 'SET_ERROR', payload: undefined });
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load restaurants' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
    }
  }, [state.user]);

  const addToCart = (item) => dispatch({ type: 'ADD_TO_CART', payload: item });
  const updateQty = (id, quantity) => dispatch({ type: 'UPDATE_CART_QTY', payload: { id, quantity } });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });

  const checkout = async ({ restaurantId, restaurantName }) => {
    if (!state.user) return;
    const restaurant = state.restaurants.find((r) => (r.id || r._id) === restaurantId);
    if (!restaurant) return;

    const items = state.cart.filter((item) => item.restaurantId === restaurantId);
    if (!items.length) return;

    const subtotal = calculateSubtotal(items);
    const coinSnapshot = (state.user.coinBalances || []).reduce((acc, c) => {
      acc[c.restaurantId] = c.coins;
      return acc;
    }, {});
    const { earnings, redemptions } = calculateCoinDelta(items, state.restaurants);
    const earned = earnings[restaurantId] ?? 0;
    const spent = redemptions[restaurantId] ?? 0;
    const coinDelta = earned - spent;
    const newCoins = Math.max(0, (coinSnapshot[restaurantId] ?? 0) + coinDelta);

    try {
      const order = await userApi.createOrder({
        restaurantId,
        restaurantName,
        total: subtotal,
        items: items.map((item) => ({
          menuItemId: item.menuItem._id || item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
          quantity: item.quantity,
          restaurantId: item.restaurantId,
          isRedeemed: item.isRedeemed,
        })),
        coinDelta,
      });

      dispatch({ type: 'UPDATE_COINS', payload: { restaurantId, coins: newCoins } });
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_ORDERS', payload: [order, ...(state.orders || [])] });
      return order;
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      addToCart,
      updateQty,
      removeFromCart,
      checkout,
    }),
    [],
  );

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={value}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

export const useAppActions = () => {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error('useAppActions must be used within AppProvider');
  return ctx;
};

