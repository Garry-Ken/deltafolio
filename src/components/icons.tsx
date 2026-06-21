const s = { width: '1em', height: '1em', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function ChartIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>
}

export function SearchIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
}

export function PlusIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M12 5v14M5 12h14"/></svg>
}

export function SettingsIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

export function ChevronLeft(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M15 18l-6-6 6-6"/></svg>
}

export function ChevronDown(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M6 9l6 6 6-6"/></svg>
}

export function ArrowUpRight(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M7 17L17 7M7 7h10v10"/></svg>
}

export function ArrowDownRight(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M7 7l10 10M17 7v10H7"/></svg>
}

export function RefreshIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
}

export function TrashIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
}

export function EditIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}

export function WalletIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14V12"/><circle cx="18" cy="16" r="1" fill="currentColor" stroke="none"/></svg>
}

export function SunIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
}

export function MoonIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}

export function XIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>
}

export function MarketIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M2 20h20"/><path d="M5 20V9l3-3 4 4 4-8 4 4v14"/></svg>
}

export function ExportIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
}

export function ImportIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" {...s} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
}
