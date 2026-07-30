export function isRequired(value: unknown): boolean {
  return String(value ?? '').trim().length > 0
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

export function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}
