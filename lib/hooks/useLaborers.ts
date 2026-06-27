'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storageAdapter } from '@/lib/storage';
import { Laborer, LaborType } from '@/types';
import { toISODate } from '@/lib/utils/dates';

export function useLaborers() {
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageAdapter.getLaborers().then((data) => {
      setLaborers(data);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (updated: Laborer[]) => {
    setLaborers(updated);
    await storageAdapter.saveLaborers(updated);
  }, []);

  const addLaborer = useCallback(
    async (input: Omit<Laborer, 'id' | 'createdAt'>) => {
      const newLaborer: Laborer = {
        ...input,
        id: uuidv4(),
        createdAt: toISODate(new Date()),
      };
      await persist([...laborers, newLaborer]);
      return newLaborer;
    },
    [laborers, persist]
  );

  const updateLaborer = useCallback(
    async (id: string, updates: Partial<Omit<Laborer, 'id' | 'createdAt'>>) => {
      await persist(laborers.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    },
    [laborers, persist]
  );

  const deleteLaborer = useCallback(
    async (id: string) => {
      await persist(laborers.filter((l) => l.id !== id));
    },
    [laborers, persist]
  );

  return { laborers, loading, addLaborer, updateLaborer, deleteLaborer };
}
