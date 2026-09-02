'use client'

import { useTvMode } from '@/context/TvModeContext'
import { Minimize2, RefreshCw } from 'lucide-react'

export function TvTopBar() {
  const { 
    exitTvMode, 
    currentTime, 
    currentDate, 
    refreshCountdown, 
    triggerManualRefresh 
  } = useTvMode()

  return (
    <header className="sticky top-0 z-50 w-full bg-[#3A3564] text-white border-b border-black/15 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-md animate-in slide-in-from-top-2 duration-200">
      
      {/* Left: TV Display Pill + Live Monitor Beacon */}
      <div className="flex items-center gap-3">
        {/* Brand Pill */}
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
          TV DISPLAY
        </span>

        <div className="h-4 w-px bg-white/20 hidden sm:block" />

        {/* Live Pulse Indicator in Brand Cream */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FAF7F0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FAF7F0]"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FAF7F0] font-mono">
            LIVE MES MONITOR
          </span>
        </div>
      </div>

      {/* Center: Live Digital Clock & Date in Brand Dark Accent */}
      <div className="hidden md:flex items-center gap-3 bg-[#2A2649] border border-white/10 rounded-xl px-4 py-1.5 shadow-inner">
        <span className="text-xs font-semibold text-[#FAF7F0]/85">
          {currentDate}
        </span>
        <div className="h-3.5 w-px bg-white/20" />
        <span className="font-mono font-extrabold text-sm text-[#FAF7F0] tracking-widest">
          {currentTime || '00:00:00 AM'}
        </span>
      </div>

      {/* Right: Auto-Refresh Badge & Exit TV Button */}
      <div className="flex items-center gap-2.5">
        
        {/* Auto Refresh Badge */}
        <button
          type="button"
          onClick={triggerManualRefresh}
          title="Click to refresh data now"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2A2649] hover:bg-[#201D38] text-[#FAF7F0] text-xs font-mono font-bold border border-white/10 transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3 h-3 text-[#FAF7F0] animate-[spin_12s_linear_infinite]" />
          <span>Auto-sync in {refreshCountdown}s</span>
        </button>

        {/* Exit TV View Button in Brand Warm Cream & Deep Indigo */}
        <button
          type="button"
          onClick={exitTvMode}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#3A3564] text-xs font-extrabold transition-all cursor-pointer shadow-2xs border border-black/10 group"
        >
          <Minimize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Exit TV View</span>
          <span className="hidden sm:inline text-[10px] font-mono font-normal opacity-70">(Esc)</span>
        </button>
      </div>

    </header>
  )
}
