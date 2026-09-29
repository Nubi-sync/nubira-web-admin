'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LayoutGrid,
  Building2,
  Users,
  Palette,
  Warehouse,
  Bot,
  FileText,
  User,
  Plus,
  ChevronDown,
  Bell,
  LogOut,
  Layers,
  Scissors,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react'
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
  icon: React.ComponentType<{ className?: string }>
  isClickable: boolean
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
  const [isFyOpen, setIsFyOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedFy, setSelectedFy] = useState('F.Y. 2026-2027')

  const createRef = useRef<HTMLDivElement>(null)
  const fyRef = useRef<HTMLDivElement>(null)
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
      if (fyRef.current && !fyRef.current.contains(e.target as Node)) {
        setIsFyOpen(false)
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
    setIsFyOpen(false)
    setIsProfileOpen(false)
  }, [pathname])

  const resolvedCompany = companyName && companyName.trim() && companyName !== 'Account Deactivated'
    ? companyName.trim()
    : 'Apparel Factory'

  // Exact 9 Tabs in the user's requested order:
  // 1. Dashboard
  // 2. All Modules
  // 3. Buyers & Vendors
  // 4. Supervisor & Workers
  // 5. All Designs
  // 6. Fabric & Store
  // 7. Zigza AI
  // 8. Reports
  // 9. Company Profile
  const navTabs: NavTabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      lines: ['Dashboard'],
      icon: LayoutDashboard,
      isClickable: false,
      isActive: false
    },
    {
      id: 'all-modules',
      label: 'All Modules',
      lines: ['All Modules'],
      href: '/modules',
      icon: LayoutGrid,
      isClickable: true,
      isActive: pathname === '/modules'
    },
    {
      id: 'buyers-vendors',
      label: 'Buyers & Vendors',
      lines: ['Buyers &', 'Vendors'],
      icon: Building2,
      isClickable: false,
      isActive: false
    },
    {
      id: 'supervisor-workers',
      label: 'Supervisor & Workers',
      lines: ['Supervisor &', 'Workers'],
      href: '/modules/access-control',
      icon: Users,
      isClickable: true,
      isActive: pathname === '/modules/access-control' || pathname?.startsWith('/modules/access-control') || pathname === '/access-control'
    },
    {
      id: 'all-designs',
      label: 'All Designs',
      lines: ['All Designs'],
      href: '/design/sa-approvals',
      icon: Palette,
      isClickable: true,
      isActive: pathname === '/design/sa-approvals' || pathname?.startsWith('/design/sa-approvals')
    },
    {
      id: 'fabric-store',
      label: 'Fabric & Store',
      lines: ['Fabric &', 'Store'],
      icon: Warehouse,
      isClickable: false,
      isActive: false
    },
    {
      id: 'zigza-ai',
      label: 'Zigza AI',
      lines: ['Zigza AI'],
      href: '/zigza-ai',
      icon: Bot,
      isClickable: true,
      isActive: pathname === '/zigza-ai' || pathname?.startsWith('/zigza-ai')
    },
    {
      id: 'reports',
      label: 'Reports',
      lines: ['Reports'],
      icon: FileText,
      isClickable: false,
      isActive: false
    },
    {
      id: 'company-profile',
      label: 'Company Profile',
      lines: ['Company', 'Profile'],
      href: '/modules/profile',
      icon: User,
      isClickable: true,
      isActive: pathname === '/modules/profile' || pathname?.startsWith('/modules/profile') || pathname === '/profile'
    }
  ]

  return (
    <div className="w-full select-none z-30 sticky top-0 font-[family-name:var(--font-public-sans)]">
      {/* 1. MINIMAL TOP BRAND NAVBAR (#0F172A Minimal Deep Slate) */}
      <header className="w-full bg-[#0F172A] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-xs">
        {/* Left Section: Crisp Brand Logo + Actual Company Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/modules" className="flex items-center shrink-0">
            <img
              src="/z i g z a (8).png"
              alt="Zigza"
              className="h-7 sm:h-8 w-auto object-contain brightness-0 invert opacity-95"
            />
          </Link>

          <span className="h-5 w-px bg-slate-700 hidden sm:inline-block" />

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate font-[family-name:var(--font-heading)]">
              {resolvedCompany}
            </h1>
            <span className="hidden md:inline-flex items-center text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
              Super Admin
            </span>
          </div>
        </div>

        {/* Right Section: Actions (+ Create, FY Selector, Notifications, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* + Create Dropdown */}
          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="bg-white text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isCreateOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Quick Actions
                </div>
                <Link
                  href="/modules/access-control"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors font-semibold text-slate-700 hover:text-slate-900"
                >
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Appoint Department Head</span>
                </Link>
                <Link
                  href="/design/sa-approvals"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors font-semibold text-slate-700 hover:text-slate-900"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Review Design Approvals</span>
                </Link>
                <Link
                  href="/cutting"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <Scissors className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Open Cutting Floor</span>
                </Link>
                <Link
                  href="/stitching-sewing/dashboard"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Open Sewing Dashboard</span>
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <Link
                  href="/modules/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Company Profile &amp; Units</span>
                </Link>
              </div>
            )}
          </div>

          {/* F.Y. Selector */}
          <div className="relative hidden md:block" ref={fyRef}>
            <button
              type="button"
              onClick={() => setIsFyOpen(!isFyOpen)}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{selectedFy}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isFyOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs font-medium">
                <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Financial Year
                </div>
                {['F.Y. 2026-2027', 'F.Y. 2025-2026', 'F.Y. 2024-2025'].map((fy) => (
                  <button
                    key={fy}
                    type="button"
                    onClick={() => { setSelectedFy(fy); setIsFyOpen(false) }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      selectedFy === fy ? 'font-bold text-slate-900 bg-slate-50' : 'text-slate-600'
                    }`}
                  >
                    <span>{fy}</span>
                    {selectedFy === fy && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <Link
            href="/stitching-sewing/notifications"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Floor Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-2xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs transition-all cursor-pointer overflow-hidden"
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 text-sm truncate">{resolvedCompany}</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{userEmail}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                    {userRole}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/modules/profile"
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Company Profile &amp; Settings</span>
                  </Link>
                  <Link
                    href="/modules/access-control"
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Appointed Department Heads</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
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

      {/* 2. MINIMAL HORIZONTAL SUB-NAVBAR (9 Tabs with 2-line Text Support) */}
      <nav className="w-full bg-white border-b border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-stretch min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon

            if (!tab.isClickable) {
              return (
                <div
                  key={tab.id}
                  className="px-3.5 sm:px-4.5 py-2.5 sm:py-3 flex flex-col items-center justify-center text-center gap-1 border-r border-slate-200/80 first:border-l border-b-[3px] border-transparent text-slate-400 cursor-default select-none min-w-[95px] sm:min-w-[110px]"
                  title={`${tab.label} (Coming Soon)`}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 stroke-[1.8]" />
                    <span className="absolute -top-1 -right-1 text-slate-400">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-[11.5px] font-medium leading-tight text-center max-w-[85px]">
                    <div>{tab.lines[0]}</div>
                    {tab.lines[1] && <div>{tab.lines[1]}</div>}
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={tab.id}
                href={tab.href || '#'}
                className={`group px-3.5 sm:px-4.5 py-2.5 sm:py-3 flex flex-col items-center justify-center text-center gap-1 transition-all border-r border-slate-200/80 first:border-l min-w-[95px] sm:min-w-[110px] ${
                  tab.isActive
                    ? 'border-b-[3px] border-[#EA580C] bg-slate-50/60 text-slate-950 font-bold'
                    : 'border-b-[3px] border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/40 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    tab.isActive
                      ? 'text-[#0F172A] stroke-[2.3]'
                      : 'text-slate-400 group-hover:text-slate-700 stroke-[2]'
                  }`}
                />
                <div className="text-[11px] sm:text-[11.5px] leading-tight text-center max-w-[85px]">
                  <div>{tab.lines[0]}</div>
                  {tab.lines[1] && <div>{tab.lines[1]}</div>}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
