export const calculateSubtotal = (items) =>
  items.filter((i) => !i.isRedeemed).reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

export const coinsEarnedForRestaurant = (restaurant, subtotal) => Math.floor(subtotal * restaurant.coinRate);

export const canRedeem = (currentCoins, threshold) => currentCoins >= threshold;

export const calculateCoinDelta = (items, restaurants) =>
  items.reduce(
    (acc, item) => {
      const restaurant = restaurants.find((r) => r.id === item.restaurantId);
      if (!restaurant) return acc;
      const key = restaurant.id;
      const subtotal = item.isRedeemed ? 0 : item.menuItem.price * item.quantity;
      acc.earnings[key] = (acc.earnings[key] ?? 0) + coinsEarnedForRestaurant(restaurant, subtotal);

      if (item.isRedeemed) {
        acc.redemptions[key] = (acc.redemptions[key] ?? 0) + restaurant.coinThreshold;
      }

      return acc;
    },
    { earnings: {}, redemptions: {} },
  );

export const nextRewardProgress = (coins, threshold) => {
  const remaining = Math.max(threshold - coins, 0);
  const progress = Math.min((coins / threshold) * 100, 100);
  return { remaining, progress };
};

