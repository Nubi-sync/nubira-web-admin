'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bot } from 'lucide-react'

export function AiCopilotWidget() {
  const pathname = usePathname()

  // Do NOT show on designer screens, on zigza-ai pages, or on auth pages
  if (
    !pathname ||
    pathname.includes('/designer') ||
    pathname.includes('/zigza-ai') ||
    pathname === '/login' ||
    pathname === '/'
  ) {
    return null
  }

  // Determine the module-specific Zigza AI route
  let targetAiHref = '/modules/zigza-ai'
  if (pathname.startsWith('/design')) {
    targetAiHref = '/design/zigza-ai'
  } else if (pathname.startsWith('/stitching-sewing')) {
    targetAiHref = '/stitching-sewing/zigza-ai'
  } else if (pathname.startsWith('/merchandising')) {
    targetAiHref = '/merchandising/zigza-ai'
  } else if (pathname.startsWith('/cutting')) {
    targetAiHref = '/cutting/zigza-ai'
  } else if (pathname.startsWith('/printing')) {
    targetAiHref = '/printing/zigza-ai'
  } else if (pathname.startsWith('/embroidery')) {
    targetAiHref = '/embroidery/zigza-ai'
  } else if (pathname.startsWith('/washing')) {
    targetAiHref = '/washing/zigza-ai'
  } else if (pathname.startsWith('/iron')) {
    targetAiHref = '/iron/zigza-ai'
  } else if (pathname.startsWith('/alter')) {
    targetAiHref = '/alter/zigza-ai'
  } else if (pathname.startsWith('/store')) {
    targetAiHref = '/store/zigza-ai'
  } else if (pathname.startsWith('/ready-goods')) {
    targetAiHref = '/ready-goods/zigza-ai'
  } else if (pathname.startsWith('/brands')) {
    targetAiHref = '/brands/zigza-ai'
  } else if (pathname.startsWith('/factory')) {
    targetAiHref = '/factory/zigza-ai'
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <Link
        href={targetAiHref}
        className="flex items-center gap-2.5 px-4 py-3 bg-[#3A3564] hover:bg-[#2F2B52] text-white rounded-full shadow-lg border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-black/15"
        aria-label="Open Zigza AI Copilot"
      >
        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-bold font-mono tracking-wide">
          Zigza AI
        </span>
      </Link>
    </div>
  )
}
