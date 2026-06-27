'use client';

import { useState } from 'react';
import { useLaborers } from '@/lib/hooks/useLaborers';
import { useWeeklyEntries } from '@/lib/hooks/useWeeklyEntries';
import { LaborerCard } from '@/components/labor/LaborerCard';
import { LaborerForm } from '@/components/labor/LaborerForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Laborer } from '@/types';
import { UserPlus, Search, HardHat } from 'lucide-react';

export default function LaborPage() {
  const { laborers, loading: lLoading, addLaborer, updateLaborer, deleteLaborer } =
    useLaborers();
  const {
    entries,
    transactions,
    loading: eLoading,
    getEntriesForLaborer,
    getTransactionsForLaborer,
    logPayment,
    createWeeklyEntry,
  } = useWeeklyEntries();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Laborer | null>(null);

  const loading = lLoading || eLoading;

  const filtered = laborers.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Labor Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {laborers.length} laborer{laborers.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Laborer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <HardHat className="w-14 h-14 mb-4 opacity-30" />
          <p className="text-base font-medium">No laborers found</p>
          <p className="text-sm mt-1">
            {search ? 'Try a different search term.' : 'Click "Add Laborer" to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((laborer) => (
            <LaborerCard
              key={laborer.id}
              laborer={laborer}
              entries={getEntriesForLaborer(laborer.id)}
              transactions={getTransactionsForLaborer(laborer.id)}
              onEdit={() => setEditTarget(laborer)}
              onDelete={() => deleteLaborer(laborer.id)}
              onLogPayment={async (entry, amount, type, date, notes) => {
                await logPayment(entry, laborer, amount, type, date, notes);
              }}
              onCreateEntry={async (daysWorked, notes, weekDate) => {
                await createWeeklyEntry(laborer, daysWorked, notes, weekDate);
              }}
            />
          ))}
        </div>
      )}

      {/* Add Laborer Modal */}
      <LaborerForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (data) => { await addLaborer(data); }}
      />

      {/* Edit Laborer Modal */}
      {editTarget && (
        <LaborerForm
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          initial={editTarget}
          onSubmit={async (data) => {
            await updateLaborer(editTarget.id, data);
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}
