'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storageAdapter } from '@/lib/storage';
import { WeeklyEntry, PaymentTransaction, Laborer } from '@/types';
import { calculateBalance, calculateGross, determineStatus } from '@/lib/utils/calculations';
import { getWeekLabel, getWeekStart, getWeekEnd, toISODate } from '@/lib/utils/dates';

export function useWeeklyEntries() {
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      storageAdapter.getWeeklyEntries(),
      storageAdapter.getTransactions(),
    ]).then(([e, t]) => {
      setEntries(e);
      setTransactions(t);
      setLoading(false);
    });
  }, []);

  const persistEntries = useCallback(async (updated: WeeklyEntry[]) => {
    setEntries(updated);
    await storageAdapter.saveWeeklyEntries(updated);
  }, []);

  const persistTransactions = useCallback(async (updated: PaymentTransaction[]) => {
    setTransactions(updated);
    await storageAdapter.saveTransactions(updated);
  }, []);

  /** Returns weekly entries for a specific laborer, sorted newest first. */
  const getEntriesForLaborer = useCallback(
    (laborerId: string) =>
      entries
        .filter((e) => e.laborerId === laborerId)
        .sort(
          (a, b) =>
            new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
        ),
    [entries]
  );

  /** Returns payment transactions for a specific laborer, newest first. */
  const getTransactionsForLaborer = useCallback(
    (laborerId: string) =>
      transactions
        .filter((t) => t.laborerId === laborerId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  /** Creates a new weekly entry for a laborer. */
  const createWeeklyEntry = useCallback(
    async (
      laborer: Laborer,
      daysWorked: number,
      notes: string = '',
      weekDate: Date = new Date()
    ) => {
      const weekStart = getWeekStart(weekDate);
      const weekEnd = getWeekEnd(weekDate);
      const weekStartDate = toISODate(weekStart);
      const weekEndDate = toISODate(weekEnd);

      // Find rolled-over balance from the most recent previous entry
      const previousEntries = getEntriesForLaborer(laborer.id);
      const rolledOverBalance =
        previousEntries.length > 0 ? Math.max(0, previousEntries[0].balance) : 0;

      const grossAmount = calculateGross(laborer, daysWorked);

      const newEntry: WeeklyEntry = {
        id: uuidv4(),
        laborerId: laborer.id,
        weekLabel: getWeekLabel(weekStart),
        weekStartDate,
        weekEndDate,
        daysWorked,
        grossAmount,
        advancePaid: 0,
        amountPaid: 0,
        rolledOverBalance,
        balance: rolledOverBalance + grossAmount,
        status: 'unpaid',
        notes,
      };

      await persistEntries([...entries, newEntry]);
      return newEntry;
    },
    [entries, getEntriesForLaborer, persistEntries]
  );

  /** Logs a payment or advance against a weekly entry. */
  const logPayment = useCallback(
    async (
      entry: WeeklyEntry,
      laborer: Laborer,
      amount: number,
      type: 'payment' | 'advance',
      date: string,
      notes: string = ''
    ) => {
      // Create transaction record
      const transaction: PaymentTransaction = {
        id: uuidv4(),
        laborerId: laborer.id,
        weeklyEntryId: entry.id,
        date,
        amount,
        type,
        notes,
      };

      // Update the entry
      const updatedEntry: WeeklyEntry = {
        ...entry,
        amountPaid: type === 'payment' ? entry.amountPaid + amount : entry.amountPaid,
        advancePaid: type === 'advance' ? entry.advancePaid + amount : entry.advancePaid,
      };

      const newBalance = calculateBalance(updatedEntry);
      const newStatus = determineStatus(
        updatedEntry.grossAmount,
        updatedEntry.rolledOverBalance,
        updatedEntry.advancePaid,
        updatedEntry.amountPaid
      );

      const finalEntry: WeeklyEntry = {
        ...updatedEntry,
        balance: newBalance,
        status: newStatus,
      };

      await Promise.all([
        persistEntries(entries.map((e) => (e.id === entry.id ? finalEntry : e))),
        persistTransactions([...transactions, transaction]),
      ]);

      return { entry: finalEntry, transaction };
    },
    [entries, transactions, persistEntries, persistTransactions]
  );

  /** Updates days worked and recalculates gross / balance for an entry. */
  const updateEntry = useCallback(
    async (entryId: string, updates: Partial<Pick<WeeklyEntry, 'daysWorked' | 'grossAmount' | 'notes'>>) => {
      await persistEntries(
        entries.map((e) => {
          if (e.id !== entryId) return e;
          const updated = { ...e, ...updates };
          const balance = calculateBalance(updated);
          const status = determineStatus(
            updated.grossAmount,
            updated.rolledOverBalance,
            updated.advancePaid,
            updated.amountPaid
          );
          return { ...updated, balance, status };
        })
      );
    },
    [entries, persistEntries]
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      await persistEntries(entries.filter((e) => e.id !== entryId));
    },
    [entries, persistEntries]
  );

  return {
    entries,
    transactions,
    loading,
    getEntriesForLaborer,
    getTransactionsForLaborer,
    createWeeklyEntry,
    logPayment,
    updateEntry,
    deleteEntry,
  };
}
