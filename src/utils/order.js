export const calculateSubtotal = (items) =>
    items.filter((i) => !i.isRedeemed).reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
