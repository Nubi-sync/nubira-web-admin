'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'
import { TvModeProvider, useTvMode } from '@/context/TvModeContext'
import { TvTopBar } from './TvTopBar'
import { Menu } from 'lucide-react'
import Link from 'next/link'

function MobileTopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center: Brand Logo */}
      <Link href="/dashboard" className="flex items-center">
        <img 
          src="/z i g z a (1) copy.png" 
          alt="zigza." 
          className="h-7 w-auto object-contain"
        />
      </Link>

      {/* Right: ERP Badge */}
      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
        ERP MES
      </span>
    </header>
  )
}

function AdminShellContent({ 
  children, 
  userEmail 
}: { 
  children: React.ReactNode
  userEmail?: string 
}) {
  const { isTvMode } = useTvMode()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <div className={`min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAF8] text-slate-900 font-[family-name:var(--font-public-sans)] ${isTvMode ? 'tv-mode-active' : ''}`}>
      {/* Sidebar — Desktop: always visible; Mobile: hamburger drawer */}
      {!isTvMode && (
        <AdminSidebar 
          userEmail={userEmail} 
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto transition-all">
        {/* TV Mode Top Bar */}
        {isTvMode && <TvTopBar />}

        {/* Mobile Top Bar — visible <lg, hidden in TV mode */}
        {!isTvMode && (
          <MobileTopBar onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} />
        )}

        <div className={`flex-1 ${isTvMode ? 'w-full max-w-none' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

export function AdminShell({ 
  children, 
  userEmail 
}: { 
  children: React.ReactNode
  userEmail?: string 
}) {
  return (
    <TvModeProvider>
      <AdminShellContent userEmail={userEmail}>
        {children}
      </AdminShellContent>
    </TvModeProvider>
  )
}
