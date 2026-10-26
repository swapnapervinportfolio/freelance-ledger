export const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', BDT: '৳' };

export const formatMoney = (amount, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  const value = Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${symbol}${value}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};