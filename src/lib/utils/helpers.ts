/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format number to fixed decimal places
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals)
}

/**
 * Clamp value between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

/**
 * Parse age input with support for human-readable formats
 * Examples: "4.5b", "4.5B", "4.5 billion", "500m", "500 million", "4.5B years", etc.
 * Returns years as a number
 */
export function parseAgeInput(input: string | number): number {
  if (typeof input === 'number') return Math.max(0, input)

  let str = input.toString().trim().toLowerCase()

  if (!str) return 0

  // Remove "years" suffix if present
  str = str.replace(/\s*years?\s*$/, '').trim()

  if (!str) return 0

  // Match pattern: number (with optional decimal) followed by optional unit
  const match = str.match(/^([\d.]+)\s*([a-z]*)$/)

  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].trim()

  if (isNaN(value)) return 0

  const multipliers: { [key: string]: number } = {
    'k': 1000,
    'thousand': 1000,
    'm': 1000000,
    'million': 1000000,
    'b': 1000000000,
    'billion': 1000000000,
    'g': 1000000000000,
    'trillion': 1000000000000
  }

  const multiplier = multipliers[unit] || 1

  return Math.max(0, value * multiplier)
}
