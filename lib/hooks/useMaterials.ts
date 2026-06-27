'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storageAdapter } from '@/lib/storage';
import { MaterialDelivery, MaterialCategory } from '@/types';
import { toISODate } from '@/lib/utils/dates';

export function useMaterials() {
  const [deliveries, setDeliveries] = useState<MaterialDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageAdapter.getDeliveries().then((data) => {
      setDeliveries(data);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (updated: MaterialDelivery[]) => {
    setDeliveries(updated);
    await storageAdapter.saveDeliveries(updated);
  }, []);

  const getDeliveriesByCategory = useCallback(
    (category: MaterialCategory) =>
      deliveries
        .filter((d) => d.category === category)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [deliveries]
  );

  const getCategorySummary = useCallback(
    (category: MaterialCategory) => {
      const cats = deliveries.filter((d) => d.category === category);
      return {
        totalOrdered: cats.reduce((s, d) => s + d.totalCost, 0),
        totalPaid: cats.reduce((s, d) => s + d.amountPaid, 0),
        totalOutstanding: cats.reduce((s, d) => s + d.balance, 0),
        deliveryCount: cats.length,
      };
    },
    [deliveries]
  );

  const addDelivery = useCallback(
    async (
      input: Omit<MaterialDelivery, 'id' | 'totalCost' | 'balance'>
    ) => {
      const totalCost = input.quantity * input.pricePerUnit;
      const balance = totalCost - input.amountPaid;

      const newDelivery: MaterialDelivery = {
        ...input,
        id: uuidv4(),
        totalCost,
        balance,
      };
      await persist([...deliveries, newDelivery]);
      return newDelivery;
    },
    [deliveries, persist]
  );

  const updateDelivery = useCallback(
    async (id: string, updates: Partial<Omit<MaterialDelivery, 'id' | 'totalCost' | 'balance'>>) => {
      await persist(
        deliveries.map((d) => {
          if (d.id !== id) return d;
          const updated = { ...d, ...updates };
          const totalCost = updated.quantity * updated.pricePerUnit;
          const balance = totalCost - updated.amountPaid;
          return { ...updated, totalCost, balance };
        })
      );
    },
    [deliveries, persist]
  );

  const deleteDelivery = useCallback(
    async (id: string) => {
      await persist(deliveries.filter((d) => d.id !== id));
    },
    [deliveries, persist]
  );

  return {
    deliveries,
    loading,
    getDeliveriesByCategory,
    getCategorySummary,
    addDelivery,
    updateDelivery,
    deleteDelivery,
  };
}
