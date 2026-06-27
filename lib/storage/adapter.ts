import {
  Laborer,
  WeeklyEntry,
  PaymentTransaction,
  MaterialDelivery,
} from '@/types';

/**
 * IStorageAdapter — the contract every storage backend must implement.
 * Switching from LocalStorage to Postgres = create a new class implementing this.
 */
export interface IStorageAdapter {
  // Laborers
  getLaborers(): Promise<Laborer[]>;
  saveLaborers(laborers: Laborer[]): Promise<void>;

  // Weekly Entries
  getWeeklyEntries(): Promise<WeeklyEntry[]>;
  saveWeeklyEntries(entries: WeeklyEntry[]): Promise<void>;

  // Payment Transactions
  getTransactions(): Promise<PaymentTransaction[]>;
  saveTransactions(transactions: PaymentTransaction[]): Promise<void>;

  // Material Deliveries
  getDeliveries(): Promise<MaterialDelivery[]>;
  saveDeliveries(deliveries: MaterialDelivery[]): Promise<void>;
}
