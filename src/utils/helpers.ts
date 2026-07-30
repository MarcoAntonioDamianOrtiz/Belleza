export function createMockId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('es-MX')
}
