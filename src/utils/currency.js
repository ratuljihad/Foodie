export const formatPrice = (amountInUSD) => {
    if (typeof amountInUSD !== 'number') {
        return amountInUSD;
    }

    // Conversion rate: 1 USD = 120 BDT
    const exchangeRate = 120;
    const amountInBDT = amountInUSD * exchangeRate;

    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amountInBDT);
};
