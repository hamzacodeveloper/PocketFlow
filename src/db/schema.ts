import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('pocketflow.db');

export const initDb = () => {
  db.execSync(`
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT,
      monthly_limit_minor INTEGER,
      is_default INTEGER DEFAULT 0,
      key TEXT
    );
    
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense','income')),
      amount_minor INTEGER NOT NULL,
      category_id TEXT,
      note TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    
    CREATE TABLE IF NOT EXISTS monthly_budgets (
      month TEXT PRIMARY KEY NOT NULL,
      budget_minor INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  `);
  
  // Seed default categories if empty
  const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if (result && result.count === 0) {
    const defaults = [
      { id: 'cat-food', name: 'Food', key: 'food', icon: 'food', color: '#F59E0B', is_default: 1 },
      { id: 'cat-rent', name: 'Rent', key: 'rent', icon: 'home', color: '#8B5CF6', is_default: 1 },
      { id: 'cat-transport', name: 'Transport', key: 'transport', icon: 'car', color: '#06B6D4', is_default: 1 },
      { id: 'cat-bills', name: 'Bills', key: 'bills', icon: 'receipt', color: '#EF4444', is_default: 1 },
      { id: 'cat-shopping', name: 'Shopping', key: 'shopping', icon: 'bag', color: '#EC4899', is_default: 1 },
      { id: 'cat-health', name: 'Health', key: 'health', icon: 'medical', color: '#10B981', is_default: 1 },
      { id: 'cat-education', name: 'Education', key: 'education', icon: 'book', color: '#6366F1', is_default: 1 },
      { id: 'cat-other', name: 'Other', key: 'other', icon: 'ellipsis-horizontal', color: '#64748B', is_default: 1 },
    ];
    
    for (const cat of defaults) {
      db.runSync(
        'INSERT INTO categories (id, name, key, icon, color, is_default) VALUES (?, ?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.key, cat.icon, cat.color, cat.is_default]
      );
    }
  }
};
