'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WeeklyEntry, Laborer } from '@/types';
import { formatAmount } from '@/lib/utils/currency';
import { toISODate } from '@/lib/utils/dates';
import { Banknote, TrendingDown } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  entry: WeeklyEntry;
  laborer: Laborer;
  onSubmit: (
    amount: number,
    type: 'payment' | 'advance',
    date: string,
    notes: string
  ) => Promise<void>;
}

export function PaymentModal({
  open,
  onClose,
  entry,
  laborer,
  onSubmit,
}: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'payment' | 'advance'>('payment');
  const [date, setDate] = useState(toISODate(new Date()));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    await onSubmit(Number(amount), type, date, notes.trim());
    setSaving(false);
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'payment' ? (
              <Banknote className="w-5 h-5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-amber-500" />
            )}
            Log Transaction — {laborer.name}
          </DialogTitle>
        </DialogHeader>

        {/* Current balance context */}
        <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Week</span>
            <span className="font-medium">{entry.weekLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Wages</span>
            <span className="font-medium">{formatAmount(entry.grossAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="font-bold text-primary">{formatAmount(entry.balance)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Transaction Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as 'payment' | 'advance')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">
                  💵 Payment (reduces balance)
                </SelectItem>
                <SelectItem value="advance">
                  📤 Advance (deducted from wages)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount">Amount (₨)</Label>
              <Input
                id="pay-amount"
                type="number"
                min={1}
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-date">Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-notes">Notes (optional)</Label>
            <Textarea
              id="pay-notes"
              placeholder="e.g. Thursday payment, advance for Eid…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !amount}
              className={
                type === 'payment'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }
            >
              {saving
                ? 'Saving…'
                : type === 'payment'
                ? 'Log Payment'
                : 'Log Advance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
