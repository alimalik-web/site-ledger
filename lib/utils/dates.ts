import { format, startOfWeek, addDays } from 'date-fns';

/**
 * Returns the Monday of the week containing the given date.
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Returns the Thursday (pay day) of the week containing the given date.
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const monday = getWeekStart(date);
  return addDays(monday, 3); // Monday + 3 = Thursday
}

/**
 * Returns a human-readable week label.
 * e.g. "Jun 23 – Jun 26, 2025"
 */
export function getWeekLabel(startDate: Date): string {
  const end = addDays(startDate, 3);
  return `${format(startDate, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Returns ISO date string (YYYY-MM-DD) for a given Date.
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formats a date string for display.
 * e.g. "2025-06-26" → "Thursday, Jun 26, 2025"
 */
export function formatDisplayDate(isoDate: string): string {
  return format(new Date(isoDate), 'EEEE, MMM d, yyyy');
}

/**
 * Formats a date string as short form.
 * e.g. "2025-06-26" → "Jun 26, 2025"
 */
export function formatShortDate(isoDate: string): string {
  return format(new Date(isoDate), 'MMM d, yyyy');
}
