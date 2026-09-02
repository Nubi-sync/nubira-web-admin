'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { BrainCircuit } from 'lucide-react'

export function AiCopilotWidget() {
  const router = useRouter()
  const pathname = usePathname()

  // Hide the floating button on the dedicated Zigza AI page itself
  if (pathname === '/zigza-ai' || pathname?.startsWith('/zigza-ai')) {
    return null
  }

  return (
    <div className="fixed bottom-10 right-8 sm:bottom-12 sm:right-10 md:bottom-14 md:right-12 z-40 animate-in fade-in zoom-in-95 duration-200">
      <button
        type="button"
        onClick={() => router.push('/zigza-ai')}
        className="flex items-center gap-3 px-5 py-3.5 sm:px-6 sm:py-4 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-2xl shadow-2xl hover:shadow-[0_20px_35px_-10px_rgba(58,53,100,0.6)] transition-all cursor-pointer border border-white/25 group hover:scale-105 active:scale-95 select-none ring-4 ring-[#3A3564]/15"
        aria-label="Open Zigza AI"
      >
        <div className="relative">
          <BrainCircuit className="w-6 h-6 text-[#FAF7F0] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm sm:text-base font-extrabold tracking-wide font-[family-name:var(--font-heading)]">
            Zigza AI
          </span>
          <span className="text-[11px] text-[#FAF7F0]/80 font-medium hidden sm:inline-block">
            Factory Intelligence
          </span>
        </div>
      </button>
    </div>
  )
}
