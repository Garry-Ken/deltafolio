import type { Holding, PriceCache, SearchResult, ChartPoint, AssetClass, MarketCoin } from '../types'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function classifyYahooSymbol(symbol: string, exchange?: string): AssetClass {
  if (symbol.endsWith('.HK')) return 'stock_hk'
  if (symbol.endsWith('.SS') || symbol.endsWith('.SZ')) return 'stock_cn'
  if (symbol.includes('=F')) return 'gold'
  if (symbol.includes('=X')) return 'forex'
  if (exchange && /ETF|fund/i.test(exchange)) return 'fund'
  return 'stock_us'
}

// ── CoinGecko ──

export async function searchCrypto(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.coins ?? []).slice(0, 10).map((c: { id: string; name: string; symbol: string }) => ({
      assetClass: 'crypto' as const,
      symbol: c.id,
      name: `${c.name} (${c.symbol.toUpperCase()})`,
      exchange: 'Crypto',
    }))
  } catch { return [] }
}

async function getCryptoPrices(ids: string[]): Promise<PriceCache> {
  if (ids.length === 0) return {}
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&sparkline=false`
    )
    if (!res.ok) return {}
    const data = await res.json()
    const cache: PriceCache = {}
    for (const coin of data) {
      cache[coin.id] = {
        price: coin.current_price ?? 0,
        change24h: coin.price_change_percentage_24h ?? 0,
        currency: 'USD',
        updatedAt: Date.now(),
      }
    }
    return cache
  } catch { return {} }
}

export async function getCryptoChart(id: string, days: number): Promise<ChartPoint[]> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.prices ?? []).map(([t, p]: [number, number]) => ({ timestamp: t, price: p }))
  } catch { return [] }
}

// ── Yahoo Finance (via Vite proxy) ──

export async function searchYahoo(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`/yf/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.quotes ?? [])
      .filter((q: { quoteType?: string }) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'MUTUALFUND' || q.quoteType === 'FUTURE' || q.quoteType === 'CURRENCY')
      .map((q: { symbol: string; shortname?: string; longname?: string; exchange?: string; quoteType?: string }) => ({
        assetClass: classifyYahooSymbol(q.symbol, q.quoteType),
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
      }))
  } catch { return [] }
}

async function getYahooPrice(symbol: string): Promise<PriceCache> {
  try {
    const res = await fetch(`/yf/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`)
    if (!res.ok) return {}
    const data = await res.json()
    const result = data.chart?.result?.[0]
    if (!result) return {}
    const meta = result.meta
    const price = meta.regularMarketPrice ?? 0
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price
    const change24h = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0
    return {
      [symbol]: {
        price,
        change24h,
        currency: meta.currency ?? 'USD',
        updatedAt: Date.now(),
      },
    }
  } catch { return {} }
}

export async function getYahooChart(symbol: string, range: string): Promise<ChartPoint[]> {
  const intervalMap: Record<string, string> = { '7d': '1h', '30d': '1d', '1y': '1wk' }
  const rangeMap: Record<string, string> = { '7d': '7d', '30d': '1mo', '1y': '1y' }
  try {
    const res = await fetch(
      `/yf/v8/finance/chart/${encodeURIComponent(symbol)}?range=${rangeMap[range] ?? '1mo'}&interval=${intervalMap[range] ?? '1d'}`
    )
    if (!res.ok) return []
    const data = await res.json()
    const result = data.chart?.result?.[0]
    if (!result) return []
    const timestamps: number[] = result.timestamp ?? []
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? []
    return timestamps.map((t, i) => ({ timestamp: t * 1000, price: closes[i] ?? 0 })).filter(p => p.price > 0)
  } catch { return [] }
}

// ── Unified API ──

export async function searchAssets(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const [crypto, yahoo] = await Promise.all([searchCrypto(query), searchYahoo(query)])
  return [...crypto, ...yahoo]
}

export async function fetchPrices(holdings: Holding[]): Promise<PriceCache> {
  const cryptoIds = holdings.filter(h => h.assetClass === 'crypto').map(h => h.symbol)
  const yahooSymbols = holdings.filter(h => h.assetClass !== 'crypto' && h.assetClass !== 'realestate' && h.assetClass !== 'custom').map(h => h.symbol)

  const cache: PriceCache = {}

  if (cryptoIds.length > 0) {
    const cryptoPrices = await getCryptoPrices(cryptoIds)
    Object.assign(cache, cryptoPrices)
  }

  for (const symbol of yahooSymbols) {
    const price = await getYahooPrice(symbol)
    Object.assign(cache, price)
    if (yahooSymbols.length > 1) await sleep(300)
  }

  return cache
}

export async function fetchRates(baseCurrency: string): Promise<Record<string, number>> {
  if (baseCurrency === 'USD') return {}
  const pairs = baseCurrency === 'CNY'
    ? ['USDCNY=X', 'HKDCNY=X', 'EURCNY=X', 'GBPCNY=X', 'JPYCNY=X']
    : [`USD${baseCurrency}=X`]

  const rates: Record<string, number> = {}
  for (const pair of pairs) {
    try {
      const res = await fetch(`/yf/v8/finance/chart/${encodeURIComponent(pair)}?interval=1d&range=1d`)
      if (!res.ok) continue
      const data = await res.json()
      const price = data.chart?.result?.[0]?.meta?.regularMarketPrice
      if (price) {
        const from = pair.replace('=X', '').slice(0, 3)
        const to = pair.replace('=X', '').slice(3)
        rates[`${from}${to}`] = price
      }
    } catch { /* skip */ }
    await sleep(200)
  }
  return rates
}

export async function fetchChart(holding: Holding, range: string): Promise<ChartPoint[]> {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 365
  if (holding.assetClass === 'crypto') return getCryptoChart(holding.symbol, days)
  return getYahooChart(holding.symbol, range)
}

// ── Market Data ──

export async function fetchMarketCoins(page = 1, perPage = 50): Promise<MarketCoin[]> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`
    )
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}
