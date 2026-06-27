// ─── Laborer ──────────────────────────────────────────────────────────────────

export type LaborType = 'daily' | 'contract';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type TransactionType = 'payment' | 'advance';
export type MaterialCategory = 'bricks' | 'steel' | 'cement' | 'crush' | 'sand' | 'other';

export interface Laborer {
  id: string;
  name: string;
  role: string;
  type: LaborType;
  dailyRate?: number;       // used when type === 'daily'
  contractAmount?: number;  // used when type === 'contract'
  createdAt: string;
}

// One weekly record per laborer (Mon → Thu pay cycle)
export interface WeeklyEntry {
  id: string;
  laborerId: string;
  weekLabel: string;        // e.g. "Jun 23 – Jun 26, 2025"
  weekStartDate: string;    // ISO date string of Monday
  weekEndDate: string;      // ISO date string of Thursday
  daysWorked: number;       // only meaningful for daily-rate laborers
  grossAmount: number;      // days × rate  OR  contractAmount
  advancePaid: number;      // advances received this week (cuts from balance)
  amountPaid: number;       // amount paid on/before Thursday
  rolledOverBalance: number;// balance carried forward from previous week
  balance: number;          // rolledOver + gross − advance − amountPaid
  status: PaymentStatus;
  notes: string;
}

// Atomic payment / advance event (drives the history log)
export interface PaymentTransaction {
  id: string;
  laborerId: string;
  weeklyEntryId: string;
  date: string;             // ISO date string
  amount: number;
  type: TransactionType;
  notes: string;
}

// ─── Materials ────────────────────────────────────────────────────────────────

export interface MaterialDelivery {
  id: string;
  category: MaterialCategory;
  date: string;
  supplier: string;
  quantity: number;
  unit: string;             // 'bricks' | 'kg' | 'ton' | 'bags' | 'CFT' | 'item'
  pricePerUnit: number;
  totalCost: number;        // quantity × pricePerUnit
  amountPaid: number;
  balance: number;          // totalCost − amountPaid
  notes: string;
}

// ─── Dashboard summary (derived / computed) ───────────────────────────────────

export interface DashboardSummary {
  totalLaborCost: number;
  totalMaterialCost: number;
  totalCashPaid: number;
  totalOutstanding: number;
  laborByWeek: { week: string; amount: number }[];
  materialByCategory: { category: string; amount: number }[];
}
