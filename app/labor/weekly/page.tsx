'use client';

import { useMemo, useState } from 'react';
import { useLaborers } from '@/lib/hooks/useLaborers';
import { useWeeklyEntries } from '@/lib/hooks/useWeeklyEntries';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { formatAmount } from '@/lib/utils/currency';
import { Search, FileText } from 'lucide-react';

const statusConfig = {
  paid: { label: 'Paid', className: 'badge-paid' },
  partial: { label: 'Partial', className: 'badge-partial' },
  unpaid: { label: 'Unpaid', className: 'badge-unpaid' },
};

export default function WeeklyReportPage() {
  const { laborers, loading: lLoading } = useLaborers();
  const { entries, loading: eLoading } = useWeeklyEntries();
  const [search, setSearch] = useState('');

  const loading = lLoading || eLoading;

  // Flatten all weekly entries across all laborers
  const allEntries = useMemo(() => {
    return entries.map(entry => {
      const laborer = laborers.find(l => l.id === entry.laborerId);
      return {
        ...entry,
        laborerName: laborer?.name ?? 'Unknown',
        laborerRole: laborer?.role ?? '',
        laborerType: laborer?.type ?? 'daily',
        dailyRate: laborer?.dailyRate
      };
    }).sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
  }, [entries, laborers]);

  const filtered = allEntries.filter(
    (e) =>
      e.laborerName.toLowerCase().includes(search.toLowerCase()) ||
      e.weekLabel.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Wages Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Master log of all weekly labor entries
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search laborer or week..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-card/50 rounded-2xl border border-border/50 border-dashed">
          <FileText className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-base font-medium text-foreground">No entries found</p>
          <p className="text-sm mt-1">Weekly labor reports will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/50 bg-card/50 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Week</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Laborer</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Days / Rate</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Gross Pay</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Rolled Over</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Total Owed</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((entry) => (
                <tr key={`${entry.laborerName}-${entry.weekStartDate}`} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {entry.weekLabel}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{entry.laborerName}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.laborerRole}</p>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.laborerType === 'daily' ? (
                      <>
                        <span className="font-medium text-foreground">{entry.daysWorked}</span>
                        <span className="text-muted-foreground text-xs"> × {formatAmount(entry.dailyRate || 0)}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">Contract</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatAmount(entry.grossAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                    {formatAmount(entry.rolledOverBalance)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                    {formatAmount(entry.balance)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig[entry.status].className}`}>
                      {statusConfig[entry.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
