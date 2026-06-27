'use client';

import { useLaborers } from '@/lib/hooks/useLaborers';
import { useWeeklyEntries } from '@/lib/hooks/useWeeklyEntries';
import { useMaterials } from '@/lib/hooks/useMaterials';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { LaborVsMaterialChart } from '@/components/dashboard/LaborVsMaterialChart';
import { MaterialPieChart } from '@/components/dashboard/MaterialPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  HardHat,
  Package,
  Banknote,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { MaterialCategory } from '@/types';

const ALL_CATEGORIES: MaterialCategory[] = ['bricks', 'steel', 'cement', 'crush', 'sand', 'other'];

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  bricks: 'Bricks',
  steel: 'Steel Bars',
  cement: 'Cement',
  crush: 'Crush / Aggregate',
  sand: 'Sand',
  other: 'Other',
};

export default function DashboardPage() {
  const { laborers, loading: lLoading } = useLaborers();
  const { entries, transactions, loading: eLoading } = useWeeklyEntries();
  const { deliveries, loading: mLoading } = useMaterials();

  const loading = lLoading || eLoading || mLoading;

  // ── Financial computations ──────────────────────────────────────────────────
  const totalLaborCost = entries.reduce((s, e) => s + e.grossAmount, 0);
  const totalMaterialCost = deliveries.reduce((s, d) => s + d.totalCost, 0);
  const totalLaborPaid = entries.reduce((s, e) => s + e.amountPaid + e.advancePaid, 0);
  const totalMaterialPaid = deliveries.reduce((s, d) => s + d.amountPaid, 0);
  const totalCashPaid = totalLaborPaid + totalMaterialPaid;
  const totalOutstanding =
    entries.reduce((s, e) => s + Math.max(0, e.balance), 0) +
    deliveries.reduce((s, d) => s + d.balance, 0);

  // ── Bar chart: group by week ─────────────────────────────────────────────────
  const weekMap: Record<string, { labor: number; materials: number }> = {};
  entries.forEach((e) => {
    const key = e.weekLabel;
    weekMap[key] = weekMap[key] ?? { labor: 0, materials: 0 };
    weekMap[key].labor += e.grossAmount;
  });
  const barData = Object.entries(weekMap)
    .slice(-8)
    .map(([week, vals]) => ({ week, ...vals }));

  // ── Pie chart: material by category ─────────────────────────────────────────
  const pieData = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    amount: deliveries.filter((d) => d.category === cat).reduce((s, d) => s + d.totalCost, 0),
  })).filter((d) => d.amount > 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Financial overview of your construction site — updated in real time.
        </p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Labor Cost"
            amount={totalLaborCost}
            icon={HardHat}
            iconColor="text-blue-500"
            iconBg="bg-blue-500"
            trendLabel={`${laborers.length} laborer${laborers.length !== 1 ? 's' : ''}`}
            trend="neutral"
          />
          <SummaryCard
            title="Total Material Cost"
            amount={totalMaterialCost}
            icon={Package}
            iconColor="text-purple-500"
            iconBg="bg-purple-500"
            trendLabel={`${deliveries.length} deliveries`}
            trend="neutral"
          />
          <SummaryCard
            title="Total Cash Paid"
            amount={totalCashPaid}
            icon={Banknote}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500"
            trendLabel={`${transactions.length} transactions`}
            trend="neutral"
          />
          <SummaryCard
            title="Total Outstanding"
            amount={totalOutstanding}
            icon={AlertCircle}
            iconColor="text-red-500"
            iconBg="bg-red-500"
            trendLabel="Balance owed"
            trend={totalOutstanding > 0 ? 'up' : 'neutral'}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Labor vs. Materials</h2>
            <span className="text-xs text-muted-foreground ml-auto">Weekly breakdown</span>
          </div>
          <LaborVsMaterialChart data={barData} />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Materials Breakdown</h2>
          </div>
          <MaterialPieChart data={pieData} />
        </div>
      </div>

      {/* Recent Stats */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Category Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ALL_CATEGORIES.map((cat) => {
            const total = deliveries
              .filter((d) => d.category === cat)
              .reduce((s, d) => s + d.totalCost, 0);
            const count = deliveries.filter((d) => d.category === cat).length;
            return (
              <div key={cat} className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  {CATEGORY_LABELS[cat]}
                </p>
                <p className="text-sm font-bold">
                  {total > 0 ? `₨ ${(total / 1000).toFixed(0)}k` : '—'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {count} {count === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
