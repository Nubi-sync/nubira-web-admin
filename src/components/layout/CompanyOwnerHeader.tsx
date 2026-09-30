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
  User
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

interface CompanyOwnerHeaderProps {
  userEmail?: string
  userRole?: string
  companyName?: string
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
  companyName
}: CompanyOwnerHeaderProps) {
  const pathname = usePathname()

  const [unreadCount, setUnreadCount] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const createRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

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

  // Close dropdowns on route change
  useEffect(() => {
    setIsCreateOpen(false)
    setIsProfileOpen(false)
  }, [pathname])

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
      href: '/vendors',
      icon: BuyersVendorsNavIcon,
      isActive: pathname === '/vendors' || pathname?.startsWith('/vendors') || pathname === '/buyers-vendors'
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
      href: '/store',
      icon: FabricStoreNavIcon,
      isActive: pathname === '/store' || pathname?.startsWith('/store') || pathname === '/fabric-store'
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
      <header className="w-full bg-white text-[#0B1220] px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-200/80">
        {/* Left Section: Brand Logo + Company Name */}
        <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
          <Link href="/modules" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <img
              src="/new icon.png"
              alt=""
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-150 group-hover:scale-105 shrink-0"
            />
            <img
              src="/zigza new logo.png"
              alt="Zigza"
              className="h-6 sm:h-7 md:h-7.5 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02] shrink-0"
            />
          </Link>

          <span className="h-7 sm:h-8 w-px bg-slate-200 hidden sm:inline-block" />

          <div className="flex items-center min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-[#0B1220] tracking-tight truncate font-[family-name:var(--font-heading)]">
              {resolvedCompany}
            </h1>
          </div>
        </div>

        {/* Right Section: Actions (+ Create, Notification Bell, User Account) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* + Create Dropdown */}
          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="bg-[#0B1220] text-white hover:bg-[#162032] px-4 sm:px-5 py-2.5 rounded-xl text-sm sm:text-[15px] font-bold shadow-xs hover:shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[2.5] text-[#14C8B4]" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="w-4 h-4 text-white/80" />
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
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] transition-colors shadow-xs"
            title="Floor Notifications"
          >
            <Bell className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#0B1220]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] font-bold transition-all cursor-pointer shadow-xs overflow-hidden"
              aria-label="User Account"
            >
              <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#0B1220]" />
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
                  <form action="/auth/signout" method="post">
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

      {/* 2. RECTANGULAR HORIZONTAL SUB-NAVBAR */}
      <nav className="w-full bg-white border-b border-slate-200/80 overflow-x-auto scrollbar-none shadow-2xs">
        <div className="w-full min-w-[860px] md:min-w-full grid grid-cols-9">
          {navTabs.map((tab, idx) => {
            const Icon = tab.icon
            const isLast = idx === navTabs.length - 1

            const content = (
              <>
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                  <Icon
                    className={`w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] shrink-0 transition-colors ${
                      tab.isActive
                        ? 'text-[#0B1220]'
                        : 'text-slate-400 group-hover:text-[#0B1220]'
                    }`}
                    strokeWidth={tab.isActive ? 2 : 1.6}
                  />
                </div>
                <div className="w-full px-0.5 text-center h-[30px] flex flex-col items-center justify-center">
                  <div
                    className={`text-[12px] sm:text-[13px] md:text-[13.5px] tracking-tight leading-[1.15] truncate ${
                      tab.isActive
                        ? 'font-extrabold text-[#0B1220]'
                        : 'font-bold text-slate-600 group-hover:text-[#0B1220]'
                    }`}
                  >
                    {tab.lines[0]}
                  </div>
                  {tab.lines[1] ? (
                    <div
                      className={`text-[10.5px] sm:text-[11.5px] tracking-tight leading-[1.15] truncate mt-[2px] ${
                        tab.isActive
                          ? 'font-bold text-[#0B1220]'
                          : 'font-semibold text-slate-400 group-hover:text-[#0B1220]'
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
              borderBottom: tab.isActive ? '3px solid #0B1220' : '3px solid transparent'
            }

            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`group relative w-full py-2 sm:py-2.5 px-1 flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                    tab.isActive
                      ? 'bg-[#F0FDFA]/50 shadow-2xs'
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
    </div>
  )
}
