import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { utils, write } from 'xlsx';

import { setSetting } from '@/db/repositories/settings';
import { db } from '@/db/schema';
import i18n from '@/i18n';
import { getMonthRange } from '@/utils/dates';

const cacheDir = FileSystem.cacheDirectory ?? '';

// ─── Save to device ──────────────────────────────────────────────────────────
// Android: uses StorageAccessFramework so the user picks a folder (e.g.
//          Downloads) and the file is written there directly.
// iOS:     opens the native share sheet so the user can save to Files / AirDrop.
async function saveToDevice(cachedPath: string, filename: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'android') {
    const { StorageAccessFramework } = FileSystem;
    const result = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!result.granted) {
      throw new Error('Storage permission denied. Please grant folder access and try again.');
    }
    const base64 = await FileSystem.readAsStringAsync(cachedPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const destUri = await StorageAccessFramework.createFileAsync(result.directoryUri, filename, mimeType);
    await FileSystem.writeAsStringAsync(destUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else {
    // iOS — share sheet lets the user save to Files, AirDrop, etc.
    if (await Sharing.isAvailableAsync()) {
      const uti =
        mimeType === 'application/pdf'
          ? 'com.adobe.pdf'
          : 'org.openxmlformats.spreadsheetml.sheet';
      await Sharing.shareAsync(cachedPath, { mimeType, UTI: uti, dialogTitle: filename });
    }
  }
}

// Formula-injection protection: prefix dangerous chars with apostrophe
function safe(val: string | null | undefined): string {
  const s = String(val ?? '');
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function formatRs(minor: number): string {
  return (minor / 100).toFixed(2);
}

// ─── Queries ────────────────────────────────────────────────────────────────

function queryTransactions(where: string, params: (string | number)[]) {
  return db.getAllSync<{
    id: string; date: string; type: string; category_name: string | null;
    amount_minor: number; note: string | null;
  }>(
    `SELECT t.id, t.date, t.type, c.name AS category_name, t.amount_minor, t.note
     FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
     ${where} ORDER BY t.date DESC`,
    params
  );
}

function queryCategories() {
  return db.getAllSync<{ id: string; name: string; color: string | null; monthly_limit_minor: number | null }>(
    'SELECT id, name, color, monthly_limit_minor FROM categories ORDER BY name'
  );
}

function queryBudgets() {
  return db.getAllSync<{ month: string; budget_minor: number }>(
    'SELECT month, budget_minor FROM monthly_budgets ORDER BY month DESC'
  );
}

function querySummary(monthKey: string) {
  const { start, end } = getMonthRange(monthKey);
  const budget = db.getFirstSync<{ budget_minor: number | null }>(
    'SELECT budget_minor FROM monthly_budgets WHERE month = ?', [monthKey]
  );
  const totals = db.getFirstSync<{ spent: number; income: number }>(
    `SELECT
       SUM(CASE WHEN type='expense' THEN amount_minor ELSE 0 END) AS spent,
       SUM(CASE WHEN type='income' THEN amount_minor ELSE 0 END) AS income
     FROM transactions WHERE date BETWEEN ? AND ?`,
    [start, end]
  );
  return {
    budget: budget?.budget_minor ?? 0,
    spent: totals?.spent ?? 0,
    income: totals?.income ?? 0,
  };
}

// ─── PDF ────────────────────────────────────────────────────────────────────

function buildPdfHtml(monthKey: string): string {
  const isUrdu = i18n.language === 'ur';
  const dir = isUrdu ? 'rtl' : 'ltr';
  const { start, end } = getMonthRange(monthKey);
  const txs = queryTransactions('WHERE t.date BETWEEN ? AND ?', [start, end]);
  const { budget, spent, income } = querySummary(monthKey);
  const saved = budget - spent;

  const txRows = txs.map((t) =>
    `<tr><td>${t.date}</td><td>${safe(t.category_name)}</td><td>${t.type}</td><td>${formatRs(t.amount_minor)}</td><td>${safe(t.note)}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html dir="${dir}"><head><meta charset="utf-8"/>
<style>
  body{font-family:sans-serif;padding:24px;direction:${dir};background:#DBDDE6}
  h1{font-size:20px;color:#1F2433}h2{font-size:15px;margin-top:20px;color:#1F2433}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th,td{border:1px solid #EBEBEF;padding:6px 8px;text-align:start}
  th{background:#FEFEFE;color:#1F2433}
  .summary{display:flex;gap:24px;margin:12px 0}
  .stat{background:#FEFEFE;border-radius:8px;padding:12px 16px}
  .stat-label{font-size:11px;color:#7B7D84}
  .stat-value{font-size:18px;font-weight:700;color:#1F2433}
</style></head><body>
<h1>PocketFlow — ${monthKey}</h1>
<div class="summary">
  <div class="stat"><div class="stat-label">Budget</div><div class="stat-value">Rs ${formatRs(budget)}</div></div>
  <div class="stat"><div class="stat-label">Spent</div><div class="stat-value">Rs ${formatRs(spent)}</div></div>
  <div class="stat"><div class="stat-label">${saved >= 0 ? 'Saved' : 'Overspent'}</div><div class="stat-value">Rs ${formatRs(Math.abs(saved))}</div></div>
  <div class="stat"><div class="stat-label">Income</div><div class="stat-value">Rs ${formatRs(income)}</div></div>
</div>
<h2>Transactions</h2>
<table><thead><tr><th>Date</th><th>Category</th><th>Type</th><th>Amount (Rs)</th><th>Note</th></tr></thead>
<tbody>${txRows}</tbody></table>
</body></html>`;
}

export async function exportMonthPdf(monthKey: string): Promise<void> {
  const html = buildPdfHtml(monthKey);
  const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });
  const filename = `PocketFlow_${monthKey}.pdf`;
  const destination = `${cacheDir}${filename}`;

  if (base64) {
    await FileSystem.writeAsStringAsync(destination, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else {
    await FileSystem.copyAsync({ from: uri, to: destination });
  }

  await saveToDevice(destination, filename, 'application/pdf');
}

// ─── Excel ──────────────────────────────────────────────────────────────────

function buildWorkbook(txs: ReturnType<typeof queryTransactions>, monthKey?: string) {
  const wb = utils.book_new();

  // Summary sheet
  const summaryData: (string | number)[][] = [['Month', 'Budget (Rs)', 'Spent (Rs)', 'Saved (Rs)', 'Income (Rs)']];
  const months = monthKey ? [monthKey] : queryBudgets().map((b) => b.month);
  for (const m of months) {
    const s = querySummary(m);
    summaryData.push([m, formatRs(s.budget), formatRs(s.spent), formatRs(s.budget - s.spent), formatRs(s.income)]);
  }
  utils.book_append_sheet(wb, utils.aoa_to_sheet(summaryData), 'Summary');

  // Categories sheet
  const cats = queryCategories();
  const catData: (string | number | null)[][] = [['ID', 'Name', 'Color', 'Monthly Limit (Rs)']];
  for (const c of cats) {
    catData.push([c.id, safe(c.name), c.color ?? '', c.monthly_limit_minor ? formatRs(c.monthly_limit_minor) : '']);
  }
  utils.book_append_sheet(wb, utils.aoa_to_sheet(catData), 'Categories');

  // Transactions sheet
  const txData: (string | number)[][] = [['ID', 'Date', 'Type', 'Category', 'Amount (Rs)', 'Note']];
  for (const t of txs) {
    txData.push([t.id, t.date, t.type, safe(t.category_name), formatRs(t.amount_minor), safe(t.note)]);
  }
  utils.book_append_sheet(wb, utils.aoa_to_sheet(txData), 'Transactions');

  // Budgets sheet
  const budgets = queryBudgets();
  const budgetData: (string | number)[][] = [['Month', 'Budget (Rs)']];
  for (const b of budgets) budgetData.push([b.month, formatRs(b.budget_minor)]);
  utils.book_append_sheet(wb, utils.aoa_to_sheet(budgetData), 'Budgets');

  return wb;
}

async function saveAndShare(wb: ReturnType<typeof utils.book_new>, filename: string): Promise<void> {
  const base64 = write(wb, { type: 'base64', bookType: 'xlsx' });
  const path = `${cacheDir}${filename}`;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  await saveToDevice(path, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

export async function exportMonthExcel(monthKey: string): Promise<void> {
  const { start, end } = getMonthRange(monthKey);
  const txs = queryTransactions('WHERE t.date BETWEEN ? AND ?', [start, end]);
  const wb = buildWorkbook(txs, monthKey);
  await saveAndShare(wb, `PocketFlow_${monthKey}.xlsx`);
}

export async function exportAllExcel(): Promise<void> {
  const txs = queryTransactions('', []);
  const wb = buildWorkbook(txs);
  await saveAndShare(wb, 'PocketFlow_All.xlsx');
  setSetting('last_backup_at', new Date().toISOString());
}
