/**
 * Formats a number as PKR currency.
 * e.g. 1500000 → "₨ 15,00,000"  (Pakistani lakh notation)
 */
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a plain number with comma separators, prefixed with ₨.
 */
export function formatAmount(amount: number): string {
  return `₨ ${amount.toLocaleString('en-PK')}`;
}
