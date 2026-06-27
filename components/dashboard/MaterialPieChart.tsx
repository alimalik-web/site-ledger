'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatAmount } from '@/lib/utils/currency';

const CATEGORY_COLORS: Record<string, string> = {
  bricks: 'hsl(var(--chart-1))',
  steel: 'hsl(var(--chart-2))',
  cement: 'hsl(var(--chart-3))',
  crush: 'hsl(var(--chart-4))',
  sand: 'hsl(var(--chart-5))',
  other: 'hsl(220 15% 50%)',
};

const CATEGORY_LABELS: Record<string, string> = {
  bricks: 'Bricks',
  steel: 'Steel Bars',
  cement: 'Cement',
  crush: 'Crush / Aggregate',
  sand: 'Sand',
  other: 'Other',
};

interface MaterialPieChartProps {
  data: { category: string; amount: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-foreground">
          {CATEGORY_LABELS[payload[0].name] ?? payload[0].name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatAmount(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function MaterialPieChart({ data }: MaterialPieChartProps) {
  if (!data.length || data.every((d) => d.amount === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No material data yet. Add deliveries to see the breakdown.
      </div>
    );
  }

  const filtered = data.filter((d) => d.amount > 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          stroke="none"
        >
          {filtered.map((entry) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[entry.category] ?? 'hsl(var(--chart-1))'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: 'hsl(var(--foreground))', fontSize: '11px' }}>
              {CATEGORY_LABELS[value] ?? value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
