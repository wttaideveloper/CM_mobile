import {
  CURRENCY_NAMES,
  DEFAULT_CURRENCY_CODE,
  getCurrencyName,
  isSupportedCurrencyCode,
} from '@/constants/currencies';

export {
  CURRENCY_NAMES,
  DEFAULT_CURRENCY_CODE,
  getCurrencyName,
  isSupportedCurrencyCode,
  SUPPORTED_CURRENCY_CODES,
} from '@/constants/currencies';

/** Normalize API currency codes (INR, USD, ILS, …). Defaults to INR. */
export function normalizeCurrencyCode(currency?: string | null): string {
  const code = currency?.trim().toUpperCase();
  if (!code) return DEFAULT_CURRENCY_CODE;
  // Accept any 3-letter ISO-ish code from API; catalog is for names / validation.
  if (/^[A-Z]{3}$/.test(code)) return code;
  return DEFAULT_CURRENCY_CODE;
}

/**
 * Format an amount with the currency from the API code.
 * Uses Intl when the runtime knows the code; otherwise "CODE amount".
 * Example: ILS → ₪1,999 · INR → ₹1,999 · TZS → TZS 1,999
 */
export function formatMoney(amount: number, currency?: string | null): string {
  const code = normalizeCurrencyCode(currency);
  const value = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol',
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

/** Human label e.g. "ILS — Israeli New Shekel" when known. */
export function formatCurrencyCodeLabel(currency?: string | null): string {
  const code = normalizeCurrencyCode(currency);
  const name = getCurrencyName(code);
  return name ? `${code} — ${name}` : code;
}
