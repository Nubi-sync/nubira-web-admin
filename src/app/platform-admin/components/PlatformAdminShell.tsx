'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { PlatformAdminSidebar } from './PlatformAdminSidebar'

interface PlatformAdminShellProps {
  children: React.ReactNode
  userEmail?: string
}

export function PlatformAdminShell({
  children,
  userEmail = 'admin@zigza.in',
}: PlatformAdminShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAF8] text-[#09090b] font-[family-name:var(--font-public-sans)] antialiased selection:bg-[#3A3564] selection:text-white">
      {/* Dedicated Platform Super Admin Sidebar */}
      <PlatformAdminSidebar
        userEmail={userEmail}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area — offset by 72px on desktop for permanent icon rail */}
      <div className="flex-1 lg:pl-[72px] flex flex-col min-w-0 transition-all duration-300">
        
        {/* Top Mobile Bar (only visible on mobile screens below lg) */}
        <header className="lg:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/platform-admin" className="flex items-center">
            <img 
              src="/z i g z a (2).png" 
              alt="zigza." 
              className="h-9 sm:h-10 w-auto object-contain rounded-xl overflow-hidden shadow-2xs"
            />
          </Link>

          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
            ROOT ADMIN
          </span>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 pb-16">
          {children}
        </main>
      </div>
    </div>
  )
}
