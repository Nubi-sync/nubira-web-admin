'use client'

import { useTvMode } from '@/context/TvModeContext'
import { Tv, Minimize2, RefreshCw, Radio } from 'lucide-react'

export function TvTopBar() {
  const { 
    exitTvMode, 
    currentTime, 
    currentDate, 
    refreshCountdown, 
    triggerManualRefresh 
  } = useTvMode()

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1E1B3A] text-white border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
      
      {/* Left: Live Indicator + Brand Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-emerald-400">
            Live
          </span>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-[#FAF7F0]" />
          <span className="text-xs sm:text-sm font-extrabold font-[family-name:var(--font-heading)] tracking-wider">
            ZIGZA TV VIEW
          </span>
          <span className="hidden md:inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
            Factory Floor Kiosk
          </span>
        </div>
      </div>

      {/* Center: Live Digital Clock */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-xs text-white/70 font-medium">
          {currentDate}
        </span>
        <div className="h-3.5 w-px bg-white/20" />
        <span className="font-mono font-extrabold text-sm sm:text-base text-white tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-white/10 shadow-inner">
          {currentTime || '00:00:00 AM'}
        </span>
      </div>

      {/* Right: Auto-refresh + Exit Button */}
      <div className="flex items-center gap-2.5">
        
        {/* Auto Refresh Badge */}
        <button
          type="button"
          onClick={triggerManualRefresh}
          title="Click to refresh data now"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 text-xs font-mono border border-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 text-emerald-400 animate-[spin_12s_linear_infinite]" />
          <span>Auto-sync in {refreshCountdown}s</span>
        </button>

        {/* Exit TV View Button */}
        <button
          type="button"
          onClick={exitTvMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 shadow-xs"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit TV View</span>
          <span className="hidden lg:inline text-[10px] opacity-60 font-mono font-normal">(Esc)</span>
        </button>
      </div>

    </header>
  )
}
