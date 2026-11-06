import { db } from '@/db/schema';

export interface MonthSummaryRow {
  month: string;
  budget_minor: number;
  spent: number;
}

export function monthlySavingsHistory(limitMonths = 6): MonthSummaryRow[] {
  return db.getAllSync<MonthSummaryRow>(
    `SELECT b.month AS month,
            b.budget_minor AS budget_minor,
            COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount_minor ELSE 0 END), 0) AS spent
     FROM monthly_budgets b
     LEFT JOIN transactions t ON substr(t.date, 1, 7) = b.month
     GROUP BY b.month
     ORDER BY b.month DESC
     LIMIT ?`,
    [limitMonths]
  ).reverse();
}
