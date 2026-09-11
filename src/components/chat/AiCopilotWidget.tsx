'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bot } from 'lucide-react'

export function AiCopilotWidget() {
  const pathname = usePathname()

  // Hide the floating button on the dedicated Zigza AI page itself
  if (pathname === '/zigza-ai' || pathname?.includes('/zigza-ai')) {
    return null
  }

  function getPortalAiRoute() {
    if (pathname?.startsWith('/design') || pathname?.startsWith('/modules/design')) return '/design/zigza-ai'
    if (pathname?.startsWith('/merchandising') || pathname?.startsWith('/modules/merchandising')) return '/merchandising/zigza-ai'
    if (pathname?.startsWith('/cutting') || pathname?.startsWith('/modules/cutting')) return '/cutting/zigza-ai'
    if (pathname?.startsWith('/printing') || pathname?.startsWith('/modules/printing')) return '/printing/zigza-ai'
    if (pathname?.startsWith('/embroidery') || pathname?.startsWith('/modules/embroidery')) return '/embroidery/zigza-ai'
    if (pathname?.startsWith('/washing') || pathname?.startsWith('/modules/washing')) return '/washing/zigza-ai'
    if (pathname?.startsWith('/iron') || pathname?.startsWith('/modules/iron')) return '/iron/zigza-ai'
    if (pathname?.startsWith('/ready-goods') || pathname?.startsWith('/modules/ready-goods')) return '/ready-goods/zigza-ai'
    if (pathname?.startsWith('/alter') || pathname?.startsWith('/modules/alter')) return '/alter/zigza-ai'
    if (
      pathname === '/store' || 
      (pathname?.startsWith('/store') && !pathname?.startsWith('/stitching-sewing/store')) ||
      pathname?.startsWith('/modules/store')
    ) {
      return '/store/zigza-ai'
    }
    if (pathname?.startsWith('/factory') || pathname?.startsWith('/modules/factory')) return '/factory/zigza-ai'
    if (pathname?.startsWith('/brands') || pathname?.startsWith('/modules/brands')) return '/brands/zigza-ai'
    if (pathname === '/modules' || pathname === '/modules/' || pathname?.startsWith('/modules/profile')) return '/modules/zigza-ai'
    return '/stitching-sewing/zigza-ai'
  }

  const targetAiRoute = getPortalAiRoute()

  return (
    <div className="fixed bottom-9 right-9 sm:bottom-10 sm:right-10 z-40 animate-in fade-in duration-200">
      <Link
        href={targetAiRoute}
        prefetch={true}
        className="inline-flex items-center gap-3 px-4 py-3 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-2xl shadow-xl shadow-[#3A3564]/30 hover:shadow-2xl hover:shadow-[#3A3564]/40 transition-all cursor-pointer border border-white/20 group hover:scale-[1.03] active:scale-[0.97] select-none ring-2 ring-[#3A3564]/15 shrink-0"
        aria-label="Open Zigza AI"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-[#FAF7F0] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="text-[14.5px] sm:text-[15px] font-bold tracking-tight font-[family-name:var(--font-heading)] text-white whitespace-nowrap leading-none">
          Zigza AI
        </span>
      </Link>
    </div>
  )
}
