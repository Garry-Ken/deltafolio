import { useStore } from '../../store'
import { fmtCurrency, fmtPercent, fmtPrice, toBaseCurrency } from '../../lib/format'
import { ASSET_CLASS_META, type Holding, type AssetClass } from '../../types'
import { Donut, Sparkline } from '../charts'
import { AssetClassTag, PnLBadge, EmptyState } from '../bits'
import { WalletIcon } from '../icons'

interface Props {
  onSelectHolding: (h: Holding) => void
}

export function DashboardView({ onSelectHolding }: Props) {
  const { activePortfolio, prices, rates, baseCurrency } = useStore()
  const holdings = activePortfolio.holdings

  const holdingsWithValue = holdings.map(h => {
    const pd = prices[h.symbol]
    const rawPrice = pd?.price ?? 0
    const priceCurrency = pd?.currency ?? h.currency
    const currentPrice = toBaseCurrency(rawPrice, priceCurrency, baseCurrency, rates)
    const currentValue = currentPrice * h.amount
    const costInBase = h.costBasis
    const pnl = costInBase > 0 ? ((currentValue - costInBase) / costInBase) * 100 : 0
    const change24h = pd?.change24h ?? 0
    return { ...h, currentPrice, currentValue, pnl, change24h, rawPrice, priceCurrency }
  }).sort((a, b) => b.currentValue - a.currentValue)

  const totalValue = holdingsWithValue.reduce((s, h) => s + h.currentValue, 0)
  const totalCost = holdingsWithValue.reduce((s, h) => s + h.costBasis, 0)
  const totalPnl = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
  const totalPnlAbs = totalValue - totalCost

  const segmentsByClass = Object.entries(
    holdingsWithValue.reduce<Record<AssetClass, number>>((acc, h) => {
      acc[h.assetClass] = (acc[h.assetClass] ?? 0) + h.currentValue
      return acc
    }, {} as Record<AssetClass, number>)
  )
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cls, value]) => ({
      value,
      color: ASSET_CLASS_META[cls as AssetClass].color,
      label: ASSET_CLASS_META[cls as AssetClass].label,
    }))

  if (holdings.length === 0) {
    return (
      <EmptyState
        icon={<WalletIcon className="w-12 h-12" />}
        title="No holdings yet"
        description="Tap the + button to add your first asset and start tracking your portfolio."
      />
    )
  }

  return (
    <div className="px-4 pb-24 space-y-5 animate-pop">
      {/* Total Value Card */}
      <div className="card p-5">
        <p className="text-[13px] text-[#86868b] font-medium mb-1">Total Portfolio Value</p>
        <p className="text-[32px] font-bold tracking-tight leading-tight">{fmtCurrency(totalValue, baseCurrency)}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <PnLBadge value={totalPnl} />
          <span className={`text-[13px] font-medium ${totalPnlAbs >= 0 ? 'text-[#30d158]' : 'text-[#ff3b30]'}`}>
            {totalPnlAbs >= 0 ? '+' : ''}{fmtCurrency(totalPnlAbs, baseCurrency)}
          </span>
        </div>
      </div>

      {/* Allocation + Legend */}
      {segmentsByClass.length > 1 && (
        <div className="card p-5">
          <p className="text-[13px] text-[#86868b] font-medium mb-3">Asset Allocation</p>
          <div className="flex items-center gap-6">
            <Donut segments={segmentsByClass} size={120} />
            <div className="flex-1 space-y-1.5">
              {segmentsByClass.map(seg => (
                <div key={seg.label} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                    <span>{seg.label}</span>
                  </div>
                  <span className="font-medium">{((seg.value / totalValue) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Holdings List */}
      <div>
        <p className="text-[13px] text-[#86868b] font-medium mb-2 px-1">Holdings ({holdings.length})</p>
        <div className="space-y-2">
          {holdingsWithValue.map(h => (
            <button
              key={h.id}
              className="card w-full text-left p-4 flex items-center gap-3 active:scale-[0.98] transition"
              onClick={() => onSelectHolding(h)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[15px] font-semibold truncate">{h.name}</span>
                  <AssetClassTag cls={h.assetClass} />
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#86868b]">
                  <span>{h.amount} × {h.priceCurrency} {fmtPrice(h.rawPrice)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <Sparkline points={[h.currentValue * 0.97, h.currentValue * 0.99, h.currentValue * 0.98, h.currentValue * 1.01, h.currentValue]} width={48} height={20} />
                <span className="text-[15px] font-semibold">{fmtCurrency(h.currentValue, baseCurrency)}</span>
                <span className={`text-[12px] font-medium ${h.pnl >= 0 ? 'text-[#30d158]' : 'text-[#ff3b30]'}`}>
                  {fmtPercent(h.pnl)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
