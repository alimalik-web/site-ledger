'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/utils/currency';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  className?: string;
}

export function SummaryCard({
  title,
  amount,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* Background gradient accent */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-12 translate-x-12 opacity-10',
          iconBg
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground truncate">
            {formatAmount(amount)}
          </p>
          {trendLabel && (
            <div className="flex items-center gap-1 mt-1.5">
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
              {trend === 'neutral' && <Minus className="w-3 h-3 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            </div>
          )}
        </div>

        <div className={cn('p-2.5 rounded-lg shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
