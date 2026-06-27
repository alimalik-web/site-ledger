'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useMaterials } from '@/lib/hooks/useMaterials';
import { DeliveryForm } from '@/components/materials/DeliveryForm';
import { DeliveryTable } from '@/components/materials/DeliveryTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialCategory } from '@/types';
import { formatAmount } from '@/lib/utils/currency';
import { Plus, Layers } from 'lucide-react';

const CATEGORIES: { value: MaterialCategory; label: string; emoji: string }[] = [
  { value: 'bricks', label: 'Bricks', emoji: '🧱' },
  { value: 'steel', label: 'Steel Bars', emoji: '⚙️' },
  { value: 'cement', label: 'Cement', emoji: '🏗️' },
  { value: 'crush', label: 'Crush / Agg.', emoji: '⛏️' },
  { value: 'sand', label: 'Sand', emoji: '🏖️' },
  { value: 'other', label: 'Other', emoji: '📦' },
];

function MaterialsContent() {
  const searchParams = useSearchParams();
  const defaultCat = (searchParams.get('category') as MaterialCategory) ?? 'bricks';

  const [activeTab, setActiveTab] = useState<MaterialCategory>(defaultCat);
  const [showForm, setShowForm] = useState(false);

  const { loading, getDeliveriesByCategory, getCategorySummary, addDelivery, updateDelivery, deleteDelivery } =
    useMaterials();

  useEffect(() => {
    const cat = searchParams.get('category') as MaterialCategory;
    if (cat) setActiveTab(cat);
  }, [searchParams]);

  const summary = getCategorySummary(activeTab);
  const deliveries = getDeliveriesByCategory(activeTab);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materials Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log and track material deliveries by category
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Log Delivery
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MaterialCategory)}>
        <TabsList className="h-auto flex-wrap gap-1 bg-muted p-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="space-y-4 mt-4">
            {/* Category Summary Bar */}
            {loading ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Total Ordered
                  </p>
                  <p className="text-lg font-bold">{formatAmount(summary.totalOrdered)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {summary.deliveryCount} deliveries
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Total Paid
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatAmount(summary.totalPaid)}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Outstanding
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      summary.totalOutstanding > 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {formatAmount(summary.totalOutstanding)}
                  </p>
                </div>
              </div>
            )}

            {/* Deliveries Table */}
            {loading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              <DeliveryTable
                deliveries={getDeliveriesByCategory(cat.value)}
                category={cat.value}
                onUpdate={updateDelivery}
                onDelete={deleteDelivery}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      <DeliveryForm
        open={showForm}
        onClose={() => setShowForm(false)}
        category={activeTab}
        onSubmit={async (data) => { await addDelivery(data); }}
      />
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96 rounded-xl" /></div>}>
      <MaterialsContent />
    </Suspense>
  );
}
