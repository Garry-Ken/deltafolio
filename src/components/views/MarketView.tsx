import { useState, useEffect } from 'react'
import { fetchMarketCoins } from '../../lib/api'
import type { MarketCoin } from '../../types'
import { fmtPercent, fmtCompact } from '../../lib/format'
import { Sparkline } from '../charts'
import { BottomSheet } from '../bits'
import { useStore } from '../../store'

export function MarketView() {
  const { addHolding, refreshPrices, activePortfolio } = useStore()
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MarketCoin | null>(null)
  const [amount, setAmount] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchMarketCoins(1, 100).then(data => {
      setCoins(data)
      setLoading(false)
    })
  }, [])

  const heldSymbols = new Set(activePortfolio.holdings.filter(h => h.assetClass === 'crypto').map(h => h.symbol))

  const handleAdd = () => {
    if (!selected) return
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    const cpu = parseFloat(costPerUnit) || selected.current_price
    addHolding({
      assetClass: 'crypto',
      symbol: selected.id,
      name: `${selected.name} (${selected.symbol.toUpperCase()})`,
      amount: amt,
      costBasis: cpu * amt,
      costPerUnit: cpu,
      currency: 'USD',
    })
    setSelected(null)
    setAmount('')
    setCostPerUnit('')
    refreshPrices()
  }

  return (
    <div className="px-4 pb-24 animate-pop">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[20px] font-bold">Market</h2>
        <span className="text-[13px] text-[#86868b]">Top 100 by Market Cap</span>
      </div>

      {/* Table Header */}
      <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">
        <span className="w-7 text-center">#</span>
        <span className="flex-1">Name</span>
        <span className="w-20 text-right">Price</span>
        <span className="w-16 text-right">24h</span>
        <span className="w-16 text-right hidden sm:block">7d</span>
        <span className="w-16 text-right hidden sm:block">MCap</span>
        <span className="w-[52px]" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-0.5">
          {coins.map(coin => {
            const held = heldSymbols.has(coin.id)
            return (
              <button
                key={coin.id}
                className="card w-full text-left px-3 py-2.5 flex items-center gap-2 active:scale-[0.99] transition"
                onClick={() => { setSelected(coin); setCostPerUnit(String(coin.current_price)) }}
              >
                <span className="w-7 text-center text-[12px] text-[#86868b] font-medium">{coin.market_cap_rank}</span>
                <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-semibold truncate">{coin.name}</span>
                    <span className="text-[11px] text-[#86868b] uppercase">{coin.symbol}</span>
                    {held && <span className="w-1.5 h-1.5 rounded-full bg-brand" title="In portfolio" />}
                  </div>
                </div>
                <span className="w-20 text-right text-[14px] font-medium tabular-nums">
                  ${coin.current_price >= 1 ? coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.current_price.toFixed(6)}
                </span>
                <span className={`w-16 text-right text-[13px] font-medium tabular-nums ${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-[#30d158]' : 'text-[#ff3b30]'}`}>
                  {fmtPercent(coin.price_change_percentage_24h ?? 0)}
                </span>
                <span className={`w-16 text-right text-[13px] font-medium tabular-nums hidden sm:block ${(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'text-[#30d158]' : 'text-[#ff3b30]'}`}>
                  {fmtPercent(coin.price_change_percentage_7d_in_currency ?? 0)}
                </span>
                <span className="w-16 text-right text-[12px] text-[#86868b] hidden sm:block">${fmtCompact(coin.market_cap)}</span>
                <div className="w-[52px] flex justify-end">
                  {coin.sparkline_in_7d?.price && (
                    <Sparkline
                      points={coin.sparkline_in_7d.price.filter((_, i) => i % 4 === 0)}
                      width={48} height={20}
                      color={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? '#30d158' : '#ff3b30'}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Quick Add Sheet */}
      <BottomSheet open={!!selected} onClose={() => { setSelected(null); setAmount(''); setCostPerUnit('') }} title={`Add ${selected?.name ?? ''}`}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={selected.image} alt="" className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-[16px] font-semibold">{selected.name}</p>
                <p className="text-[13px] text-[#86868b]">${selected.current_price.toLocaleString()} · Rank #{selected.market_cap_rank}</p>
              </div>
            </div>
            <div>
              <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Quantity</label>
              <input className="input-field" type="number" step="any" placeholder="e.g. 0.5" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Cost per unit (USD)</label>
              <input className="input-field" type="number" step="any" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value)} />
            </div>
            {amount && costPerUnit && (
              <p className="text-[14px] text-[#86868b]">
                Total cost: <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">${(parseFloat(amount) * parseFloat(costPerUnit)).toLocaleString()}</span>
              </p>
            )}
            <button className="btn-primary w-full" onClick={handleAdd} disabled={!amount || parseFloat(amount) <= 0}>
              Add to Portfolio
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
