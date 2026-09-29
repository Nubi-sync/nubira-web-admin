'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Building2,
  Plus,
  ChevronDown,
  Bell,
  User,
  LogOut,
  Layers,
  Scissors,
  CheckCircle2,
  Bot
} from 'lucide-react'
import { getUnreadNotificationCount, FLOOR_NOTIFICATIONS_UPDATE_EVENT } from '@/utils/floorNotificationsStorage'

interface CompanyOwnerHeaderProps {
  userEmail?: string
  userRole?: string
  companyName?: string
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
    : 'Trial Company'

  // Primary horizontal navigation items (From Admin Workspace Hub)
  const navItems = [
    {
      label: 'All Modules',
      href: '/modules',
      icon: LayoutGrid,
      isActive: pathname === '/modules'
    },
    {
      label: 'Department Heads',
      href: '/modules/access-control',
      icon: ShieldCheck,
      isActive: pathname === '/modules/access-control' || pathname?.startsWith('/modules/access-control') || pathname === '/access-control'
    },
    {
      label: 'SA Design Approvals',
      href: '/design/sa-approvals',
      icon: Sparkles,
      isActive: pathname === '/design/sa-approvals' || pathname?.startsWith('/design/sa-approvals')
    },
    {
      label: 'Company Profile',
      href: '/modules/profile',
      icon: Building2,
      isActive: pathname === '/modules/profile' || pathname?.startsWith('/modules/profile') || pathname === '/profile'
    }
  ]

  const handleOpenAiCopilot = () => {
    window.dispatchEvent(new CustomEvent('open-ai-copilot'))
  }

  return (
    <div className="w-full select-none z-30 sticky top-0">
      {/* 1. TOP BRAND NAVBAR (Deep Brand Navy #1B2A4A) */}
      <header className="w-full bg-[#1B2A4A] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-[#101D36] shadow-xs">
        {/* Left Section: Brand Logo + Company Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/modules" className="flex items-center shrink-0">
            <img
              src="/z i g z a (8).png"
              alt="Zigza"
              className="h-7 sm:h-8 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <span className="h-5 w-px bg-white/20 hidden sm:inline-block" />

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight truncate font-[family-name:var(--font-heading)]">
              {resolvedCompany}
            </h1>
            <span className="hidden md:inline-flex items-center text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15 shrink-0">
              Super Admin
            </span>
          </div>
        </div>

        {/* Right Section: Actions (+ Create, FY, Feedback/AI, Notifications, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* + Create Dropdown */}
          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="bg-white text-[#1B2A4A] hover:bg-slate-100 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
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
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
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
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{selectedFy}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
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
                      selectedFy === fy ? 'font-bold text-[#1B2A4A] bg-slate-50/80' : 'text-slate-600'
                    }`}
                  >
                    <span>{fy}</span>
                    {selectedFy === fy && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Feedback / AI Copilot Trigger */}
          <button
            type="button"
            onClick={handleOpenAiCopilot}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Zigza AI Assistant & Support"
            aria-label="Zigza AI Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <Link
            href="/stitching-sewing/notifications"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors"
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white font-bold text-xs transition-all cursor-pointer overflow-hidden shadow-2xs"
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
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
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

      {/* 2. HORIZONTAL SUB-NAVBAR (Pure White with Coral/Orange Bottom Active Accent) */}
      <nav className="w-full bg-white border-b border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-stretch min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group px-6 sm:px-8 py-2.5 sm:py-3 flex flex-col items-center justify-center text-center gap-1 transition-all border-r border-slate-200/80 first:border-l ${
                  item.isActive
                    ? 'border-b-[3px] border-[#EA580C] bg-slate-50/60 text-slate-950 font-bold'
                    : 'border-b-[3px] border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/40 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    item.isActive
                      ? 'text-[#1B2A4A] stroke-[2.3]'
                      : 'text-slate-400 group-hover:text-slate-700 stroke-[2]'
                  }`}
                />
                <span className="text-xs sm:text-[13px] tracking-tight">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
