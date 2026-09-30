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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-[#0B1220] selection:text-[#14C8B4]">
      {/* Dedicated Platform Super Admin Sidebar */}
      <PlatformAdminSidebar
        userEmail={userEmail}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area — offset by 72px on desktop for permanent icon rail */}
      <div className="flex-1 lg:pl-[72px] flex flex-col min-w-0 transition-all duration-300">
        
        {/* Top Mobile Bar (only visible on mobile screens below lg) */}
        <header className="lg:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 px-4 py-2 flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-[#0B1220]" />
          </button>

          <Link href="/platform-admin" className="flex items-center gap-2">
            <img 
              src="/new icon.png" 
              alt="" 
              className="h-7 w-auto object-contain shrink-0"
            />
            <img 
              src="/zigza new logo.png" 
              alt="Zigza" 
              className="h-5.5 w-auto object-contain shrink-0"
            />
          </Link>

          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 shadow-2xs">
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
