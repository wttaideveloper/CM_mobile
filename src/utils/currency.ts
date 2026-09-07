/** Normalize API currency codes (INR, USD, EUR, …). */
export function normalizeCurrencyCode(currency?: string | null): string {
  const code = currency?.trim().toUpperCase();
  return code || 'USD';
}

/**
 * Format an amount with the correct currency symbol from the API code.
 * Uses Intl when the code is valid; falls back to CODE + amount otherwise.
 */
export function formatMoney(amount: number, currency?: string | null): string {
  const code = normalizeCurrencyCode(currency);
  const value = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
}
