import { db } from '@/db/schema';

export function getBudget(monthKey: string): number | null {
  const row = db.getFirstSync<{ budget_minor: number }>(
    'SELECT budget_minor FROM monthly_budgets WHERE month = ?',
    [monthKey]
  );
  return row ? row.budget_minor : null;
}

export function setBudget(monthKey: string, budgetMinor: number) {
  db.runSync(
    'INSERT OR REPLACE INTO monthly_budgets (month, budget_minor) VALUES (?, ?)',
    [monthKey, budgetMinor]
  );
}

export function listAll(): { month: string; budget_minor: number }[] {
  return db.getAllSync<{ month: string; budget_minor: number }>(
    'SELECT month, budget_minor FROM monthly_budgets ORDER BY month ASC'
  );
}
