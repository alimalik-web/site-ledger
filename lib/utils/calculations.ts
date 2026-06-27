import type { Laborer, WeeklyEntry, PaymentStatus } from '@/types';

/**
 * Calculates the gross amount for a laborer for a given week.
 */
export function calculateGross(laborer: Laborer, daysWorked: number): number {
  if (laborer.type === 'contract') {
    return laborer.contractAmount ?? 0;
  }
  return daysWorked * (laborer.dailyRate ?? 0);
}

/**
 * Calculates the net balance for a weekly entry:
 * balance = rolledOverBalance + grossAmount − advancePaid − amountPaid
 */
export function calculateBalance(entry: Omit<WeeklyEntry, 'balance' | 'status'>): number {
  return (
    entry.rolledOverBalance +
    entry.grossAmount -
    entry.advancePaid -
    entry.amountPaid
  );
}

/**
 * Determines the payment status for a weekly entry.
 */
export function determineStatus(
  grossAmount: number,
  rolledOverBalance: number,
  advancePaid: number,
  amountPaid: number
): PaymentStatus {
  const totalOwed = rolledOverBalance + grossAmount - advancePaid;
  if (amountPaid <= 0) return 'unpaid';
  if (amountPaid >= totalOwed) return 'paid';
  return 'partial';
}

/**
 * Returns the total gross wages across all weekly entries for a laborer.
 */
export function totalGrossForLaborer(entries: WeeklyEntry[]): number {
  return entries.reduce((sum, e) => sum + e.grossAmount, 0);
}

/**
 * Returns the total amount paid across all weekly entries for a laborer.
 */
export function totalPaidForLaborer(entries: WeeklyEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amountPaid + e.advancePaid, 0);
}

/**
 * Returns the current outstanding balance for a laborer (last week's balance).
 */
export function currentBalanceForLaborer(entries: WeeklyEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort(
    (a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
  );
  return sorted[0].balance;
}
