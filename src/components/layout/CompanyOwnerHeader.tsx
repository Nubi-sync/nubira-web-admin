'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Plus,
  ChevronDown,
  Bell,
  LogOut,
  Layers,
  Scissors,
  Sparkles,
  Users,
  Building2,
  User,
  Menu,
  X,
  ChevronRight,
  Zap,
  Clock,
  Loader2
} from 'lucide-react'
import {
  DashboardNavIcon,
  AllModulesNavIcon,
  BuyersVendorsNavIcon,
  SupervisorWorkersNavIcon,
  AllDesignsNavIcon,
  FabricStoreNavIcon,
  ZigzaAiNavIcon,
  ReportsNavIcon,
  CompanyProfileNavIcon
} from '@/components/icons/ApparelIcons'
import { toast } from 'sonner'
import { getUnreadNotificationCount, FLOOR_NOTIFICATIONS_UPDATE_EVENT } from '@/utils/floorNotificationsStorage'
import { getTenantSubscriptionStatusAction } from '@/app/profile/actions'
import { RechargeModal } from '@/components/subscription/RechargeModal'

interface CompanyOwnerHeaderProps {
  userEmail?: string
  userRole?: string
  companyName?: string
  allowedTabs?: string[]
}

interface NavTabItem {
  id: string
  label: string
  lines: [string, string?]
  href?: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>
  isActive: boolean
}

