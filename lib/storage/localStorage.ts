import { IStorageAdapter } from './adapter';
import { Laborer, WeeklyEntry, PaymentTransaction, MaterialDelivery } from '@/types';

const KEYS = {
  laborers: 'sl_laborers',
  weeklyEntries: 'sl_weekly_entries',
  transactions: 'sl_transactions',
  deliveries: 'sl_deliveries',
} as const;

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export class LocalStorageAdapter implements IStorageAdapter {
  async getLaborers(): Promise<Laborer[]> {
    return load<Laborer>(KEYS.laborers);
  }
  async saveLaborers(laborers: Laborer[]): Promise<void> {
    save(KEYS.laborers, laborers);
  }

  async getWeeklyEntries(): Promise<WeeklyEntry[]> {
    return load<WeeklyEntry>(KEYS.weeklyEntries);
  }
  async saveWeeklyEntries(entries: WeeklyEntry[]): Promise<void> {
    save(KEYS.weeklyEntries, entries);
  }

  async getTransactions(): Promise<PaymentTransaction[]> {
    return load<PaymentTransaction>(KEYS.transactions);
  }
  async saveTransactions(transactions: PaymentTransaction[]): Promise<void> {
    save(KEYS.transactions, transactions);
  }

  async getDeliveries(): Promise<MaterialDelivery[]> {
    return load<MaterialDelivery>(KEYS.deliveries);
  }
  async saveDeliveries(deliveries: MaterialDelivery[]): Promise<void> {
    save(KEYS.deliveries, deliveries);
  }
}
