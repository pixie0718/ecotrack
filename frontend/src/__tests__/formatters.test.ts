import { describe, it, expect } from 'vitest';
import {
  formatCO2,
  formatCO2Short,
  formatTreeEquivalent,
  formatPercentage,
} from '@/utils/formatters';

describe('formatCO2', () => {
  it('formats kg values with 2 decimal places', () => {
    expect(formatCO2(1.5)).toBe('1.50 kg');
    expect(formatCO2(0)).toBe('0.00 kg');
    expect(formatCO2(999.99)).toBe('999.99 kg');
  });

  it('converts to tonnes when >= 1000 kg', () => {
    expect(formatCO2(1000)).toBe('1.00 t');
    expect(formatCO2(2500)).toBe('2.50 t');
  });

  it('respects custom precision', () => {
    expect(formatCO2(1.567, 1)).toBe('1.6 kg');
    expect(formatCO2(1500, 1)).toBe('1.5 t');
  });
});

describe('formatCO2Short', () => {
  it('formats values below 100 with 1 decimal', () => {
    expect(formatCO2Short(5.5)).toBe('5.5kg');
    expect(formatCO2Short(0.1)).toBe('0.1kg');
  });

  it('rounds values >= 100', () => {
    expect(formatCO2Short(123.4)).toBe('123kg');
    expect(formatCO2Short(999)).toBe('999kg');
  });

  it('uses t suffix for >= 1000', () => {
    expect(formatCO2Short(1500)).toBe('1.5t');
    expect(formatCO2Short(10000)).toBe('10.0t');
  });
});

describe('formatTreeEquivalent', () => {
  it('returns "<0.1 trees" for very small values', () => {
    expect(formatTreeEquivalent(0.05)).toBe('<0.1 trees');
    expect(formatTreeEquivalent(0)).toBe('<0.1 trees');
  });

  it('formats normal tree counts with 1 decimal', () => {
    expect(formatTreeEquivalent(2.5)).toBe('2.5 trees');
    expect(formatTreeEquivalent(10)).toBe('10.0 trees');
  });

  it('uses k suffix for >= 1000', () => {
    expect(formatTreeEquivalent(1500)).toBe('1.5k trees');
  });
});

describe('formatPercentage', () => {
  it('formats without sign by default', () => {
    expect(formatPercentage(15.5)).toBe('15.5%');
    expect(formatPercentage(-10)).toBe('-10%');
  });

  it('adds plus sign when includeSign is true and value is positive', () => {
    expect(formatPercentage(15.5, true)).toBe('+15.5%');
  });

  it('does not add plus sign for negative values', () => {
    expect(formatPercentage(-10, true)).toBe('-10%');
  });

  it('rounds to 1 decimal place', () => {
    expect(formatPercentage(15.55)).toBe('15.6%');
  });
});
