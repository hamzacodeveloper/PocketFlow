import { getMonthKey, getMonthRange, formatISODate } from '../utils/dates';

describe('getMonthKey', () => {
  it('returns YYYY-MM format for current date', () => {
    const key = getMonthKey();
    expect(key).toMatch(/^\d{4}-\d{2}$/);
  });

  it('returns correct key for a given date', () => {
    expect(getMonthKey(new Date(2025, 0, 15))).toBe('2025-01');
    expect(getMonthKey(new Date(2025, 11, 31))).toBe('2025-12');
  });
});

describe('getMonthRange', () => {
  it('returns correct start and end for January', () => {
    const { start, end } = getMonthRange('2025-01');
    expect(start).toBe('2025-01-01');
    expect(end).toBe('2025-01-31');
  });

  it('returns correct start and end for February (non-leap)', () => {
    const { start, end } = getMonthRange('2025-02');
    expect(start).toBe('2025-02-01');
    expect(end).toBe('2025-02-28');
  });

  it('returns correct start and end for February (leap year)', () => {
    const { start, end } = getMonthRange('2024-02');
    expect(start).toBe('2024-02-01');
    expect(end).toBe('2024-02-29');
  });

  it('returns correct start and end for December', () => {
    const { start, end } = getMonthRange('2025-12');
    expect(start).toBe('2025-12-01');
    expect(end).toBe('2025-12-31');
  });

  it('start is always the 1st', () => {
    const { start } = getMonthRange('2025-06');
    expect(start.endsWith('-01')).toBe(true);
  });
});

describe('formatISODate', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = formatISODate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats a specific date correctly', () => {
    expect(formatISODate(new Date(2025, 5, 7))).toBe('2025-06-07');
    expect(formatISODate(new Date(2025, 0, 1))).toBe('2025-01-01');
  });
});
