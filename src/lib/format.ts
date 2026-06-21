const CURRENCY_SYMBOLS: Record<string, string> = {
  CNY: '¥', USD: '$', HKD: 'HK$', EUR: '€', GBP: '£', JPY: '¥',
}

export function fmtCurrency(value: number, currency = 'CNY'): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' '
  const abs = Math.abs(value)
  let str: string
  if (abs >= 1e8) str = (value / 1e8).toFixed(2) + '亿'
  else if (abs >= 1e4) str = (value / 1e4).toFixed(2) + '万'
  else str = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return sym + str
}

export function fmtPrice(value: number): string {
  if (value >= 1) return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (value >= 0.01) return value.toFixed(4)
  return value.toFixed(6)
}

export function fmtPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return sign + value.toFixed(2) + '%'
}

export function fmtCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1e9) return (value / 1e9).toFixed(1) + 'B'
  if (abs >= 1e6) return (value / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return (value / 1e3).toFixed(1) + 'K'
  return value.toFixed(0)
}

export function fmtAgo(timestamp: number): string {
  const diff = (Date.now() - timestamp) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

export function toBaseCurrency(
  price: number,
  from: string,
  baseCurrency: string,
  rates: Record<string, number>,
): number {
  if (from === baseCurrency) return price
  const key = `${from}${baseCurrency}`
  const rate = rates[key]
  if (rate) return price * rate
  const reverseKey = `${baseCurrency}${from}`
  const reverseRate = rates[reverseKey]
  if (reverseRate) return price / reverseRate
  return price
}
