import { startOfMonth, endOfMonth, format } from 'date-fns';
import { monthNamesEn, monthNamesUr } from '@/i18n/months';

export function getMonthKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM');
}

export function getMonthRange(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function formatISODate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDateLabel(isoDate: string, lang: string, short = false): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const names = lang === 'ur' ? monthNamesUr : monthNamesEn;
  const name = names[month - 1] ?? '';
  const label = short ? name.slice(0, 3) : name;
  return `${day} ${label} ${year}`;
}

export function isToday(isoDate: string): boolean {
  return isoDate === formatISODate();
}
