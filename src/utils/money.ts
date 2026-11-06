import i18n from '@/i18n';

export function formatPaisa(paisa: number): string {
  const rupees = paisa / 100;
  const formatted = rupees.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return i18n.language === 'ur' ? `${formatted} روپے` : `Rs ${formatted}`;
}

export function parsePaisa(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}
