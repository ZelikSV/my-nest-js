export function isClass(value: any): value is new (...args: any[]) => any {
  return (
    typeof value === 'function' &&
    /^class\s/.test(Function.prototype.toString.call(value))
  );
}

export function isInstance(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    value.constructor !== Object
  );
}
