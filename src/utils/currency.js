export const formatPrice = (amount, currency = 'BDT') => {
    if (typeof amount !== 'number') {
        return amount;
    }

    // After migration, prices are stored in BDT
    // We use 'en-BD' locale for BDT to get the ৳ symbol and correct decimal formatting
    return new Intl.NumberFormat(currency === 'BDT' ? 'en-BD' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
