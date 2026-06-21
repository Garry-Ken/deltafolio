const PREFIX = 'deltafolio:'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch { /* quota exceeded — silently ignore */ }
}

export function uid(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
