'use client';

import { useState } from 'react';
import { MaterialDelivery, MaterialCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { DeliveryForm } from './DeliveryForm';
import { formatAmount } from '@/lib/utils/currency';
import { formatShortDate } from '@/lib/utils/dates';
import { Edit3, Trash2, PackageOpen } from 'lucide-react';

interface DeliveryTableProps {
  deliveries: MaterialDelivery[];
  category: MaterialCategory;
  onUpdate: (
    id: string,
    data: Partial<Omit<MaterialDelivery, 'id' | 'totalCost' | 'balance'>>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DeliveryTable({
  deliveries,
  category,
  onUpdate,
  onDelete,
}: DeliveryTableProps) {
  const [editTarget, setEditTarget] = useState<MaterialDelivery | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <PackageOpen className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No deliveries logged yet.</p>
        <p className="text-xs mt-0.5">Click "Log Delivery" above to add one.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Supplier
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Quantity
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Rate
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Total
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Paid
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Balance
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatShortDate(d.date)}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{d.supplier}</p>
                  {(d.supplierPhone || d.supplierAddress) && (
                    <div className="flex flex-col gap-0.5 mt-0.5 text-[10px] text-muted-foreground">
                      {d.supplierPhone && <span>📞 {d.supplierPhone}</span>}
                      {d.supplierAddress && <span>📍 {d.supplierAddress}</span>}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {d.quantity.toLocaleString()} {d.unit}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-muted-foreground">
                  {formatAmount(d.pricePerUnit)}
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  {formatAmount(d.totalCost)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                  {formatAmount(d.amountPaid)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span
                    className={`font-semibold ${
                      d.balance > 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {formatAmount(d.balance)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditTarget(d)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/40 border-t border-border font-semibold">
              <td colSpan={4} className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                Totals
              </td>
              <td className="px-4 py-3 text-right">
                {formatAmount(deliveries.reduce((s, d) => s + d.totalCost, 0))}
              </td>
              <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                {formatAmount(deliveries.reduce((s, d) => s + d.amountPaid, 0))}
              </td>
              <td className="px-4 py-3 text-right text-red-500">
                {formatAmount(deliveries.reduce((s, d) => s + d.balance, 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {editTarget && (
        <DeliveryForm
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          category={category}
          initial={editTarget}
          onSubmit={async (data) => {
            await onUpdate(editTarget.id, data);
            setEditTarget(null);
          }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this delivery?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this delivery entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
