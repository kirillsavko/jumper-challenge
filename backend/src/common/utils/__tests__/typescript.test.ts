import { isValueString } from '@/common/utils/typescript';

describe('Typescript util', () => {
  const isValueStringCases: { input: any; result: boolean }[] = [
    { input: 'foo', result: true },
    { input: 1, result: false },
    { input: null, result: false },
    { input: {}, result: false },
    { input: [], result: false },
  ];
  test.each(isValueStringCases)('isValueString - success', ({ input, result }) => {
    expect(isValueString(input)).toBe(result);
  });
});
