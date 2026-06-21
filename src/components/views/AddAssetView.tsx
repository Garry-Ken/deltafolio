import { useState, useRef, useCallback } from 'react'
import { useStore } from '../../store'
import { searchAssets } from '../../lib/api'
import { ASSET_CLASS_META, type SearchResult, type AssetClass } from '../../types'
import { SearchIcon } from '../icons'
import { AssetClassTag, BottomSheet } from '../bits'

const MANUAL_CLASSES: AssetClass[] = ['realestate', 'custom']

export function AddAssetView() {
  const { addHolding, refreshPrices } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualClass, setManualClass] = useState<AssetClass>('realestate')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [amount, setAmount] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')

  const doSearch = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!q.trim()) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      const r = await searchAssets(q)
      setResults(r)
      setSearching(false)
    }, 300)
  }, [])

  const handleQueryChange = (v: string) => {
    setQuery(v)
    doSearch(v)
  }

  const resetForm = () => {
    setAmount('')
    setCostPerUnit('')
    setName('')
    setNotes('')
    setSelected(null)
    setShowManual(false)
  }

  const handleAdd = () => {
    const amt = parseFloat(amount)
    const cpu = parseFloat(costPerUnit)
    if (!amt || amt <= 0) return

    if (selected) {
      addHolding({
        assetClass: selected.assetClass,
        symbol: selected.symbol,
        name: selected.name,
        amount: amt,
        costBasis: cpu ? cpu * amt : 0,
        costPerUnit: cpu || 0,
        currency: selected.assetClass === 'crypto' ? 'USD' : selected.assetClass === 'stock_hk' ? 'HKD' : selected.assetClass === 'stock_cn' ? 'CNY' : 'USD',
        notes: notes || undefined,
      })
    } else if (showManual) {
      addHolding({
        assetClass: manualClass,
        symbol: name.toLowerCase().replace(/\s+/g, '_'),
        name: name || 'Unnamed Asset',
        amount: amt,
        costBasis: cpu ? cpu * amt : 0,
        costPerUnit: cpu || 0,
        currency: 'CNY',
        notes: notes || undefined,
      })
    }

    resetForm()
    setQuery('')
    setResults([])
    refreshPrices()
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = ASSET_CLASS_META[r.assetClass].label
    ;(acc[key] ??= []).push(r)
    return acc
  }, {})

  return (
    <div className="px-4 pb-24 animate-pop">
      {/* Search */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#86868b]" />
        <input
          className="input-field pl-10"
          placeholder="Search stocks, crypto, ETFs..."
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          autoFocus
        />
        {searching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-4 mb-6">
          {Object.entries(grouped).map(([label, items]) => (
            <div key={label}>
              <p className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5 px-1">{label}</p>
              <div className="card overflow-hidden divide-y divide-[#00000008] dark:divide-[#ffffff0d]">
                {items.map((r, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#f2f2f7]/50 dark:hover:bg-[#2c2c2e]/50 transition"
                    onClick={() => setSelected(r)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium truncate">{r.name}</p>
                      <p className="text-[13px] text-[#86868b]">{r.symbol}{r.exchange ? ` · ${r.exchange}` : ''}</p>
                    </div>
                    <AssetClassTag cls={r.assetClass} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty search state */}
      {query && !searching && results.length === 0 && (
        <p className="text-center text-[14px] text-[#86868b] py-8">No results found for "{query}"</p>
      )}

      {/* Manual entry button */}
      <button
        className="btn-ghost w-full"
        onClick={() => setShowManual(true)}
      >
        + Add manually (real estate, custom asset)
      </button>

      {/* Add Sheet (from search) */}
      <BottomSheet open={!!selected} onClose={resetForm} title={`Add ${selected?.name ?? ''}`}>
        <div className="space-y-4">
          {selected && <AssetClassTag cls={selected.assetClass} />}
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Quantity</label>
            <input className="input-field" type="number" step="any" placeholder="e.g. 100" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Cost per unit</label>
            <input className="input-field" type="number" step="any" placeholder="e.g. 150.00" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value)} />
          </div>
          {amount && costPerUnit && (
            <p className="text-[14px] text-[#86868b]">
              Total cost: <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{(parseFloat(amount) * parseFloat(costPerUnit)).toLocaleString()}</span>
            </p>
          )}
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Notes (optional)</label>
            <input className="input-field" placeholder="e.g. Long-term hold" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button className="btn-primary w-full mt-2" onClick={handleAdd} disabled={!amount || parseFloat(amount) <= 0}>
            Add to Portfolio
          </button>
        </div>
      </BottomSheet>

      {/* Manual entry sheet */}
      <BottomSheet open={showManual} onClose={resetForm} title="Add Custom Asset">
        <div className="space-y-4">
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Asset Type</label>
            <div className="seg w-fit">
              {MANUAL_CLASSES.map(cls => (
                <button
                  key={cls}
                  className={`seg-item ${manualClass === cls ? 'seg-item-active' : ''}`}
                  onClick={() => setManualClass(cls)}
                >
                  {ASSET_CLASS_META[cls].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Name</label>
            <input className="input-field" placeholder="e.g. Beijing Apartment" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Quantity</label>
            <input className="input-field" type="number" step="any" placeholder="e.g. 1" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Value per unit (CNY)</label>
            <input className="input-field" type="number" step="any" placeholder="e.g. 5000000" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value)} />
          </div>
          <div>
            <label className="text-[13px] text-[#86868b] font-medium mb-1 block">Notes (optional)</label>
            <input className="input-field" placeholder="e.g. Purchased 2020" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button className="btn-primary w-full mt-2" onClick={handleAdd} disabled={!amount || !name}>
            Add to Portfolio
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
