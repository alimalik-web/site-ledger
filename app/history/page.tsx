'use client';

import { useState, useMemo } from 'react';
import { useLaborers } from '@/lib/hooks/useLaborers';
import { useWeeklyEntries } from '@/lib/hooks/useWeeklyEntries';
import { useMaterials } from '@/lib/hooks/useMaterials';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAmount } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { Search, Banknote, TrendingDown, Package, History } from 'lucide-react';

export default function HistoryPage() {
  const { laborers } = useLaborers();
  const { transactions, loading: tLoading } = useWeeklyEntries();
  const { deliveries, loading: mLoading } = useMaterials();
  const [search, setSearch] = useState('');

  const getLaborerName = (id: string) =>
    laborers.find((l) => l.id === id)?.name ?? 'Unknown';

  // Merge labor transactions + material deliveries into a unified timeline
  const allEvents = useMemo(() => {
    const labor = transactions.map((t) => ({
      id: t.id,
      date: t.date,
      type: t.type as 'payment' | 'advance',
      source: 'labor' as const,
      label: getLaborerName(t.laborerId),
      amount: t.amount,
      notes: t.notes,
    }));

    const materials = deliveries.map((d) => ({
      id: d.id,
      date: d.date,
      type: 'delivery' as const,
      source: 'material' as const,
      label: `${d.category.charAt(0).toUpperCase() + d.category.slice(1)} — ${d.supplier}`,
      amount: d.totalCost,
      notes: d.notes,
    }));

    return [...labor, ...materials].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, deliveries, laborers]);

  const filtered = allEvents.filter(
    (e) =>
      e.label.toLowerCase().includes(search.toLowerCase()) ||
      e.notes.toLowerCase().includes(search.toLowerCase())
  );

  const loading = tLoading || mLoading;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Full History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete chronological log of all payments and material deliveries
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, supplier, notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <History className="w-14 h-14 mb-4 opacity-30" />
          <p className="text-base font-medium">No history yet</p>
          <p className="text-sm mt-1">Payments and deliveries will appear here.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-3">
            {filtered.map((event) => {
              const isPayment = event.type === 'payment';
              const isAdvance = event.type === 'advance';
              const isDelivery = event.type === 'delivery';

              return (
                <div key={event.id} className="relative flex items-start gap-4 pl-12">
                  {/* Dot */}
                  <div
                    className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-background ${
                      isPayment
                        ? 'bg-emerald-500'
                        : isAdvance
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                    }`}
                  />

                  <div className="flex-1 bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isPayment
                              ? 'bg-emerald-100 dark:bg-emerald-900/30'
                              : isAdvance
                              ? 'bg-amber-100 dark:bg-amber-900/30'
                              : 'bg-purple-100 dark:bg-purple-900/30'
                          }`}
                        >
                          {isPayment && (
                            <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {isAdvance && (
                            <TrendingDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          )}
                          {isDelivery && (
                            <Package className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {event.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDisplayDate(event.date)}
                          </p>
                          {event.notes && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{formatAmount(event.amount)}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] mt-0.5 ${
                            isPayment
                              ? 'border-emerald-300 text-emerald-600 dark:text-emerald-400'
                              : isAdvance
                              ? 'border-amber-300 text-amber-600 dark:text-amber-400'
                              : 'border-purple-300 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {isPayment ? 'Payment' : isAdvance ? 'Advance' : 'Delivery'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
