import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { load, save, uid } from './lib/storage'
import type { Portfolio, Holding, PriceCache, Theme } from './types'

interface Store {
  portfolios: Portfolio[]
  activePortfolioId: string
  baseCurrency: string
  theme: Theme
  prices: PriceCache
  rates: Record<string, number>
  loading: boolean

  setTheme: (t: Theme) => void
  setBaseCurrency: (c: string) => void
  setActivePortfolio: (id: string) => void

  addPortfolio: (name: string) => string
  renamePortfolio: (id: string, name: string) => void
  removePortfolio: (id: string) => void

  addHolding: (h: Omit<Holding, 'id' | 'addedAt'>) => void
  updateHolding: (id: string, patch: Partial<Holding>) => void
  removeHolding: (id: string) => void

  refreshPrices: () => Promise<void>
  activePortfolio: Portfolio
}

const Ctx = createContext<Store | null>(null)

const DEFAULT_PORTFOLIO: Portfolio = { id: 'default', name: 'My Portfolio', holdings: [], createdAt: Date.now() }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => load('portfolios', [DEFAULT_PORTFOLIO]))
  const [activePortfolioId, setActivePortfolioId] = useState(() => load('activePortfolioId', 'default'))
  const [baseCurrency, setBaseCurrencyState] = useState(() => load('baseCurrency', 'CNY'))
  const [theme, setThemeState] = useState<Theme>(() => load('theme', 'system'))
  const [prices, setPrices] = useState<PriceCache>({})
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const refreshRef = useRef<(() => Promise<void>) | undefined>(undefined)

  useEffect(() => { save('portfolios', portfolios) }, [portfolios])
  useEffect(() => { save('activePortfolioId', activePortfolioId) }, [activePortfolioId])
  useEffect(() => { save('baseCurrency', baseCurrency) }, [baseCurrency])
  useEffect(() => { save('theme', theme) }, [theme])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else if (theme === 'light') root.classList.remove('dark')
    else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = () => { mq.matches ? root.classList.add('dark') : root.classList.remove('dark') }
      apply()
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) ?? portfolios[0] ?? DEFAULT_PORTFOLIO

  const refreshPrices = useCallback(async () => {
    const holdings = activePortfolio.holdings
    if (holdings.length === 0) return
    setLoading(true)
    try {
      const { fetchPrices, fetchRates } = await import('./lib/api')
      const [priceData, rateData] = await Promise.all([
        fetchPrices(holdings),
        fetchRates(baseCurrency),
      ])
      setPrices(prev => ({ ...prev, ...priceData }))
      setRates(prev => ({ ...prev, ...rateData }))
    } catch { /* silently fail */ }
    setLoading(false)
  }, [activePortfolio.holdings, baseCurrency])

  refreshRef.current = refreshPrices

  useEffect(() => {
    refreshRef.current?.()
    const timer = setInterval(() => refreshRef.current?.(), 60_000)
    return () => clearInterval(timer)
  }, [activePortfolio.id, activePortfolio.holdings.length])

  const setTheme = (t: Theme) => setThemeState(t)
  const setBaseCurrency = (c: string) => setBaseCurrencyState(c)
  const setActivePortfolio = (id: string) => setActivePortfolioId(id)

  const addPortfolio = (name: string) => {
    const id = uid('pf_')
    setPortfolios(ps => [...ps, { id, name, holdings: [], createdAt: Date.now() }])
    setActivePortfolioId(id)
    return id
  }

  const renamePortfolio = (id: string, name: string) => {
    setPortfolios(ps => ps.map(p => p.id === id ? { ...p, name } : p))
  }

  const removePortfolio = (id: string) => {
    setPortfolios(ps => {
      const next = ps.filter(p => p.id !== id)
      if (next.length === 0) next.push({ ...DEFAULT_PORTFOLIO, id: uid('pf_'), createdAt: Date.now() })
      if (activePortfolioId === id) setActivePortfolioId(next[0].id)
      return next
    })
  }

  const addHolding = (h: Omit<Holding, 'id' | 'addedAt'>) => {
    const holding: Holding = { ...h, id: uid('h_'), addedAt: Date.now() }
    setPortfolios(ps => ps.map(p =>
      p.id === activePortfolioId ? { ...p, holdings: [...p.holdings, holding] } : p
    ))
  }

  const updateHolding = (id: string, patch: Partial<Holding>) => {
    setPortfolios(ps => ps.map(p =>
      p.id === activePortfolioId
        ? { ...p, holdings: p.holdings.map(h => h.id === id ? { ...h, ...patch } : h) }
        : p
    ))
  }

  const removeHolding = (id: string) => {
    setPortfolios(ps => ps.map(p =>
      p.id === activePortfolioId
        ? { ...p, holdings: p.holdings.filter(h => h.id !== id) }
        : p
    ))
  }

  const store: Store = {
    portfolios, activePortfolioId, baseCurrency, theme, prices, rates, loading,
    activePortfolio,
    setTheme, setBaseCurrency, setActivePortfolio,
    addPortfolio, renamePortfolio, removePortfolio,
    addHolding, updateHolding, removeHolding,
    refreshPrices,
  }

  return <Ctx value={store}>{children}</Ctx>
}

export function useStore(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
