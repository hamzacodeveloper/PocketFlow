import { db } from '@/db/schema';
import { getMonthRange } from '@/utils/dates';

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount_minor: number;
  category_id: string | null;
  note: string | null;
  date: string;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
  category_key: string | null;
}

export function listByMonth(monthKey: string): TransactionWithCategory[] {
  const { start, end } = getMonthRange(monthKey);
  return db.getAllSync<TransactionWithCategory>(
    `SELECT t.*, c.name AS category_name, c.color AS category_color,
            c.icon AS category_icon, c.key AS category_key
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.date BETWEEN ? AND ?
     ORDER BY t.date DESC, t.created_at DESC`,
    [start, end]
  );
}

export function insert(tx: Omit<Transaction, 'id' | 'created_at'> & { id: string; created_at: string }) {
  db.runSync(
    `INSERT INTO transactions (id, type, amount_minor, category_id, note, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tx.id, tx.type, tx.amount_minor, tx.category_id, tx.note, tx.date, tx.created_at]
  );
}

export function update(tx: Pick<Transaction, 'id' | 'type' | 'amount_minor' | 'category_id' | 'note' | 'date'>) {
  db.runSync(
    `UPDATE transactions SET type = ?, amount_minor = ?, category_id = ?, note = ?, date = ? WHERE id = ?`,
    [tx.type, tx.amount_minor, tx.category_id, tx.note, tx.date, tx.id]
  );
}

export function remove(id: string) {
  db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
}

export function totalsForMonth(monthKey: string) {
  const { start, end } = getMonthRange(monthKey);
  const row = db.getFirstSync<{ spent: number | null; income: number | null; count: number }>(
    `SELECT
       SUM(CASE WHEN type = 'expense' THEN amount_minor ELSE 0 END) AS spent,
       SUM(CASE WHEN type = 'income' THEN amount_minor ELSE 0 END) AS income,
       COUNT(*) AS count
     FROM transactions WHERE date BETWEEN ? AND ?`,
    [start, end]
  );
  return { spent: row?.spent ?? 0, income: row?.income ?? 0, count: row?.count ?? 0 };
}

export function categoryBreakdown(monthKey: string) {
  const { start, end } = getMonthRange(monthKey);
  return db.getAllSync<{ category_id: string | null; name: string; color: string; total: number }>(
    `SELECT t.category_id, COALESCE(c.name, 'Other') AS name, COALESCE(c.color, '#64748B') AS color,
       SUM(t.amount_minor) AS total
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.type = 'expense' AND t.date BETWEEN ? AND ?
     GROUP BY t.category_id
     ORDER BY total DESC`,
    [start, end]
  );
}

export function countAll(): number {
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM transactions');
  return row?.count ?? 0;
}
