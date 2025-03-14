import { describe, expect, it } from 'vitest';

import { commonValidations } from '@/common/utils/commonValidation';

describe('commonValidations', () => {
  it('Transforms a valid numeric string into a number', () => {
    expect(commonValidations.id.parse('123')).toBe(123);
    expect(commonValidations.id.parse('42')).toBe(42);
  });

  it('Fails if input is not a number', () => {
    expect(() => commonValidations.id.parse('abc')).toThrowError('ID must be a numeric value');
    expect(() => commonValidations.id.parse('123abc')).toThrowError('ID must be a numeric value');
  });

  it('Fails if number is zero or negative', () => {
    expect(() => commonValidations.id.parse('-1')).toThrowError('ID must be a positive number');
    expect(() => commonValidations.id.parse('0')).toThrowError('ID must be a positive number');
  });
});