export function CompanyOwnerHeader({
  userEmail = 'admin@zigza.in',
  userRole = 'Super Admin',
  companyName,
  allowedTabs
}: CompanyOwnerHeaderProps) {
  const pathname = usePathname()

  const [unreadCount, setUnreadCount] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)

  // Subscription / Trial State
  const [subStatus, setSubStatus] = useState<{
    isTrial: boolean
    daysLeft: number
    expiresAt?: string
    isExpired: boolean
    monthlyRate: number
  }>({
    isTrial: false,
    daysLeft: 7,
    isExpired: false,
    monthlyRate: 4999
  })

  const [isRechargingTop, setIsRechargingTop] = useState(false)
  const [isRechargingMobile, setIsRechargingMobile] = useState(false)
  const createRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Fetch tenant subscription status & trigger reminder toast on trial accounts
  useEffect(() => {
    let isMounted = true
    getTenantSubscriptionStatusAction()
      .then((res) => {
        if (!isMounted) return
        setSubStatus({
          isTrial: res.isTrial,
          daysLeft: res.daysLeft,
          expiresAt: res.expiresAt,
          isExpired: res.isExpired,
          monthlyRate: res.monthlyBillingInr
        })

        // One-time session toast notification when trial account logs in / opens portal
        if (res.isTrial) {
          const toastSessionKey = `trial_toast_shown_${res.companyName || companyName || 'trial'}_${res.daysLeft}`
          if (typeof window !== 'undefined' && !sessionStorage.getItem(toastSessionKey)) {
            sessionStorage.setItem(toastSessionKey, 'true')
            toast(`Free Trial: ${res.daysLeft} days remaining`, {
              description: 'Recharge to maintain uninterrupted access.',
              action: {
                label: 'Recharge',
                onClick: () => {
                  window.location.href = '/profile?highlight=subscription#subscription'
                }
              },
              duration: 7000
            })
          }
        }
      })
      .catch((err) => {
        console.warn('Subscription fetch notice:', err)
      })

    return () => {
      isMounted = false
    }
  }, [companyName])

  // Listen to floor notifications update for real-time badge
  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadNotificationCount(companyName))
    }
    updateCount()
    window.addEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, updateCount)
    window.addEventListener('storage', updateCount)
    return () => {
      window.removeEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [companyName])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setIsCreateOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdowns & mobile drawer on route change
  useEffect(() => {
    setIsCreateOpen(false)
    setIsProfileOpen(false)
    setIsMobileDrawerOpen(false)
  }, [pathname])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileDrawerOpen])

  const resolvedCompany = companyName && companyName.trim() && companyName !== 'Account Deactivated'
    ? companyName.trim()
    : 'Apparel Factory'

  // Exact 9 Tabs with Bespoke Domain-Accurate Icons:
  // 1. Dashboard -> DashboardNavIcon
  // 2. All Modules -> AllModulesNavIcon
  // 3. Buyers & Vendors -> BuyersVendorsNavIcon
  // 4. Supervisor & Workers -> SupervisorWorkersNavIcon
  // 5. All Designs -> AllDesignsNavIcon
  // 6. Fabric & Store -> FabricStoreNavIcon
  // 7. Zigza AI -> ZigzaAiNavIcon
  // 8. Reports -> ReportsNavIcon
  // 9. Company Profile -> CompanyProfileNavIcon
  const navTabs: NavTabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      lines: ['Dashboard'],
      href: '/dashboard',
      icon: DashboardNavIcon,
      isActive: pathname === '/dashboard' || pathname?.startsWith('/dashboard') || pathname === '/stitching-sewing/dashboard'
    },
    {
      id: 'all-modules',
      label: 'All Modules',
      lines: ['All Modules'],
      href: '/modules',
      icon: AllModulesNavIcon,
      isActive: pathname === '/modules' || pathname === '/modules/'
    },
    {
      id: 'buyers-vendors',
      label: 'Buyers & Vendors',
      lines: ['Buyers &', 'Vendors'],
      href: '/buyers-vendors',
      icon: BuyersVendorsNavIcon,
      isActive: pathname === '/buyers-vendors' || pathname?.startsWith('/buyers-vendors') || pathname === '/vendors' || pathname?.startsWith('/vendors')
    },
    {
      id: 'supervisor-workers',
      label: 'Supervisor & Workers',
      lines: ['Supervisor &', 'Workers'],
      href: '/access-control',
      icon: SupervisorWorkersNavIcon,
      isActive: pathname === '/access-control' || pathname?.startsWith('/access-control') || pathname === '/modules/access-control' || pathname === '/supervisor-workers'
    },
    {
      id: 'all-designs',
      label: 'All Designs',
      lines: ['All Designs'],
      href: '/all-designs',
      icon: AllDesignsNavIcon,
      isActive: pathname === '/all-designs' || pathname?.startsWith('/all-designs') || pathname === '/design/sa-approvals' || pathname?.startsWith('/design/sa-approvals')
    },
    {
      id: 'fabric-store',
      label: 'Fabric & Store',
      lines: ['Fabric &', 'Store'],
      href: '/fabric-store',
      icon: FabricStoreNavIcon,
      isActive: pathname === '/fabric-store' || pathname?.startsWith('/fabric-store')
    },
    {
      id: 'zigza-ai',
      label: 'Zigza AI',
      lines: ['Zigza AI'],
      href: '/zigza-ai',
      icon: ZigzaAiNavIcon,
      isActive: pathname === '/zigza-ai' || pathname?.startsWith('/zigza-ai')
    },
    {
      id: 'reports',
      label: 'Reports',
      lines: ['Reports'],
      href: '/reports',
      icon: ReportsNavIcon,
      isActive: pathname === '/reports' || pathname?.startsWith('/reports')
    },
    {
      id: 'company-profile',
      label: 'Company Profile',
      lines: ['Company', 'Profile'],
      href: '/profile',
      icon: CompanyProfileNavIcon,
      isActive: pathname === '/profile' || pathname?.startsWith('/profile') || pathname === '/modules/profile' || pathname === '/company-profile'
    }
  ]

  return (
    <div className="w-full select-none z-30 sticky top-0 font-[family-name:var(--font-public-sans)] bg-white shadow-xs">
      {/* 1. TOP BRAND NAVBAR */}
      <header className="w-full bg-white text-[#0B1220] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-slate-200/80 gap-2">
        {/* Left Section: Hamburger (Mobile) + Brand Logo + Company Name */}
        <div className="flex items-center gap-2 sm:gap-3.5 md:gap-5 min-w-0">
          {/* Hamburger button for mobile */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 hover:bg-[#F0FDFA] active:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-[#0B1220] transition-all cursor-pointer shrink-0 md:hidden shadow-2xs active:scale-95"
            aria-label="Open Navigation Menu"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#0B1220]" />
          </button>

          <Link href="/modules" className="flex items-center gap-2 sm:gap-2.5 md:gap-3 shrink-0 group">
            <img
              src="/new icon.png"
              alt=""
              className="h-7 sm:h-8 md:h-10 w-auto object-contain transition-transform duration-150 group-hover:scale-105 shrink-0"
            />
            <img
              src="/zigza new logo.png"
              alt="Zigza"
              className="h-5.5 sm:h-6.5 md:h-7.5 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02] shrink-0"
            />
          </Link>

          <span className="h-6 sm:h-7 md:h-8 w-px bg-slate-200 hidden sm:inline-block" />

          <div className="hidden sm:flex items-center min-w-0">
            <h1 className="text-sm sm:text-base md:text-xl font-extrabold text-[#0B1220] tracking-tight truncate max-w-[150px] sm:max-w-[220px] md:max-w-none font-[family-name:var(--font-heading)]">
              {resolvedCompany}
            </h1>
          </div>
        </div>

        {/* Right Section: Actions (+ Recharge, + Create, Notification Bell, User Account) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 shrink-0">
          {/* Top Bar "Click here to recharge" Button (Visible ONLY if in Free Trial) */}
          {subStatus.isTrial && (
            <>
              {/* Desktop / Tablet View */}
              <button
                type="button"
                disabled={isRechargingTop}
                onClick={() => {
                  setIsRechargingTop(true)
                  window.location.href = '/profile?highlight=subscription#subscription'
                }}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/40 hover:border-[#14C8B4] text-[#0B1220] font-bold text-xs shadow-2xs transition-all cursor-pointer group active:scale-95 disabled:opacity-80"
                title="Free Trial Active - Click here to recharge"
              >
                {isRechargingTop ? (
                  <span className="flex items-center gap-1.5 text-[#1D4ED8]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D4ED8]" />
                    <span>Loading...</span>
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-slate-700">
                      Trial: <strong className="text-[#0B1220]">{subStatus.daysLeft}d left</strong>
                    </span>
                    <span className="h-3 w-px bg-slate-300" />
                    <span className="text-[#1D4ED8] font-bold group-hover:underline">
                      Click here to recharge
                    </span>
                  </>
                )}
              </button>

              {/* Mobile Header View */}
              <button
                type="button"
                disabled={isRechargingTop}
                onClick={() => {
                  setIsRechargingTop(true)
                  window.location.href = '/profile?highlight=subscription#subscription'
                }}
                className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F0FDFA] border border-[#14C8B4]/40 text-[#0B1220] text-[11px] font-bold shadow-2xs cursor-pointer active:scale-95 disabled:opacity-80"
              >
                {isRechargingTop ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D4ED8]" />
                ) : (
                  <>
                    <span>{subStatus.daysLeft}d left</span>
                    <span className="text-[#1D4ED8] underline font-bold ml-0.5">Recharge</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* + Create Dropdown */}
          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="bg-[#1D4ED8] text-white hover:bg-[#1E40AF] px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm md:text-[15px] font-bold shadow-xs shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] text-white" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
            </button>

            {isCreateOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-[#0B1220] text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Quick Actions
                </div>
                <Link
                  href="/access-control"
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0FDFA] transition-colors font-semibold text-slate-800 hover:text-[#0B1220]"
                >
                  <Users className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span className="text-[13px]">Appoint Department Head</span>
                </Link>
                <Link
                  href="/design/sa-approvals"
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0FDFA] transition-colors font-semibold text-slate-800 hover:text-[#0B1220]"
                >
                  <Sparkles className="w-4.5 h-4.5 text-[#1D4ED8] shrink-0" />
                  <span className="text-[13px]">Review Design Approvals</span>
                </Link>
                <Link
                  href="/cutting"
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0FDFA] transition-colors text-slate-700 hover:text-[#0B1220]"
                >
                  <Scissors className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                  <span className="text-[13px]">Open Cutting Floor</span>
                </Link>
                <Link
                  href="/stitching-sewing/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0FDFA] transition-colors text-slate-700 hover:text-[#0B1220]"
                >
                  <Layers className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                  <span className="text-[13px]">Open Sewing Dashboard</span>
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0FDFA] transition-colors text-slate-700 hover:text-[#0B1220]"
                >
                  <Building2 className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                  <span className="text-[13px]">Company Profile &amp; Units</span>
                </Link>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <Link
            href="/stitching-sewing/notifications"
            className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] transition-colors shadow-2xs"
            title="Floor Notifications"
          >
            <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0B1220]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] font-bold transition-all cursor-pointer shadow-2xs overflow-hidden"
              aria-label="User Account"
            >
              <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0B1220]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-[#0B1220] text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-[#0B1220] text-sm truncate">{resolvedCompany}</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{userEmail}</p>
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
                    {userRole}
                  </span>
                </div>

                <div className="py-1.5">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F0FDFA] transition-colors text-slate-700 hover:text-[#0B1220] font-semibold"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Company Profile &amp; Settings</span>
                  </Link>
                  <Link
                    href="/access-control"
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F0FDFA] transition-colors text-slate-700 hover:text-[#0B1220] font-semibold"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Appointed Department Heads</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <form
                    action="/auth/signout"
                    method="post"
                    onSubmit={() => {
                      try {
                        sessionStorage.clear()
                        localStorage.removeItem('trial_toast_shown')
                      } catch (e) {}
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. RECTANGULAR HORIZONTAL SUB-NAVBAR (Visible on MD and larger screens) */}
      {(() => {
        const isOwnerOrPM = userRole?.toUpperCase() === 'SUPERADMIN' ||
          userRole?.toUpperCase() === 'ADMIN' ||
          userRole?.toUpperCase() === 'PLATFORM_SUPERADMIN' ||
          userRole?.toUpperCase() === 'PRODUCTION_MANAGER' ||
          userRole === 'Enterprise Master' ||
          userEmail === 'admin@zigza.in' ||
          userEmail === 'team.anga9@gmail.com' ||
          userEmail === 'aj@nubiracreation.com'

        const visibleNavTabs = (allowedTabs && allowedTabs.length > 0 && !isOwnerOrPM)
          ? navTabs.filter(t => allowedTabs.includes(t.id))
          : navTabs

        return (
          <>
            {/* Desktop Horizontal Tabs Bar */}
            <nav className="hidden md:block w-full bg-white border-b border-slate-200/80 overflow-x-auto scrollbar-none shadow-2xs">
              <div 
                className="w-full min-w-full grid"
                style={{ gridTemplateColumns: `repeat(${visibleNavTabs.length}, minmax(0, 1fr))` }}
              >
                {visibleNavTabs.map((tab, idx) => {
                  const Icon = tab.icon
                  const isLast = idx === visibleNavTabs.length - 1

                  const content = (
                    <>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                        <Icon
                          className={`w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] shrink-0 transition-colors ${
                            tab.isActive
                              ? 'text-[#0B1220]'
                              : 'text-slate-400 group-hover:text-[#0B1220]'
                          }`}
                          strokeWidth={1.75}
                        />
                      </div>
                      <div className="w-full px-0.5 text-center h-[30px] flex flex-col items-center justify-center">
                        <div
                          className={`text-[12px] sm:text-[13px] md:text-[13.5px] tracking-tight leading-[1.15] truncate ${
                            tab.isActive
                              ? 'font-medium text-[#0B1220]'
                              : 'font-normal text-slate-600 group-hover:text-[#0B1220]'
                          }`}
                        >
                          {tab.lines[0]}
                        </div>
                        {tab.lines[1] ? (
                          <div
                            className={`text-[10.5px] sm:text-[11.5px] tracking-tight leading-[1.15] truncate mt-[2px] ${
                              tab.isActive
                                ? 'font-normal text-[#0B1220]'
                                : 'font-normal text-slate-400 group-hover:text-[#0B1220]'
                            }`}
                          >
                            {tab.lines[1]}
                          </div>
                        ) : null}
                      </div>
                    </>
                  )

                  const sharedStyle = {
                    borderRight: isLast ? 'none' : '1px solid #E2E8F0',
                    borderBottom: tab.isActive ? '3px solid #0D9488' : '3px solid transparent'
                  }

                  if (tab.href) {
                    return (
                      <Link
                        key={tab.id}
                        href={tab.href}
                        className={`group relative w-full py-2 sm:py-2.5 px-1 flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                          tab.isActive
                            ? 'bg-[#E6FFFA] shadow-2xs'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                        style={sharedStyle}
                      >
                        {content}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => toast.info(`${tab.label} module is scheduled for the upcoming release.`)}
                      className="group relative w-full py-2 sm:py-2.5 px-1 flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer bg-white hover:bg-slate-50"
                      style={sharedStyle}
                    >
                      {content}
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Mobile Left Navigation Drawer */}
            {isMobileDrawerOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                  onClick={() => setIsMobileDrawerOpen(false)}
                />

                {/* Sliding Left Side Drawer */}
                <aside className="fixed inset-y-0 left-0 w-[84vw] max-w-[320px] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200 border-r border-slate-200">
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
                    <Link 
                      href="/modules" 
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <img src="/new icon.png" alt="" className="h-7 w-auto object-contain" />
                      <img src="/zigza new logo.png" alt="Zigza" className="h-5.5 w-auto object-contain" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
                      aria-label="Close Menu"
                    >
                      <X className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>

                  {/* Factory / Workspace Info Badge */}
                  <div className="px-4 py-3 bg-[#F0FDFA]/70 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Workspace</p>
                      <p className="text-xs font-black text-slate-900 truncate">{resolvedCompany}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#14C8B4]/15 text-[#0B1220] border border-[#14C8B4]/30">
                      {userRole}
                    </span>
                  </div>

                  {/* Mobile Side Nav Trial & Recharge Card (Visible ONLY if in Free Trial) */}
                  {subStatus.isTrial && (
                    <div className="mx-3 my-2.5 p-3 rounded-2xl bg-[#F0FDFA] border border-[#14C8B4]/30 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-[#0B1220]">
                          Free Trial Active
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#14C8B4]/15 text-[#0B1220] border border-[#14C8B4]/30">
                          {subStatus.daysLeft} Days Left
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug mb-2.5 font-medium">
                        Recharge your subscription to keep all manufacturing divisions active.
                      </p>
                      <button
                        type="button"
                        disabled={isRechargingMobile}
                        onClick={() => {
                          setIsRechargingMobile(true)
                          setIsMobileDrawerOpen(false)
                          window.location.href = '/profile?highlight=subscription#subscription'
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:opacity-80"
                      >
                        {isRechargingMobile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <span>Click here to recharge</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Tab Navigation List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Main Navigation
                    </div>
                    {visibleNavTabs.map((tab) => {
                      const Icon = tab.icon
                      const isCurrent = tab.isActive

                      const itemContent = (
                        <div
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs transition-all ${
                            isCurrent
                              ? 'bg-[#E6FFFA] text-[#0B1220] font-bold border border-[#14C8B4]/40 shadow-xs'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isCurrent ? 'bg-[#0B1220] text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                            </div>
                            <span className="truncate">{tab.label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#0D9488]' : 'text-slate-300'}`} />
                        </div>
                      )

                      if (tab.href) {
                        return (
                          <Link
                            key={tab.id}
                            href={tab.href}
                            onClick={() => setIsMobileDrawerOpen(false)}
                            className="block"
                          >
                            {itemContent}
                          </Link>
                        )
                      }

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setIsMobileDrawerOpen(false)
                            toast.info(`${tab.label} module is scheduled for the upcoming release.`)
                          }}
                          className="w-full block text-left"
                        >
                          {itemContent}
                        </button>
                      )
                    })}
                  </div>

                  {/* Drawer Footer Links */}
                  <div className="p-3 border-t border-slate-100 bg-[#F8FAFC] space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>Company Profile &amp; Settings</span>
                    </Link>
                    <Link
                      href="/stitching-sewing/notifications"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Floor Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <form
                      action="/auth/signout"
                      method="post"
                      className="pt-1"
                      onSubmit={() => {
                        try {
                          sessionStorage.clear()
                          localStorage.removeItem('trial_toast_shown')
                        } catch (e) {}
                      }}
                    >
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                </aside>
              </div>
            )}
          </>
        )
      })()}

      {/* Global In-App Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        companyName={resolvedCompany}
        daysLeft={subStatus.daysLeft}
        monthlyRate={subStatus.monthlyRate}
      />
    </div>
  )
}
