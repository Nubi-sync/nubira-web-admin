'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { TvModeProvider, useTvMode } from '@/context/TvModeContext'
import { TvTopBar } from './TvTopBar'
import { AiCopilotWidget } from '../chat/AiCopilotWidget'

function MobileTopBar({ onMenuToggle, logoHref = '/modules' }: { onMenuToggle: () => void; logoHref?: string }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-xs">
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
      <Link href={logoHref} className="flex items-center">
        <img 
          src="/z i g z a (7).png" 
          alt="Zigza" 
          className="h-8 sm:h-9 w-auto object-contain"
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
  userEmail,
  userRole,
  companyName
}: { 
  children: React.ReactNode
  userEmail?: string 
  userRole?: string
  companyName?: string
}) {
  const { isTvMode } = useTvMode()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAiPage = pathname === '/zigza-ai' || pathname?.includes('/zigza-ai')
  const isStoreUser = (
    userRole?.toUpperCase() === 'STORE' ||
    userRole?.toUpperCase() === 'STORE_SUPERVISOR' ||
    userRole?.toUpperCase() === 'GODOWN' ||
    userEmail?.toLowerCase().startsWith('store@') ||
    userEmail?.toLowerCase() === 'store'
  )

  const isAdmin = (
    userEmail?.toLowerCase() === 'admin@zigza.in' ||
    userEmail?.toLowerCase() === 'team.anga9@gmail.com' ||
    userEmail?.toLowerCase() === 'aj@nubiracreation.com' ||
    userRole?.toUpperCase() === 'ADMIN' ||
    userRole?.toUpperCase() === 'SUPERADMIN' ||
    userRole?.toUpperCase() === 'PLATFORM_SUPERADMIN' ||
    userRole?.toUpperCase() === 'ADMINISTRATOR'
  )

  const homeHref = isAdmin 
    ? '/modules' 
    : (isStoreUser 
        ? '/stitching-sewing/inventory' 
        : (pathname?.startsWith('/stitching-sewing') ? '/stitching-sewing/dashboard' : (pathname?.startsWith('/store') ? '/store' : '/stitching-sewing/dashboard')))

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Listen for mobile menu toggle event from Zigza AI single header
  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev)
    window.addEventListener('toggle-mobile-menu', handleToggle)
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle)
  }, [])

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
      {/* Sidebar — Desktop: Always icon rail, hover-to-slide open; Mobile: drawer */}
      {!isTvMode && (
        <AdminSidebar 
          userEmail={userEmail} 
          userRole={userRole}
          companyName={companyName}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area — offset by 72px on desktop for the permanent icon rail */}
      <main className={`flex-1 min-w-0 flex flex-col transition-all relative ${!isTvMode ? 'lg:pl-[72px]' : ''} ${
        isAiPage 
          ? 'h-dvh overflow-hidden' 
          : 'min-h-screen overflow-y-auto'
      }`}>
        {/* TV Mode Top Bar */}
        {isTvMode && <TvTopBar />}

        {/* Mobile Top Bar — visible <lg, hidden in TV mode, and hidden on /zigza-ai to prevent double navbar */}
        {!isTvMode && !isAiPage && (
          <MobileTopBar onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} logoHref={homeHref} />
        )}

        <div className={`flex-1 min-h-0 flex flex-col h-full ${isTvMode ? 'w-full max-w-none' : ''}`}>
          {children}
        </div>

        {/* AI Copilot Chatbot Widget (Only for Admins) */}
        {!isTvMode && !isStoreUser && <AiCopilotWidget />}
      </main>
    </div>
  )
}

export function AdminShell({ 
  children, 
  userEmail,
  userRole,
  companyName
}: { 
  children: React.ReactNode
  userEmail?: string 
  userRole?: string
  companyName?: string
}) {
  return (
    <TvModeProvider>
      <AdminShellContent userEmail={userEmail} userRole={userRole} companyName={companyName}>
        {children}
      </AdminShellContent>
    </TvModeProvider>
  )
}
