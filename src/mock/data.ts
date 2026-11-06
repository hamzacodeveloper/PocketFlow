// ─── Types (mirror DB shape) ──────────────────────────────────────────────────
export interface MockCategory {
  id: string;
  name: string;
  key: string | null;
  icon: string;
  color: string;
  monthly_limit_minor: number | null;
  is_default: number;
}

export interface MockTransaction {
  id: string;
  type: 'expense' | 'income';
  amount_minor: number;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
  note: string | null;
  date: string;
  created_at: string;
}

export interface MockBudget {
  month: string;
  budget_minor: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES: MockCategory[] = [
  { id: 'cat-food',      name: 'Food',       key: 'food',      icon: 'fast-food',                    color: '#F59E0B', monthly_limit_minor: 1500000, is_default: 1 },
  { id: 'cat-rent',      name: 'Rent',       key: 'rent',      icon: 'home',                         color: '#8B5CF6', monthly_limit_minor: 3000000, is_default: 1 },
  { id: 'cat-transport', name: 'Transport',  key: 'transport', icon: 'car',                          color: '#06B6D4', monthly_limit_minor: 500000,  is_default: 1 },
  { id: 'cat-bills',     name: 'Bills',      key: 'bills',     icon: 'receipt',                      color: '#EF4444', monthly_limit_minor: 800000,  is_default: 1 },
  { id: 'cat-shopping',  name: 'Shopping',   key: 'shopping',  icon: 'bag-handle',                   color: '#EC4899', monthly_limit_minor: 600000,  is_default: 1 },
  { id: 'cat-health',    name: 'Health',     key: 'health',    icon: 'medkit',                       color: '#10B981', monthly_limit_minor: null,    is_default: 1 },
  { id: 'cat-education', name: 'Education',  key: 'education', icon: 'book',                         color: '#6366F1', monthly_limit_minor: null,    is_default: 1 },
  { id: 'cat-other',     name: 'Other',      key: 'other',     icon: 'ellipsis-horizontal-circle',   color: '#64748B', monthly_limit_minor: null,    is_default: 1 },
];

// ─── Budgets ──────────────────────────────────────────────────────────────────
export const MOCK_BUDGETS: MockBudget[] = [
  { month: '2025-07', budget_minor: 8000000 },
  { month: '2025-06', budget_minor: 8000000 },
  { month: '2025-05', budget_minor: 7500000 },
  { month: '2025-04', budget_minor: 7500000 },
  { month: '2025-03', budget_minor: 7000000 },
  { month: '2025-02', budget_minor: 7000000 },
];

// ─── Transactions ─────────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS: MockTransaction[] = [
  // July 2025
  { id: 'tx-01', type: 'expense', amount_minor: 45000,   category_id: 'cat-food',      category_name: 'Food',      category_color: '#F59E0B', category_icon: 'fast-food',   note: 'Lunch at office',    date: '2025-07-15', created_at: '2025-07-15T12:00:00Z' },
  { id: 'tx-02', type: 'expense', amount_minor: 3000000, category_id: 'cat-rent',      category_name: 'Rent',      category_color: '#8B5CF6', category_icon: 'home',        note: 'July rent',          date: '2025-07-01', created_at: '2025-07-01T09:00:00Z' },
  { id: 'tx-03', type: 'expense', amount_minor: 120000,  category_id: 'cat-transport', category_name: 'Transport', category_color: '#06B6D4', category_icon: 'car',         note: 'Uber rides',         date: '2025-07-14', created_at: '2025-07-14T18:00:00Z' },
  { id: 'tx-04', type: 'expense', amount_minor: 85000,   category_id: 'cat-bills',     category_name: 'Bills',     category_color: '#EF4444', category_icon: 'receipt',     note: 'Electricity',        date: '2025-07-10', created_at: '2025-07-10T10:00:00Z' },
  { id: 'tx-05', type: 'expense', amount_minor: 230000,  category_id: 'cat-shopping',  category_name: 'Shopping',  category_color: '#EC4899', category_icon: 'bag-handle',  note: 'Clothes',            date: '2025-07-13', created_at: '2025-07-13T15:00:00Z' },
  { id: 'tx-06', type: 'income',  amount_minor: 8000000, category_id: null,            category_name: null,        category_color: null,      category_icon: null,          note: 'Monthly salary',     date: '2025-07-01', created_at: '2025-07-01T08:00:00Z' },
  { id: 'tx-07', type: 'expense', amount_minor: 35000,   category_id: 'cat-food',      category_name: 'Food',      category_color: '#F59E0B', category_icon: 'fast-food',   note: 'Dinner',             date: '2025-07-15', created_at: '2025-07-15T20:00:00Z' },
  { id: 'tx-08', type: 'expense', amount_minor: 150000,  category_id: 'cat-health',    category_name: 'Health',    category_color: '#10B981', category_icon: 'medkit',      note: 'Doctor visit',       date: '2025-07-12', created_at: '2025-07-12T11:00:00Z' },
  { id: 'tx-09', type: 'expense', amount_minor: 60000,   category_id: 'cat-food',      category_name: 'Food',      category_color: '#F59E0B', category_icon: 'fast-food',   note: 'Groceries',          date: '2025-07-11', created_at: '2025-07-11T17:00:00Z' },
  { id: 'tx-10', type: 'expense', amount_minor: 200000,  category_id: 'cat-education', category_name: 'Education', category_color: '#6366F1', category_icon: 'book',        note: 'Online course',      date: '2025-07-08', created_at: '2025-07-08T09:00:00Z' },
  // June 2025
  { id: 'tx-11', type: 'expense', amount_minor: 3000000, category_id: 'cat-rent',      category_name: 'Rent',      category_color: '#8B5CF6', category_icon: 'home',        note: 'June rent',          date: '2025-06-01', created_at: '2025-06-01T09:00:00Z' },
  { id: 'tx-12', type: 'expense', amount_minor: 520000,  category_id: 'cat-food',      category_name: 'Food',      category_color: '#F59E0B', category_icon: 'fast-food',   note: null,                 date: '2025-06-15', created_at: '2025-06-15T12:00:00Z' },
  { id: 'tx-13', type: 'expense', amount_minor: 310000,  category_id: 'cat-transport', category_name: 'Transport', category_color: '#06B6D4', category_icon: 'car',         note: null,                 date: '2025-06-20', created_at: '2025-06-20T18:00:00Z' },
  { id: 'tx-14', type: 'income',  amount_minor: 8000000, category_id: null,            category_name: null,        category_color: null,      category_icon: null,          note: 'Monthly salary',     date: '2025-06-01', created_at: '2025-06-01T08:00:00Z' },
  { id: 'tx-15', type: 'expense', amount_minor: 1800000, category_id: 'cat-shopping',  category_name: 'Shopping',  category_color: '#EC4899', category_icon: 'bag-handle',  note: 'Eid shopping',       date: '2025-06-25', created_at: '2025-06-25T14:00:00Z' },
];

