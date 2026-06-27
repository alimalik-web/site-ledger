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
import { Laborer, WeeklyEntry } from '@/types';
import { formatAmount } from '@/lib/utils/currency';
import { getWeekLabel, getWeekStart, toISODate } from '@/lib/utils/dates';
import { calculateGross } from '@/lib/utils/calculations';

interface WeeklyEntryFormProps {
  open: boolean;
  onClose: () => void;
  laborer: Laborer;
  rolledOverBalance: number;
  onSubmit: (daysWorked: number, notes: string, weekDate: Date) => Promise<void>;
}

export function WeeklyEntryForm({
  open,
  onClose,
  laborer,
  rolledOverBalance,
  onSubmit,
}: WeeklyEntryFormProps) {
  const [daysWorked, setDaysWorked] = useState(laborer.type === 'contract' ? 0 : 5);
  const [notes, setNotes] = useState('');
  const [weekDate, setWeekDate] = useState(toISODate(new Date()));
  const [saving, setSaving] = useState(false);

  const gross = calculateGross(laborer, daysWorked);
  const projectedBalance = rolledOverBalance + gross;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(daysWorked, notes.trim(), new Date(weekDate));
    setSaving(false);
    setDaysWorked(5);
    setNotes('');
    onClose();
  };

  const weekStart = getWeekStart(new Date(weekDate));
  const weekLabel = getWeekLabel(weekStart);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Weekly Entry — {laborer.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="week-date">Week (select any date in the week)</Label>
            <Input
              id="week-date"
              type="date"
              value={weekDate}
              onChange={(e) => setWeekDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Week: {weekLabel}</p>
          </div>

          {laborer.type === 'daily' && (
            <div className="space-y-1.5">
              <Label htmlFor="days-worked">Days Worked</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setDaysWorked(Math.max(0, daysWorked - 1))}
                >
                  −
                </Button>
                <Input
                  id="days-worked"
                  type="number"
                  min={0}
                  max={7}
                  value={daysWorked}
                  onChange={(e) => setDaysWorked(Number(e.target.value))}
                  className="text-center w-20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setDaysWorked(Math.min(7, daysWorked + 1))}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground">
                  × {formatAmount(laborer.dailyRate ?? 0)}/day
                </span>
              </div>
            </div>
          )}

          {/* Calculation preview */}
          <div className="bg-muted rounded-lg p-3 space-y-1.5 text-sm">
            {rolledOverBalance > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>Rolled Over Balance</span>
                <span className="font-medium">+ {formatAmount(rolledOverBalance)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {laborer.type === 'contract' ? 'Contract Amount' : 'Gross Wages'}
              </span>
              <span className="font-medium">{formatAmount(gross)}</span>
            </div>
            <div className="flex justify-between font-semibold text-primary border-t border-border pt-1.5">
              <span>Total Balance Owed</span>
              <span>{formatAmount(projectedBalance)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="entry-notes">Notes (optional)</Label>
            <Textarea
              id="entry-notes"
              placeholder="Any remarks for this week…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
