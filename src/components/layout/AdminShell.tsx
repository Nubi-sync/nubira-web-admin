'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Zap } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { CompanyOwnerHeader } from './CompanyOwnerHeader'
import { TvModeProvider, useTvMode } from '@/context/TvModeContext'
import { TvTopBar } from './TvTopBar'
import { AiCopilotWidget } from '../chat/AiCopilotWidget'
import { getTenantSubscriptionStatusAction } from '@/app/profile/actions'
import { RechargeModal } from '@/components/subscription/RechargeModal'

function MobileTopBar({ 
  onMenuToggle, 
  logoHref = '/modules',
  isTrial = false,
  daysLeft = 7
}: { 
  onMenuToggle: () => void
  logoHref?: string
  isTrial?: boolean
  daysLeft?: number
}) {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between shadow-xs gap-2">
      {/* Left: Hamburger Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuToggle}
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-[#0B1220] hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <Link href={logoHref} className="flex items-center gap-2">
          <img 
            src="/new icon.png" 
            alt="" 
            className="h-6.5 w-auto object-contain shrink-0"
          />
          <img 
            src="/zigza new logo.png" 
            alt="Zigza" 
            className="h-5 w-auto object-contain shrink-0"
          />
        </Link>
      </div>

      {/* Right: Trial Recharge CTA (If Trial) OR ERP MES Badge */}
      <div className="flex items-center gap-2">
        {isTrial ? (
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (window.location.pathname.startsWith('/profile')) {
                  window.dispatchEvent(new CustomEvent('blink-active-subscription'))
                  return
                }
                window.location.href = '/profile?highlight=subscription'
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F0FDFA] border border-[#14C8B4]/40 text-[#0B1220] text-[11px] font-bold shadow-2xs cursor-pointer active:scale-95"
            title="Free Trial Active - Click to recharge"
          >
            <span>{daysLeft}d left</span>
            <span className="text-[#1D4ED8] underline font-bold ml-0.5">Recharge</span>
          </button>
        ) : (
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 shadow-xs">
            ERP MES
          </span>
        )}
      </div>
    </header>
  )
}

