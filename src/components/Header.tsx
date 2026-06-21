import { useStore } from '../store'
import { ChevronDown, SunIcon, MoonIcon, RefreshIcon } from './icons'
import { useState } from 'react'

export function Header() {
  const { activePortfolio, portfolios, setActivePortfolio, theme, setTheme, refreshPrices, loading } = useStore()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="sticky top-0 z-40 glass safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-[#5ac8fa] flex items-center justify-center text-white font-bold text-sm">D</div>
          <div className="relative">
            <button
              className="flex items-center gap-1 text-[17px] font-semibold active:opacity-60 transition"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {activePortfolio.name}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute left-0 top-full mt-2 z-20 w-48 rounded-2xl bg-white dark:bg-[#2c2c2e] shadow-apple-lg border border-[#00000008] dark:border-[#ffffff0d] overflow-hidden animate-pop">
                  {portfolios.map(p => (
                    <button
                      key={p.id}
                      className={`w-full text-left px-4 py-3 text-[15px] transition hover:bg-[#f2f2f7] dark:hover:bg-[#3a3a3c] ${p.id === activePortfolio.id ? 'font-semibold text-brand' : ''}`}
                      onClick={() => { setActivePortfolio(p.id); setShowDropdown(false) }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshPrices}
            className={`p-2 rounded-full hover:bg-[#f2f2f7] dark:hover:bg-[#2c2c2e] active:scale-90 transition ${loading ? 'animate-spin' : ''}`}
            disabled={loading}
          >
            <RefreshIcon className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
            className="p-2 rounded-full hover:bg-[#f2f2f7] dark:hover:bg-[#2c2c2e] active:scale-90 transition"
          >
            {theme === 'dark' ? <MoonIcon className="w-[18px] h-[18px]" /> : <SunIcon className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>
    </header>
  )
}
