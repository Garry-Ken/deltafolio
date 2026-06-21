export type AssetClass = 'crypto' | 'stock_us' | 'stock_hk' | 'stock_cn' | 'gold' | 'fund' | 'forex' | 'realestate' | 'custom'

export interface Holding {
  id: string
  assetClass: AssetClass
  symbol: string
  name: string
  amount: number
  costBasis: number
  costPerUnit: number
  currency: string
  addedAt: number
  notes?: string
}

export interface Portfolio {
  id: string
  name: string
  holdings: Holding[]
  createdAt: number
}

export interface PriceData {
  price: number
  change24h: number
  currency: string
  updatedAt: number
}

export type PriceCache = Record<string, PriceData>

export interface SearchResult {
  assetClass: AssetClass
  symbol: string
  name: string
  exchange?: string
}

export interface ChartPoint {
  timestamp: number
  price: number
}

export type Theme = 'light' | 'dark' | 'system'
export type Tab = 'dashboard' | 'market' | 'add' | 'settings'

export interface MarketCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  total_volume: number
  sparkline_in_7d?: { price: number[] }
}
export type ChartRange = '7d' | '30d' | '1y'

export const ASSET_CLASS_META: Record<AssetClass, { label: string; tag: string; color: string }> = {
  crypto:     { label: 'Crypto',      tag: 'Crypto',  color: '#f7931a' },
  stock_us:   { label: 'US Stock',    tag: 'US',      color: '#0a84ff' },
  stock_hk:   { label: 'HK Stock',    tag: 'HK',      color: '#ff375f' },
  stock_cn:   { label: 'A-Share',     tag: 'CN',      color: '#ff3b30' },
  gold:       { label: 'Gold',        tag: 'Gold',    color: '#ffd60a' },
  fund:       { label: 'Fund / ETF',  tag: 'Fund',    color: '#30d158' },
  forex:      { label: 'Forex',       tag: 'FX',      color: '#5ac8fa' },
  realestate: { label: 'Real Estate', tag: 'RE',      color: '#af52de' },
  custom:     { label: 'Custom',      tag: 'Custom',  color: '#86868b' },
}
