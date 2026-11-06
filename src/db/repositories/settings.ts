import { db } from '@/db/schema';

export function getSetting(key: string): string | null {
  const row = db.getFirstSync<{ value: string | null }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  return row ? row.value : null;
}

export function setSetting(key: string, value: string) {
  db.runSync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}
