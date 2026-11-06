import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { read, utils } from 'xlsx';
import * as Crypto from 'expo-crypto';

import { db } from '@/db/schema';
import { listAll, insertCategory } from '@/db/repositories/categories';
import { getBudget, setBudget } from '@/db/repositories/budgets';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 20_000;

export interface ImportRow {
  id: string;
  date: string;
  type: string;
  category: string;
  amount_rs: string;
  note: string;
}

export interface PreviewRow {
  row: ImportRow;
  status: 'new' | 'duplicate' | 'invalid';
  reason?: string;
}

export interface ImportPreview {
  rows: PreviewRow[];
  newCount: number;
  dupCount: number;
  invalidCount: number;
}

function validateRow(r: ImportRow): string | null {
  if (!r.id || !/^[0-9a-f-]{36}$/i.test(r.id)) return 'Invalid ID';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return 'Invalid date';
  if (r.type !== 'expense' && r.type !== 'income') return 'Invalid type';
  const amt = parseFloat(r.amount_rs);
  if (isNaN(amt) || amt <= 0) return 'Invalid amount';
  return null;
}

export async function pickAndPreview(): Promise<ImportPreview | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  if (!asset.name.endsWith('.xlsx')) throw new Error('invalidFile');

  const info = await FileSystem.getInfoAsync(asset.uri);
  if (info.exists && (info as { size?: number }).size && (info as { size: number }).size > MAX_FILE_BYTES) {
    throw new Error('fileTooLarge');
  }

  const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
  const wb = read(base64, { type: 'base64', cellFormula: false, cellHTML: false });

  const txSheet = wb.Sheets['Transactions'];
  if (!txSheet) throw new Error('invalidFile');

  const rawRows = utils.sheet_to_json<Record<string, string>>(txSheet, { defval: '' });
  if (rawRows.length > MAX_ROWS) throw new Error('tooManyRows');

  // Validate required headers
  const first = rawRows[0] ?? {};
  if (!('ID' in first) || !('Date' in first) || !('Type' in first) || !('Amount (Rs)' in first)) {
    throw new Error('invalidFile');
  }

  // Get existing IDs for duplicate detection
  const existingIds = new Set(
    db.getAllSync<{ id: string }>('SELECT id FROM transactions').map((r) => r.id)
  );

  const rows: PreviewRow[] = rawRows.slice(0, MAX_ROWS).map((r) => {
    const row: ImportRow = {
      id: String(r['ID'] ?? '').trim(),
      date: String(r['Date'] ?? '').trim(),
      type: String(r['Type'] ?? '').trim(),
      category: String(r['Category'] ?? '').trim(),
      amount_rs: String(r['Amount (Rs)'] ?? '').trim(),
      note: String(r['Note'] ?? '').trim().slice(0, 500),
    };
    if (existingIds.has(row.id)) return { row, status: 'duplicate' };
    const err = validateRow(row);
    if (err) return { row, status: 'invalid', reason: err };
    return { row, status: 'new' };
  });

  // Also read budgets sheet if present
  const budgetSheet = wb.Sheets['Budgets'];
  let budgetRows: { month: string; budget_rs: string }[] = [];
  if (budgetSheet) {
    budgetRows = utils.sheet_to_json<{ Month: string; 'Budget (Rs)': string }>(budgetSheet, { defval: '' })
      .map((r) => ({ month: String(r['Month'] ?? '').trim(), budget_rs: String(r['Budget (Rs)'] ?? '').trim() }))
      .filter((r) => /^\d{4}-\d{2}$/.test(r.month));
  }

  // Store budget rows on the preview object for commit
  (rows as PreviewRow[] & { _budgetRows?: typeof budgetRows })._budgetRows = budgetRows;

  const newCount = rows.filter((r) => r.status === 'new').length;
  const dupCount = rows.filter((r) => r.status === 'duplicate').length;
  const invalidCount = rows.filter((r) => r.status === 'invalid').length;

  return { rows, newCount, dupCount, invalidCount };
}

export function commitImport(preview: ImportPreview): number {
  const newRows = preview.rows.filter((r) => r.status === 'new');
  const cats = listAll();

  db.execSync('BEGIN');
  try {
    for (const { row } of newRows) {
      // Resolve category: by key → by name (case-insensitive) → create new
      let catId: string | null = null;
      const catMatch =
        cats.find((c) => c.key === row.category) ??
        cats.find((c) => c.name.toLowerCase() === row.category.toLowerCase());
      if (catMatch) {
        catId = catMatch.id;
      } else if (row.category) {
        catId = Crypto.randomUUID();
        insertCategory({ id: catId, name: row.category, icon: 'pricetag', color: '#64748B', monthly_limit_minor: null, is_default: 0, key: null });
        cats.push({ id: catId, name: row.category, icon: 'pricetag', color: '#64748B', monthly_limit_minor: null, is_default: 0, key: null });
      }

      const amountMinor = Math.round(parseFloat(row.amount_rs) * 100);
      db.runSync(
        'INSERT INTO transactions (id, type, amount_minor, category_id, note, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [row.id, row.type, amountMinor, catId, row.note || null, row.date, new Date().toISOString()]
      );
    }

    // Import budgets only if month has none
    const budgetRows = (preview.rows as PreviewRow[] & { _budgetRows?: { month: string; budget_rs: string }[] })._budgetRows ?? [];
    for (const b of budgetRows) {
      if (!getBudget(b.month)) {
        const minor = Math.round(parseFloat(b.budget_rs) * 100);
        if (minor > 0) setBudget(b.month, minor);
      }
    }

    db.execSync('COMMIT');
  } catch (e) {
    db.execSync('ROLLBACK');
    throw e;
  }

  return newRows.length;
}
