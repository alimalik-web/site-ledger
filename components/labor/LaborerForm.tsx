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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Laborer, LaborType } from '@/types';

interface LaborerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Laborer, 'id' | 'createdAt'>) => Promise<void>;
  initial?: Laborer;
}

export function LaborerForm({ open, onClose, onSubmit, initial }: LaborerFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [type, setType] = useState<LaborType>(initial?.type ?? 'daily');
  const [dailyRate, setDailyRate] = useState(String(initial?.dailyRate ?? ''));
  const [contractAmount, setContractAmount] = useState(
    String(initial?.contractAmount ?? '')
  );
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [cnic, setCnic] = useState(initial?.cnic ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      name: name.trim(),
      role: role.trim(),
      type,
      dailyRate: type === 'daily' ? Number(dailyRate) : undefined,
      contractAmount: type === 'contract' ? Number(contractAmount) : undefined,
      phone: phone.trim() || undefined,
      cnic: cnic.trim() || undefined,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Laborer' : 'Add New Laborer'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. Ahmed Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role / Designation</Label>
              <Input
                id="role"
                placeholder="e.g. Mason, Helper"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                placeholder="03xx-xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cnic">CNIC (Optional)</Label>
              <Input
                id="cnic"
                placeholder="xxxxx-xxxxxxx-x"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Labor Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LaborType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Rate</SelectItem>
                <SelectItem value="contract">Fixed Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'daily' ? (
            <div className="space-y-1.5">
              <Label htmlFor="dailyRate">Per-Day Rate (₨)</Label>
              <Input
                id="dailyRate"
                type="number"
                min={0}
                placeholder="e.g. 1200"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="contractAmount">Contract Amount (₨)</Label>
              <Input
                id="contractAmount"
                type="number"
                min={0}
                placeholder="e.g. 50000"
                value={contractAmount}
                onChange={(e) => setContractAmount(e.target.value)}
                required
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Laborer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
