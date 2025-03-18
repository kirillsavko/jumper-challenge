/**
 * Validate if the given value is a string
 * @param value Value that should be validated
 * @return Indicator if the given value is a string
 */
export function isValueString(value: unknown): value is string {
  return typeof value === 'string';
}
