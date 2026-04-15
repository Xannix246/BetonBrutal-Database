export function assignDefined<T extends object>(
  source: Partial<T>,
  target: T = {} as T,
) {
  for (const key in source) {
    const value = source[key];
    if (value !== undefined) {
      target[key] = value;
    }
  }
  return target;
}