function AdminShellContent({ 
  children, 
  userEmail, 
  userRole,
  companyName,
  allowedTabs
}: { 
  children: React.ReactNode
  userEmail?: string 
  userRole?: string
  companyName?: string
  allowedTabs?: string[]
}) {
  const { isTvMode } = useTvMode()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [subStatus, setSubStatus] = useState<{
    isTrial: boolean
    daysLeft: number
    companyName: string
    monthlyRate: number
  }>({
    isTrial: false,
    daysLeft: 7,
    companyName: companyName || '',
    monthlyRate: 4999
  })

  // Fetch tenant subscription status
  useEffect(() => {
    let isMounted = true
    getTenantSubscriptionStatusAction()
      .then((res) => {
        if (!isMounted) return
        setSubStatus({
          isTrial: res.isTrial,
          daysLeft: res.daysLeft,
          companyName: res.companyName || companyName || '',
          monthlyRate: res.monthlyBillingInr
        })
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [companyName])

  const isAiPage = pathname === '/zigza-ai' || pathname?.includes('/zigza-ai')
  
  // Workspace Hub / Admin Level pages (Horizontal Navbar displayed instead of vertical sidebar)
  const isWorkspaceHubPage = (
    pathname === '/modules' ||
    pathname === '/dashboard' ||
    pathname?.startsWith('/dashboard') ||
    pathname === '/vendors' ||
    pathname?.startsWith('/vendors') ||
    pathname === '/buyers-vendors' ||
    pathname?.startsWith('/buyers-vendors') ||
    pathname === '/access-control' ||
    pathname?.startsWith('/access-control') ||
    pathname === '/supervisor-workers' ||
    pathname?.startsWith('/supervisor-workers') ||
    pathname === '/modules/access-control' ||
    pathname?.startsWith('/modules/access-control') ||
    pathname === '/all-designs' ||
    pathname?.startsWith('/all-designs') ||
    pathname === '/fabric-store' ||
    pathname?.startsWith('/fabric-store') ||
    pathname === '/zigza-ai' ||
    pathname?.startsWith('/zigza-ai') ||
    pathname === '/reports' ||
    pathname?.startsWith('/reports') ||
    pathname === '/profile' ||
    pathname?.startsWith('/profile') ||
    pathname === '/company-profile' ||
    pathname?.startsWith('/company-profile') ||
    pathname === '/modules/profile' ||
    pathname?.startsWith('/modules/profile')
  )

  const isStoreUser = (
    userRole?.toUpperCase() === 'STORE' ||
    userRole?.toUpperCase() === 'STORE_SUPERVISOR' ||
    userRole?.toUpperCase() === 'GODOWN' ||
    userEmail?.toLowerCase().startsWith('store@') ||
    userEmail?.toLowerCase() === 'store'
  )

  const isProductionManager = (
    userRole?.toUpperCase() === 'PRODUCTION_MANAGER' ||
    userRole?.toUpperCase() === 'PROD_MANAGER' ||
    userRole?.toUpperCase() === 'PRODUCTION_SUPERVISOR' ||
    userEmail?.toLowerCase().includes('@pm.') ||
    userEmail?.toLowerCase().startsWith('pm@')
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

  const homeHref = isProductionManager
    ? '/stitching-sewing/production-orders'
    : (isAdmin 
        ? '/modules' 
        : (isStoreUser 
            ? '/stitching-sewing/inventory' 
            : (pathname?.startsWith('/stitching-sewing') ? '/stitching-sewing/dashboard' : (pathname?.startsWith('/store') ? '/store' : '/stitching-sewing/dashboard'))))

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
    <div className={`min-h-screen w-full flex flex-col ${!isWorkspaceHubPage ? 'lg:flex-row' : ''} bg-[#F8FAFC] text-[#0B1220] font-[family-name:var(--font-public-sans)] ${isTvMode ? 'tv-mode-active' : ''}`}>
      {/* Sidebar — ONLY rendered when NOT in TV mode and NOT on Workspace Hub pages */}
      {!isTvMode && !isWorkspaceHubPage && (
        <AdminSidebar 
          userEmail={userEmail} 
          userRole={userRole}
          companyName={companyName}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 flex flex-col transition-all relative ${!isTvMode && !isWorkspaceHubPage ? 'lg:pl-[72px]' : ''} ${
        isAiPage && !isWorkspaceHubPage
          ? 'h-dvh overflow-hidden' 
          : 'min-h-screen overflow-y-auto'
      }`}>
        {/* 1. TV Mode Top Bar */}
        {isTvMode && <TvTopBar />}

        {/* 2. Company Owner Horizontal Navbar (Shown only on Workspace Hub pages) */}
        {!isTvMode && isWorkspaceHubPage && (
          <CompanyOwnerHeader 
            userEmail={userEmail} 
            userRole={userRole} 
            companyName={companyName}
            allowedTabs={allowedTabs}
          />
        )}

        {/* 3. Mobile Top Bar — visible <lg on inside-module pages, hidden on Workspace Hub & TV mode & AI page */}
        {!isTvMode && !isWorkspaceHubPage && !isAiPage && (
          <MobileTopBar 
            onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} 
            logoHref={homeHref} 
            isTrial={subStatus.isTrial}
            daysLeft={subStatus.daysLeft}
          />
        )}

        <div className={`flex-1 min-h-0 flex flex-col h-full ${isTvMode ? 'w-full max-w-none' : ''}`}>
          {children}
        </div>

        {/* AI Copilot Chatbot Widget (Only for Admins) */}
        {!isTvMode && !isStoreUser && <AiCopilotWidget />}

        {/* Global In-App Recharge Modal */}
        <RechargeModal
          companyName={subStatus.companyName || companyName || 'Apparel Factory'}
          daysLeft={subStatus.daysLeft}
          monthlyRate={subStatus.monthlyRate}
        />
      </main>
    </div>
  )
}

export function AdminShell({ 
  children, 
  userEmail, 
  userRole,
  companyName,
  allowedTabs
}: { 
  children: React.ReactNode
  userEmail?: string 
  userRole?: string
  companyName?: string
  allowedTabs?: string[]
}) {
  return (
    <TvModeProvider>
      <AdminShellContent userEmail={userEmail} userRole={userRole} companyName={companyName} allowedTabs={allowedTabs}>
        {children}
      </AdminShellContent>
    </TvModeProvider>
  )
}
