'use client'

import { useState } from 'react'
import { Menu, ShieldAlert } from 'lucide-react'
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
    <div className="min-h-screen bg-[#FAF7F0] flex">
      {/* Dedicated Platform Super Admin Sidebar */}
      <PlatformAdminSidebar
        userEmail={userEmail}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[72px] flex flex-col min-w-0 transition-all duration-300">
        
        {/* Top Mobile Bar (only visible on mobile screens below lg) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg border border-black/10 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono text-[#3A3564]">
                ZIGZA
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#3A3564] text-white">
                ROOT ADMIN
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            {userEmail}
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
