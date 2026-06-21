import { useState } from 'react'
import { StoreProvider } from './store'
import type { Tab, Holding } from './types'
import { Header } from './components/Header'
import { DashboardView } from './components/views/DashboardView'
import { AddAssetView } from './components/views/AddAssetView'
import { AssetDetailView } from './components/views/AssetDetailView'
import { SettingsView } from './components/views/SettingsView'
import { MarketView } from './components/views/MarketView'
import { ChartIcon, MarketIcon, PlusIcon, SettingsIcon } from './components/icons'

function Shell() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)

  if (selectedHolding) {
    return (
      <AssetDetailView
        holding={selectedHolding}
        onBack={() => setSelectedHolding(null)}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto no-scrollbar pt-2">
        {tab === 'dashboard' && <DashboardView onSelectHolding={setSelectedHolding} />}
        {tab === 'market' && <MarketView />}
        {tab === 'add' && <AddAssetView />}
        {tab === 'settings' && <SettingsView />}
      </main>
      <nav className="sticky bottom-0 glass safe-bottom border-t border-[#00000010] dark:border-[#ffffff0d]">
        <div className="flex items-center justify-around py-2">
          <TabButton icon={<ChartIcon className="w-5 h-5" />} label="Portfolio" active={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
          <TabButton icon={<MarketIcon className="w-5 h-5" />} label="Market" active={tab === 'market'} onClick={() => setTab('market')} />
          <TabButton icon={<PlusIcon className="w-5 h-5" />} label="Add" active={tab === 'add'} onClick={() => setTab('add')} />
          <TabButton icon={<SettingsIcon className="w-5 h-5" />} label="Settings" active={tab === 'settings'} onClick={() => setTab('settings')} />
        </div>
      </nav>
    </div>
  )
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`flex flex-col items-center gap-0.5 px-5 py-1 transition-all active:scale-90 ${active ? 'text-brand' : 'text-[#86868b]'}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
