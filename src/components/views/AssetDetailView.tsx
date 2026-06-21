import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { fetchChart } from '../../lib/api'
import { fmtCurrency, fmtPrice, fmtPercent, toBaseCurrency } from '../../lib/format'
import type { Holding, ChartPoint, ChartRange } from '../../types'
import { PriceLine } from '../charts'
import { AssetClassTag, PnLBadge, BottomSheet, SegmentedControl } from '../bits'
import { ChevronLeft, EditIcon, TrashIcon } from '../icons'

interface Props {
  holding: Holding
  onBack: () => void
}

const RANGES: { value: ChartRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '1M' },
  { value: '1y', label: '1Y' },
]

export function AssetDetailView({ holding, onBack }: Props) {
  const { prices, rates, baseCurrency, updateHolding, removeHolding } = useStore()
  const [range, setRange] = useState<ChartRange>('30d')
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editAmount, setEditAmount] = useState(String(holding.amount))
  const [editCost, setEditCost] = useState(String(holding.costPerUnit))
  const [editNotes, setEditNotes] = useState(holding.notes ?? '')

  const pd = prices[holding.symbol]
  const rawPrice = pd?.price ?? 0
  const priceCurrency = pd?.currency ?? holding.currency
  const currentPrice = toBaseCurrency(rawPrice, priceCurrency, baseCurrency, rates)
  const currentValue = currentPrice * holding.amount
  const pnl = holding.costBasis > 0 ? ((currentValue - holding.costBasis) / holding.costBasis) * 100 : 0
  const pnlAbs = currentValue - holding.costBasis
  const isManual = holding.assetClass === 'realestate' || holding.assetClass === 'custom'

  useEffect(() => {
    if (isManual) return
    let cancelled = false
    setChartLoading(true)
    fetchChart(holding, range).then(data => {
      if (!cancelled) {
        setChartData(data)
        setChartLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [holding, range, isManual])

  const handleSaveEdit = () => {
    const amt = parseFloat(editAmount)
    const cpu = parseFloat(editCost)
    if (amt > 0) {
      updateHolding(holding.id, {
        amount: amt,
        costPerUnit: cpu || 0,
        costBasis: cpu ? cpu * amt : 0,
        notes: editNotes || undefined,
      })
    }
    setShowEdit(false)
  }

  const handleDelete = () => {
    if (confirm('Remove this holding?')) {
      removeHolding(holding.id)
      onBack()
    }
  }

  return (
    <div className="pb-24 animate-pop">
      {/* Nav */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-[#f2f2f7] dark:hover:bg-[#2c2c2e] active:scale-90 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[17px] font-semibold truncate">{holding.name}</h2>
        </div>
        <AssetClassTag cls={holding.assetClass} />
      </div>

      {/* Price Card */}
      <div className="card mx-4 p-5 mb-4">
        <p className="text-[13px] text-[#86868b] font-medium mb-1">
          {isManual ? 'Estimated Value' : `${priceCurrency} ${fmtPrice(rawPrice)}`}
        </p>
        <p className="text-[28px] font-bold tracking-tight">{fmtCurrency(currentValue, baseCurrency)}</p>
        {pd && (
          <div className="flex items-center gap-2 mt-1.5">
            <PnLBadge value={pd.change24h} />
            <span className="text-[13px] text-[#86868b]">24h</span>
          </div>
        )}
      </div>

      {/* Chart */}
      {!isManual && (
        <div className="mx-4 mb-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] text-[#86868b] font-medium">Price Chart</p>
              <SegmentedControl options={RANGES} value={range} onChange={setRange} />
            </div>
            {chartLoading ? (
              <div className="flex items-center justify-center h-[180px]">
                <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              </div>
            ) : (
              <PriceLine data={chartData} height={180} />
            )}
          </div>
        </div>
      )}

      {/* Your Position */}
      <div className="card mx-4 p-5 mb-4">
        <p className="text-[13px] text-[#86868b] font-medium mb-3">Your Position</p>
        <div className="space-y-2.5">
          <Row label="Quantity" value={String(holding.amount)} />
          <Row label="Avg Cost" value={holding.costPerUnit ? `${holding.currency} ${fmtPrice(holding.costPerUnit)}` : '—'} />
          <Row label="Cost Basis" value={holding.costBasis ? fmtCurrency(holding.costBasis, holding.currency) : '—'} />
          <Row label="Current Value" value={fmtCurrency(currentValue, baseCurrency)} />
          <Row label="P&L" value={`${fmtPercent(pnl)} (${pnlAbs >= 0 ? '+' : ''}${fmtCurrency(pnlAbs, baseCurrency)})`} color={pnl >= 0 ? '#30d158' : '#ff3b30'} />
          {holding.notes && <Row label="Notes" value={holding.notes} />}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mx-4">
        <button className="btn-ghost flex-1" onClick={() => setShowEdit(true)}>
          <EditIcon className="w-4 h-4" /> Edit
        </button>
        <button className="btn-ghost flex-1 text-[#ff3b30]" onClick={handleDelete}>
          <TrashIcon className="w-4 h-4" /> Remove
        </button>
      </div>

      {/* Edit Sheet */}
      <BottomSheet open={showEdit} onClose={() => setShowEdit(false)} title="Edit Holding">
        <div className="space-y-4">
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Quantity</label>
            <input className="input-field" type="number" step="any" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Cost per unit</label>
            <input className="input-field" type="number" step="any" value={editCost} onChange={e => setEditCost(e.target.value)} />
          </div>
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Notes</label>
            <input className="input-field" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
          </div>
          <button className="btn-primary w-full" onClick={handleSaveEdit}>Save Changes</button>
        </div>
      </BottomSheet>
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-[#86868b]">{label}</span>
      <span className="text-[14px] font-medium" style={color ? { color } : undefined}>{value}</span>
    </div>
  )
}
