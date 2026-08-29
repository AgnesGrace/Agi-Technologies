import { describe, expect, it } from 'vitest';
import { dollarsToCents, isPurchasableAmount } from './money.js';
import { mapClerkRole } from './map-clerk-role.js';
import { parsePagination } from './helper.js';

describe('money', () => {
  it('converts dollars to integer cents without float drift', () => {
    expect(dollarsToCents(49.99)).toBe(4999);
    expect(dollarsToCents(29.99)).toBe(2999);
    expect(dollarsToCents(0)).toBe(0);
  });

  it('rejects amounts below Stripe minimum', () => {
    expect(isPurchasableAmount(49)).toBe(false);
    expect(isPurchasableAmount(50)).toBe(true);
    expect(isPurchasableAmount(4999)).toBe(true);
  });
});

describe('mapClerkRole', () => {
  it('maps learner aliases to LEARNER', () => {
    expect(mapClerkRole('learner')).toBe('LEARNER');
    expect(mapClerkRole('student')).toBe('LEARNER');
    expect(mapClerkRole(undefined)).toBe('LEARNER');
  });

  it('maps instructor aliases to INSTRUCTOR', () => {
    expect(mapClerkRole('instructor')).toBe('INSTRUCTOR');
    expect(mapClerkRole('teacher')).toBe('INSTRUCTOR');
  });

  it('maps admin', () => {
    expect(mapClerkRole('admin')).toBe('ADMIN');
  });
});

describe('parsePagination', () => {
  it('defaults and clamps page size', () => {
    expect(parsePagination(undefined, undefined)).toEqual({
      currentPage: 1,
      pageSize: 12,
      skip: 0,
    });

    expect(parsePagination('2', '50')).toEqual({
      currentPage: 2,
      pageSize: 50,
      skip: 50,
    });
  });

  it('rejects invalid pages', () => {
    const result = parsePagination('0', '-1');
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBeGreaterThan(0);
  });
});
