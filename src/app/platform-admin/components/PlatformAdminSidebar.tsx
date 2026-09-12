'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  Inbox,
  Building2,
  Key,
  Activity,
  ShieldCheck,
  User,
  LogOut,
  X,
  Layers,
  ChevronRight
} from 'lucide-react'

interface PlatformAdminSidebarProps {
  userEmail?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

type NavSection = {
  section: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    section: 'Platform Command',
    items: [
      { label: 'Demo Leads & Inquiries', href: '/platform-admin', icon: Inbox, badge: 'Live' },
      { label: 'Tenant Factories', href: '/platform-admin/tenants', icon: Building2 },
      { label: 'Access Provisioning', href: '/platform-admin/provisioning', icon: Key },
      { label: 'Infrastructure Telemetry', href: '/platform-admin/infrastructure', icon: Activity },
      { label: 'Security & Audit Logs', href: '/platform-admin/audit-logs', icon: ShieldCheck },
    ],
  },
  {
    section: 'Root Master',
    items: [
      { label: 'SuperAdmin Profile', href: '/platform-admin/profile', icon: User },
      { label: '11 Enterprise Modules', href: '/platform-admin/modules', icon: Layers, badge: '11 Units' },
    ],
  },
]

export function PlatformAdminSidebar({
  userEmail = 'admin@zigza.in',
  isMobileOpen = false,
  onMobileClose,
}: PlatformAdminSidebarProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 250)
  }

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
      }
    }
  }, [])

  function checkIsCurrentActive(href: string, currentPath: string) {
    if (href === '/platform-admin') {
      return currentPath === '/platform-admin'
    }
    return currentPath === href || currentPath.startsWith(href + '/')
  }

  function renderNavItem(item: NavItem, isExpanded: boolean) {
    const Icon = item.icon
    const isActive = checkIsCurrentActive(item.href, pathname)

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={true}
        onClick={() => onMobileClose?.()}
        title={!isExpanded ? item.label : undefined}
        className={`relative flex items-center rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#3A3564] cursor-pointer ${
          isExpanded
            ? 'px-3 py-2.5 justify-between w-full transition-all duration-200 ease-out'
            : 'w-10 h-10 mx-auto justify-center transition-all duration-500 ease-in-out'
        } ${
          isActive
            ? 'bg-[#FAF7F0] text-[#3A3564] font-bold border border-black/10 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
        }`}
      >
        {/* Left active accent bar matching AdminSidebar */}
        {isActive && (
          <div 
            className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-[#3A3564] transition-all ${
              isExpanded ? 'w-[3.5px] h-6 duration-200' : 'w-[3px] h-5 duration-500'
            }`}
          />
        )}

        <div className={`flex items-center min-w-0 transition-all ${
          isExpanded ? 'gap-3 flex-1 duration-200' : 'justify-center duration-500'
        }`}>
          <Icon
            className={`w-[18px] h-[18px] shrink-0 transition-colors ${
              isActive ? 'text-[#3A3564]' : 'text-slate-500'
            }`}
          />
          <span className={`overflow-hidden whitespace-nowrap transition-all text-sm ${
            isExpanded 
              ? 'max-w-[170px] opacity-100 truncate duration-200 ease-out font-medium' 
              : 'max-w-0 opacity-0 duration-400 ease-in-out'
          } ${isActive ? 'font-bold text-[#3A3564]' : 'text-slate-700'}`}>
            {item.label}
          </span>
        </div>

        {/* Pill Badge */}
        <div className={`overflow-hidden transition-all shrink-0 ${
          isExpanded 
            ? 'max-w-[90px] opacity-100 duration-200 ease-out' 
            : 'max-w-0 opacity-0 duration-400 ease-in-out'
        }`}>
          {item.badge ? (
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] border border-black/15 px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap">
              {item.badge}
            </span>
          ) : null}
        </div>
      </Link>
    )
  }

  return (
    <>
      {/* 1. DESKTOP EXPANDABLE SIDEBAR (lg and above) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:flex fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200 flex-col justify-between shadow-xs select-none ${
          isHovered
            ? 'w-[264px] shadow-2xl transition-all duration-200 ease-out'
            : 'w-[72px] shadow-xs transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'
        }`}
      >
        {/* Top Branding / Logo Block */}
        <div>
          <div className="border-b border-slate-200 h-[65px] flex items-center px-4 overflow-hidden">
            <Link href="/platform-admin" className="flex items-center gap-2.5 min-w-0 w-full">
              {/* Collapsed Favicon (Shown when sidebar is closed) */}
              <div className={`shrink-0 flex items-center justify-center transition-all ${
                isHovered 
                  ? 'w-0 opacity-0 overflow-hidden duration-200 ease-out' 
                  : 'w-10 h-10 opacity-100 mx-auto duration-500 ease-in-out'
              }`}>
                <img 
                  src="/favicon.ico" 
                  alt="zigza." 
                  className="w-9 h-9 object-contain rounded-xl shadow-xs"
                />
              </div>

              {/* Expanded Full Logo + ROOT Badge (Shown when sidebar expands) */}
              <div className={`flex items-center justify-between w-full overflow-hidden transition-all ${
                isHovered 
                  ? 'opacity-100 max-w-[220px] duration-200 ease-out' 
                  : 'opacity-0 max-w-0 duration-500 ease-in-out'
              }`}>
                <img 
                  src="/z i g z a (2).png" 
                  alt="zigza." 
                  className="h-9 w-auto object-contain rounded-xl shadow-2xs"
                />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3A3564] text-white shrink-0 shadow-2xs ml-2">
                  ROOT
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-2.5 py-4 space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
            {navSections.map((group) => (
              <div key={group.section} className="space-y-1">
                <div className={`overflow-hidden transition-all ${
                  isHovered 
                    ? 'h-5 opacity-100 duration-200 ease-out mb-1.5' 
                    : 'h-0 opacity-0 duration-500 ease-in-out'
                }`}>
                  <div className="px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 font-mono whitespace-nowrap">
                    {group.section}
                  </div>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => renderNavItem(item, isHovered))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Root Profile & Sign Out */}
        <div className={`p-3.5 border-t transition-colors flex items-center overflow-hidden h-[65px] ${
          pathname === '/platform-admin/profile'
            ? 'bg-[#FAF7F0] border-[#3A3564]/30 shadow-2xs'
            : 'border-slate-200 bg-[#FAFAF8] hover:bg-slate-50'
        }`}>
          <Link
            href="/platform-admin/profile"
            className="flex items-center min-w-0 flex-1 group"
            title="SuperAdmin Profile"
          >
            <div className={`w-9 h-9 rounded-full bg-[#3A3564] text-white flex items-center justify-center text-[13px] font-bold font-mono shrink-0 shadow-xs mx-auto transition-all ${
              pathname === '/platform-admin/profile'
                ? 'ring-2 ring-[#3A3564] ring-offset-2 ring-offset-[#FAF7F0]'
                : 'group-hover:ring-2 group-hover:ring-[#3A3564]/30'
            }`}>
              RA
            </div>

            <div className={`flex items-center min-w-0 transition-all ${
              isHovered 
                ? 'ml-3 max-w-[155px] opacity-100 flex-1 duration-200 ease-out' 
                : 'ml-0 max-w-0 opacity-0 duration-500 ease-in-out'
            }`}>
              <div className="flex flex-col min-w-0 flex-1">
                <span 
                  className={`text-[13px] font-bold truncate leading-tight transition-colors ${
                    pathname === '/platform-admin/profile' ? 'text-[#3A3564]' : 'text-slate-900 group-hover:text-[#3A3564]'
                  }`}
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <span className="text-[11px] font-mono text-[#3A3564] font-semibold leading-tight">
                  Root SuperAdmin
                </span>
              </div>
            </div>
          </Link>

          <div className={`overflow-hidden transition-all shrink-0 ${
            isHovered 
              ? 'max-w-[40px] opacity-100 duration-200 ease-out' 
              : 'max-w-0 opacity-0 duration-400 ease-in-out'
          }`}>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER OVERLAY (below lg) */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
      />

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-4 pb-3.5 border-b border-slate-200 flex items-center justify-between h-[65px]">
            <Link href="/platform-admin" className="flex items-center gap-2">
              <img 
                src="/favicon.ico" 
                alt="zigza." 
                className="w-7 h-7 object-contain rounded-lg shadow-xs"
              />
              <img
                src="/z i g z a (2).png"
                alt="zigza."
                className="h-7 w-auto object-contain rounded-xl shadow-2xs ml-1"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#3A3564] text-white">
                ROOT
              </span>
              <button
                type="button"
                onClick={onMobileClose}
                className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((group) => (
              <div key={group.section} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 font-mono mb-2">
                  {group.section}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => renderNavItem(item, true))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 bg-[#FAF7F0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-[#3A3564] text-white flex items-center justify-center text-[13px] font-bold font-mono shrink-0 shadow-xs">
              RA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-900 truncate font-[family-name:var(--font-heading)]">
                {userEmail}
              </span>
              <span className="text-[11px] font-mono text-[#3A3564] font-semibold">
                Root SuperAdmin
              </span>
            </div>
          </div>

          <form action="/auth/signout" method="POST" className="shrink-0">
            <button
              type="submit"
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
