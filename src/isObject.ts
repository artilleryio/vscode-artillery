export function isObject(value: unknown): value is object {
  return value != null && value.constructor.name === 'Object'
}
