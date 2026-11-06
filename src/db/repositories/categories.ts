import { db } from '@/db/schema';

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  monthly_limit_minor: number | null;
  is_default: number;
  key: string | null;
}

export function listAll(): Category[] {
  return db.getAllSync<Category>('SELECT * FROM categories ORDER BY is_default DESC, name ASC');
}

export function insertCategory(cat: Category) {
  db.runSync(
    'INSERT INTO categories (id, name, icon, color, monthly_limit_minor, is_default, key) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [cat.id, cat.name, cat.icon, cat.color, cat.monthly_limit_minor, cat.is_default, cat.key]
  );
}

export function updateCategory(cat: Category) {
  db.runSync(
    'UPDATE categories SET name = ?, icon = ?, color = ?, monthly_limit_minor = ? WHERE id = ?',
    [cat.name, cat.icon, cat.color, cat.monthly_limit_minor, cat.id]
  );
}

export function removeCategory(id: string) {
  db.runSync('DELETE FROM categories WHERE id = ?', [id]);
}
