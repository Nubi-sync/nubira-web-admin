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
    <header className="sticky top-0 z-50 w-full bg-white text-slate-800 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xs animate-in slide-in-from-top-2 duration-200">
      
      {/* Left: TV Display Pill + Live Monitor Beacon */}
      <div className="flex items-center gap-3">
        {/* Brand Pill */}
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#0B1220] text-white border border-black/10 shadow-2xs">
          TV DISPLAY
        </span>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Live Pulse Indicator in Brand Emerald */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-800 font-mono">
            LIVE FLOOR MONITOR
          </span>
        </div>
      </div>

      {/* Center: Live Digital Clock & Date in Light Card */}
      <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 shadow-2xs">
        <span className="text-xs font-semibold text-slate-600">
          {currentDate}
        </span>
        <div className="h-3.5 w-px bg-slate-200" />
        <span className="font-mono font-extrabold text-sm text-[#0B1220] tracking-widest">
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
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-bold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3 h-3 text-[#0B1220] animate-[spin_12s_linear_infinite]" />
          <span>Auto-sync in {refreshCountdown}s</span>
        </button>

        {/* Exit TV View Button in Obsidian */}
        <button
          type="button"
          onClick={exitTvMode}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-extrabold transition-all cursor-pointer shadow-2xs border border-transparent group"
        >
          <Minimize2 className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
          <span>Exit TV View</span>
          <span className="hidden sm:inline text-[10px] font-mono font-normal opacity-70">(Esc)</span>
        </button>
      </div>

    </header>
  )
}
