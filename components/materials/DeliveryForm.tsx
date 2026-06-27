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
import { MaterialDelivery, MaterialCategory } from '@/types';
import { toISODate } from '@/lib/utils/dates';
import { formatAmount } from '@/lib/utils/currency';

const UNITS: Record<MaterialCategory, string[]> = {
  bricks: ['bricks', 'thousand'],
  steel: ['kg', 'ton'],
  cement: ['bags', 'ton'],
  crush: ['CFT', 'cubic meter'],
  sand: ['CFT', 'cubic meter'],
  other: ['item', 'unit', 'kg', 'litre'],
};

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  bricks: 'Bricks',
  steel: 'Steel Bars',
  cement: 'Cement',
  crush: 'Crush / Aggregate',
  sand: 'Sand',
  other: 'Other',
};

interface DeliveryFormProps {
  open: boolean;
  onClose: () => void;
  category: MaterialCategory;
  initial?: MaterialDelivery;
  onSubmit: (data: Omit<MaterialDelivery, 'id' | 'totalCost' | 'balance'>) => Promise<void>;
}

export function DeliveryForm({
  open,
  onClose,
  category,
  initial,
  onSubmit,
}: DeliveryFormProps) {
  const units = UNITS[category];
  const [date, setDate] = useState(initial?.date ?? toISODate(new Date()));
  const [supplier, setSupplier] = useState(initial?.supplier ?? '');
  const [supplierPhone, setSupplierPhone] = useState(initial?.supplierPhone ?? '');
  const [supplierAddress, setSupplierAddress] = useState(initial?.supplierAddress ?? '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''));
  const [unit, setUnit] = useState(initial?.unit ?? units[0]);
  const [pricePerUnit, setPricePerUnit] = useState(String(initial?.pricePerUnit ?? ''));
  const [amountPaid, setAmountPaid] = useState(String(initial?.amountPaid ?? '0'));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const totalCost = Number(quantity) * Number(pricePerUnit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      category,
      date,
      supplier: supplier.trim(),
      supplierPhone: supplierPhone.trim() || undefined,
      supplierAddress: supplierAddress.trim() || undefined,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      amountPaid: Number(amountPaid),
      notes: notes.trim(),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? 'Edit' : 'Log'} {CATEGORY_LABELS[category]} Delivery
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-date">Delivery Date</Label>
              <Input
                id="d-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-supplier">Supplier / Vendor</Label>
              <Input
                id="d-supplier"
                placeholder="e.g. Al-Rehman Bricks"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-phone">Supplier Phone (Optional)</Label>
              <Input
                id="d-phone"
                placeholder="03xx-xxxxxxx"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-address">Supplier Address (Optional)</Label>
              <Input
                id="d-address"
                placeholder="e.g. Main Bazar"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="d-qty">Quantity</Label>
              <Input
                id="d-qty"
                type="number"
                min={0}
                step="any"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-unit">Unit</Label>
              <select
                id="d-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-price">Price per {unit} (₨)</Label>
              <Input
                id="d-price"
                type="number"
                min={0}
                step="any"
                placeholder="e.g. 12"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-paid">Amount Paid (₨)</Label>
              <Input
                id="d-paid"
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
          </div>

          {/* Cost preview */}
          {quantity && pricePerUnit && (
            <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {quantity} {unit} × {formatAmount(Number(pricePerUnit))}
                </span>
                <span className="font-semibold">{formatAmount(totalCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Paid</span>
                <span>− {formatAmount(Number(amountPaid))}</span>
              </div>
              <div className="flex justify-between font-bold text-primary border-t border-border pt-1.5">
                <span>Outstanding</span>
                <span>{formatAmount(Math.max(0, totalCost - Number(amountPaid)))}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="d-notes">Notes (optional)</Label>
            <Textarea
              id="d-notes"
              placeholder="Any remarks about this delivery…"
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
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Log Delivery'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
