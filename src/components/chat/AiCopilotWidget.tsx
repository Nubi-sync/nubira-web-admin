'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bot } from 'lucide-react'

export function AiCopilotWidget() {
  const router = useRouter()
  const pathname = usePathname()

  // Hide the floating button on the dedicated Zigza AI page itself
  if (pathname === '/zigza-ai' || pathname?.startsWith('/zigza-ai')) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-7 sm:right-7 z-40 animate-in fade-in duration-200">
      <button
        type="button"
        onClick={() => router.push('/zigza-ai')}
        className="inline-flex items-center gap-2.5 px-3.5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl shadow-lg shadow-[#3A3564]/25 hover:shadow-xl hover:shadow-[#3A3564]/35 transition-all cursor-pointer border border-white/20 group hover:scale-[1.03] active:scale-[0.97] select-none ring-2 ring-[#3A3564]/15 shrink-0"
        aria-label="Open Zigza AI"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-[#FAF7F0] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="text-[13.5px] font-bold tracking-tight font-[family-name:var(--font-heading)] text-white whitespace-nowrap leading-none">
          Zigza AI
        </span>
      </button>
    </div>
  )
}
