'use client';

import { useState } from 'react';
import { Laborer, WeeklyEntry, PaymentTransaction } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PaymentModal } from './PaymentModal';
import { WeeklyEntryForm } from './WeeklyEntryForm';
import { formatAmount } from '@/lib/utils/currency';
import { formatDisplayDate, formatShortDate } from '@/lib/utils/dates';
import { currentBalanceForLaborer, totalGrossForLaborer, totalPaidForLaborer } from '@/lib/utils/calculations';
import {
  Banknote,
  TrendingDown,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  Clock,
  HardHat,
} from 'lucide-react';

interface LaborerCardProps {
  laborer: Laborer;
  entries: WeeklyEntry[];
  transactions: PaymentTransaction[];
  onEdit: () => void;
  onDelete: () => void;
  onLogPayment: (
    entry: WeeklyEntry,
    amount: number,
    type: 'payment' | 'advance',
    date: string,
    notes: string
  ) => Promise<void>;
  onCreateEntry: (daysWorked: number, notes: string, weekDate: Date) => Promise<void>;
}

const statusConfig = {
  paid: { label: 'Paid', className: 'badge-paid' },
  partial: { label: 'Partial', className: 'badge-partial' },
  unpaid: { label: 'Unpaid', className: 'badge-unpaid' },
};

export function LaborerCard({
  laborer,
  entries,
  transactions,
  onEdit,
  onDelete,
  onLogPayment,
  onCreateEntry,
}: LaborerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<WeeklyEntry | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const currentEntry = entries[0] ?? null;
  const currentBalance = currentBalanceForLaborer(entries);
  const totalGross = totalGrossForLaborer(entries);
  const totalPaid = totalPaidForLaborer(entries);

  const laborerTransactions = transactions.filter((t) => t.laborerId === laborer.id);
  const rolledOverBalance = entries.length > 0 ? Math.max(0, entries[0].balance) : 0;

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Card Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <HardHat className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{laborer.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{laborer.role}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                    {laborer.type === 'daily' ? `₨ ${laborer.dailyRate?.toLocaleString()}/day` : 'Contract'}
                  </Badge>
                </div>
                {(laborer.phone || laborer.cnic) && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    {laborer.phone && <span>📞 {laborer.phone}</span>}
                    {laborer.phone && laborer.cnic && <span className="text-muted-foreground/30">|</span>}
                    {laborer.cnic && <span>🆔 {laborer.cnic}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-muted rounded-lg p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Total Charges</p>
              <p className="text-sm font-bold">{formatAmount(totalGross)}</p>
            </div>
            <div className="bg-muted rounded-lg p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatAmount(totalPaid)}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Balance</p>
              <p className={`text-sm font-bold ${currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {formatAmount(currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Current Week Entry */}
        {currentEntry ? (
          <>
            <Separator />
            <div className="p-3 bg-muted/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {currentEntry.weekLabel}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      statusConfig[currentEntry.status].className
                    }`}
                  >
                    {statusConfig[currentEntry.status].label}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {formatAmount(currentEntry.balance)}
                </span>
              </div>

              {laborer.type === 'daily' && (
                <p className="text-xs text-muted-foreground mt-1 ml-5">
                  {currentEntry.daysWorked} days × {formatAmount(laborer.dailyRate ?? 0)} =&nbsp;
                  {formatAmount(currentEntry.grossAmount)}
                  {currentEntry.rolledOverBalance > 0 &&
                    ` + ${formatAmount(currentEntry.rolledOverBalance)} rolled over`}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2.5">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                  onClick={() => setPaymentTarget(currentEntry)}
                >
                  <Banknote className="w-3 h-3 mr-1" />
                  Log Payment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 flex-1"
                  onClick={() => setPaymentTarget(currentEntry)}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Log Advance
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {/* Expand / History */}
        <Separator />
        <div className="flex">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-9 text-xs rounded-none rounded-bl-xl"
            onClick={() => setShowEntryForm(true)}
          >
            <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
            New Week
          </Button>
          <Separator orientation="vertical" className="h-9 self-center" />
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-9 text-xs rounded-none rounded-br-xl"
            onClick={() => {
              setExpanded(!expanded);
              setShowHistory(!showHistory);
            }}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
                Hide History
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
                View History ({entries.length})
              </>
            )}
          </Button>
        </div>

        {/* History Panel */}
        {expanded && (
          <>
            <Separator />
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Weekly Entries
              </p>
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                    >
                      <div>
                        <p className="font-medium">{entry.weekLabel}</p>
                        <p className="text-muted-foreground">
                          Gross: {formatAmount(entry.grossAmount)} · Paid:{' '}
                          {formatAmount(entry.amountPaid + entry.advancePaid)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatAmount(entry.balance)}</p>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            statusConfig[entry.status].className
                          }`}
                        >
                          {statusConfig[entry.status].label}
                        </span>
                      </div>
                    </div>
                  ))}
                  {entries.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No entries yet. Click "New Week" to start.
                    </p>
                  )}
                </div>
              </ScrollArea>

              {laborerTransactions.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">
                    Payment Transactions
                  </p>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-1.5">
                      {laborerTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={tx.type === 'payment' ? 'text-emerald-500' : 'text-amber-500'}>
                              {tx.type === 'payment' ? '💵' : '📤'}
                            </span>
                            <div>
                              <p className="font-medium capitalize">{tx.type}</p>
                              <p className="text-muted-foreground">{formatDisplayDate(tx.date)}</p>
                              {tx.notes && (
                                <p className="text-muted-foreground italic">{tx.notes}</p>
                              )}
                            </div>
                          </div>
                          <p className="font-bold">{formatAmount(tx.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {paymentTarget && (
        <PaymentModal
          open={!!paymentTarget}
          onClose={() => setPaymentTarget(null)}
          entry={paymentTarget}
          laborer={laborer}
          onSubmit={async (amount, type, date, notes) => {
            await onLogPayment(paymentTarget, amount, type, date, notes);
            setPaymentTarget(null);
          }}
        />
      )}

      <WeeklyEntryForm
        open={showEntryForm}
        onClose={() => setShowEntryForm(false)}
        laborer={laborer}
        rolledOverBalance={rolledOverBalance}
        onSubmit={onCreateEntry}
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {laborer.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this laborer and all their weekly entries and
              payment history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