// ─── Helper functions (same API as real repositories) ─────────────────────────
export function getMockTransactionsByMonth(monthKey: string): MockTransaction[] {
  return MOCK_TRANSACTIONS
    .filter((tx) => tx.date.startsWith(monthKey))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getMockBudget(monthKey: string): number | null {
  return MOCK_BUDGETS.find((b) => b.month === monthKey)?.budget_minor ?? null;
}

export function getMockCategoryBreakdown(monthKey: string) {
  const txs = getMockTransactionsByMonth(monthKey).filter((t) => t.type === 'expense');
  const map = new Map<string, { name: string; color: string; icon: string; total: number; category_id: string }>();
  for (const tx of txs) {
    const key = tx.category_id ?? 'other';
    const existing = map.get(key);
    if (existing) {
      existing.total += tx.amount_minor;
    } else {
      map.set(key, {
        category_id: key,
        name: tx.category_name ?? 'Other',
        color: tx.category_color ?? '#64748B',
        icon: tx.category_icon ?? 'ellipsis-horizontal-circle',
        total: tx.amount_minor,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function getMockSavingsHistory(limit = 6) {
  return MOCK_BUDGETS.slice(0, limit).map((b) => {
    const spent = MOCK_TRANSACTIONS
      .filter((tx) => tx.date.startsWith(b.month) && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount_minor, 0);
    return { month: b.month, budget_minor: b.budget_minor, spent };
  }).reverse();
}
