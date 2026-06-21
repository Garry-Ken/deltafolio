import { useState, useRef } from 'react'
import { useStore } from '../../store'
import type { Theme } from '../../types'
import { SegmentedControl, BottomSheet } from '../bits'
import { EditIcon, TrashIcon, ExportIcon, ImportIcon, PlusIcon } from '../icons'

const CURRENCIES = [
  { value: 'CNY', label: '¥ CNY' },
  { value: 'USD', label: '$ USD' },
  { value: 'HKD', label: 'HK$ HKD' },
]

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
]

export function SettingsView() {
  const store = useStore()
  const { baseCurrency, setBaseCurrency, theme, setTheme, portfolios, addPortfolio, renamePortfolio, removePortfolio } = store
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renamingValue, setRenamingValue] = useState('')
  const [showNewPortfolio, setShowNewPortfolio] = useState(false)
  const [newName, setNewName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = JSON.stringify({ portfolios: store.portfolios, baseCurrency: store.baseCurrency }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deltafolio-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.portfolios && Array.isArray(data.portfolios)) {
          localStorage.setItem('deltafolio:portfolios', JSON.stringify(data.portfolios))
          if (data.baseCurrency) localStorage.setItem('deltafolio:baseCurrency', JSON.stringify(data.baseCurrency))
          window.location.reload()
        }
      } catch { alert('Invalid backup file') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleRename = (id: string) => {
    if (renamingValue.trim()) {
      renamePortfolio(id, renamingValue.trim())
    }
    setRenamingId(null)
  }

  const handleCreatePortfolio = () => {
    if (newName.trim()) {
      addPortfolio(newName.trim())
      setNewName('')
      setShowNewPortfolio(false)
    }
  }

  return (
    <div className="px-4 pb-24 space-y-6 animate-pop">
      {/* Appearance */}
      <Section title="Appearance">
        <div className="card p-4">
          <label className="text-[13px] text-[#86868b] font-medium mb-2 block">Theme</label>
          <SegmentedControl options={THEMES} value={theme} onChange={setTheme} />
        </div>
      </Section>

      {/* Currency */}
      <Section title="Base Currency">
        <div className="card overflow-hidden divide-y divide-[#00000008] dark:divide-[#ffffff0d]">
          {CURRENCIES.map(c => (
            <button
              key={c.value}
              className={`w-full text-left px-4 py-3 text-[15px] flex items-center justify-between transition hover:bg-[#f2f2f7]/50 dark:hover:bg-[#2c2c2e]/50 ${baseCurrency === c.value ? 'font-semibold text-brand' : ''}`}
              onClick={() => setBaseCurrency(c.value)}
            >
              {c.label}
              {baseCurrency === c.value && <span className="text-brand">✓</span>}
            </button>
          ))}
        </div>
      </Section>

      {/* Portfolios */}
      <Section title="Portfolios">
        <div className="card overflow-hidden divide-y divide-[#00000008] dark:divide-[#ffffff0d]">
          {portfolios.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              {renamingId === p.id ? (
                <input
                  className="input-field flex-1 py-1.5"
                  value={renamingValue}
                  onChange={e => setRenamingValue(e.target.value)}
                  onBlur={() => handleRename(p.id)}
                  onKeyDown={e => e.key === 'Enter' && handleRename(p.id)}
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-[15px]">{p.name}</span>
              )}
              <span className="text-[13px] text-[#86868b]">{p.holdings.length} assets</span>
              <button
                className="p-1.5 rounded-full hover:bg-[#f2f2f7] dark:hover:bg-[#3a3a3c] transition"
                onClick={() => { setRenamingId(p.id); setRenamingValue(p.name) }}
              >
                <EditIcon className="w-3.5 h-3.5 opacity-50" />
              </button>
              {portfolios.length > 1 && (
                <button
                  className="p-1.5 rounded-full hover:bg-[#ff3b30]/10 transition"
                  onClick={() => confirm(`Delete "${p.name}"?`) && removePortfolio(p.id)}
                >
                  <TrashIcon className="w-3.5 h-3.5 text-[#ff3b30] opacity-60" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="btn-ghost w-full mt-2" onClick={() => setShowNewPortfolio(true)}>
          <PlusIcon className="w-4 h-4" /> New Portfolio
        </button>
      </Section>

      {/* Data */}
      <Section title="Data">
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={handleExport}>
            <ExportIcon className="w-4 h-4" /> Export
          </button>
          <button className="btn-ghost flex-1" onClick={() => fileRef.current?.click()}>
            <ImportIcon className="w-4 h-4" /> Import
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="card p-4 text-center">
          <p className="text-[15px] font-semibold">DeltaFolio</p>
          <p className="text-[13px] text-[#86868b] mt-1">v0.1.0 · All-in-one portfolio tracker</p>
        </div>
      </Section>

      {/* New Portfolio Sheet */}
      <BottomSheet open={showNewPortfolio} onClose={() => setShowNewPortfolio(false)} title="New Portfolio">
        <div className="space-y-4">
          <input
            className="input-field"
            placeholder="Portfolio name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreatePortfolio()}
            autoFocus
          />
          <button className="btn-primary w-full" onClick={handleCreatePortfolio} disabled={!newName.trim()}>
            Create
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] text-[#86868b] font-medium mb-2 px-1">{title}</p>
      {children}
    </div>
  )
}
