import { type ReactNode } from 'react'
import { ASSET_CLASS_META, type AssetClass } from '../types'
import { fmtPercent } from '../lib/format'
import { XIcon } from './icons'

export function AssetClassTag({ cls }: { cls: AssetClass }) {
  const meta = ASSET_CLASS_META[cls]
  return (
    <span
      className="pill text-[11px] font-semibold"
      style={{ background: meta.color + '18', color: meta.color }}
    >
      {meta.tag}
    </span>
  )
}

export function PnLBadge({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span className={`pill text-[12px] font-semibold ${up ? 'bg-[#30d158]/10 text-[#30d158]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'}`}>
      {fmtPercent(value)}
    </span>
  )
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-[48px] opacity-60">{icon}</div>
      <h3 className="text-[17px] font-semibold">{title}</h3>
      <p className="text-[14px] text-[#86868b] max-w-[280px]">{description}</p>
    </div>
  )
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 animate-fade" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-t-3xl animate-slide-up safe-bottom max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-5 pt-5 pb-3 bg-white dark:bg-[#1c1c1e] z-10">
          <h3 className="text-[17px] font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-[#f2f2f7] dark:bg-[#3a3a3c] active:scale-90 transition">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export function SegmentedControl<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="seg">
      {options.map(o => (
        <button
          key={o.value}
          className={`seg-item ${value === o.value ? 'seg-item-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
