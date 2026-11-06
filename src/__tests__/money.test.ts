// Mock i18n before importing money.ts
jest.mock('@/i18n', () => ({
  __esModule: true,
  default: { language: 'en' },
}));

import { parsePaisa, formatPaisa } from '../utils/money';

describe('parsePaisa', () => {
  it('converts integer rupees to paisa', () => {
    expect(parsePaisa('100')).toBe(10000);
  });

  it('converts decimal rupees to paisa', () => {
    expect(parsePaisa('12500.50')).toBe(1250050);
  });

  it('strips commas', () => {
    expect(parsePaisa('12,500')).toBe(1250000);
  });

  it('returns 0 for empty string', () => {
    expect(parsePaisa('')).toBe(0);
  });

  it('returns 0 for zero', () => {
    expect(parsePaisa('0')).toBe(0);
  });

  it('strips non-numeric chars including minus sign', () => {
    // minus is stripped, so -100 becomes 100 → 10000 paisa
    expect(parsePaisa('-100')).toBe(10000);
  });

  it('returns 0 for non-numeric string', () => {
    expect(parsePaisa('abc')).toBe(0);
  });

  it('handles leading/trailing spaces via stripping non-numeric', () => {
    expect(parsePaisa('  500  ')).toBe(50000);
  });

  it('rounds to nearest paisa (floating point aware)', () => {
    // 1.005 * 100 = 100.49999... due to float → Math.round = 100
    expect(parsePaisa('1.005')).toBe(100);
    // 1.50 * 100 = 150 exactly
    expect(parsePaisa('1.50')).toBe(150);
  });
});

describe('formatPaisa (en)', () => {
  it('formats zero', () => {
    expect(formatPaisa(0)).toBe('Rs 0.00');
  });

  it('formats whole rupees', () => {
    expect(formatPaisa(10000)).toBe('Rs 100.00');
  });

  it('formats with decimals', () => {
    expect(formatPaisa(1250050)).toBe('Rs 12,500.50');
  });

  it('formats large amount with thousands separator', () => {
    expect(formatPaisa(10000000)).toBe('Rs 100,000.00');
  });
});

describe('formatPaisa (ur)', () => {
  beforeEach(() => {
    // Switch mock to Urdu
    const i18n = require('@/i18n').default;
    i18n.language = 'ur';
  });

  afterEach(() => {
    const i18n = require('@/i18n').default;
    i18n.language = 'en';
  });

  it('uses Urdu currency label', () => {
    expect(formatPaisa(10000)).toBe('100.00 روپے');
  });

  it('formats large amount in Urdu', () => {
    expect(formatPaisa(1250050)).toBe('12,500.50 روپے');
  });
});
