export function* values<T>(obj: Record<string, T>): Generator<T, void, void> {
  for (const key in obj) {
    yield obj[key] as T;
  }
}
