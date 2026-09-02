'use client'

import { useTvMode } from '@/context/TvModeContext'
import { Tv, Minimize2 } from 'lucide-react'

interface TvViewButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function TvViewButton({ className = '', size = 'md' }: TvViewButtonProps) {
  const { isTvMode, toggleTvMode } = useTvMode()

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs'
    : size === 'lg'
    ? 'px-5 py-2.5 text-sm'
    : 'px-4 py-2 text-xs sm:text-sm'

  return (
    <button
      type="button"
      onClick={toggleTvMode}
      title={isTvMode ? 'Exit TV Mode (Esc)' : 'Switch to Fullscreen Floor TV View'}
      className={`inline-flex items-center gap-2 rounded-xl font-bold transition-all shadow-2xs cursor-pointer group select-none ${
        isTvMode
          ? 'bg-[#3A3564] text-white hover:bg-[#2A2649] border border-transparent'
          : 'bg-white border border-black/15 hover:border-black/30 hover:bg-slate-50 text-slate-800'
      } ${sizeClasses} ${className}`}
    >
      {isTvMode ? (
        <>
          <Minimize2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span>Exit TV</span>
        </>
      ) : (
        <>
          <Tv className="w-4 h-4 text-[#3A3564] group-hover:scale-110 transition-transform" />
          <span>TV View</span>
        </>
      )}
    </button>
  )
}
