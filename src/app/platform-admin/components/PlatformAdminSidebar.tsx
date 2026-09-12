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
  Sparkles,
  Server,
  Layers,
  ChevronRight,
  ExternalLink
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
      { label: 'View Enterprise Modules', href: '/modules', icon: Layers, badge: '11 Units' },
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
    }, 280)
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
        className={`relative flex items-center rounded-xl text-sm outline-none transition-all duration-200 cursor-pointer ${
          isExpanded
            ? 'px-3 py-2.5 justify-between w-full'
            : 'w-10 h-10 mx-auto justify-center'
        } ${
          isActive
            ? 'bg-[#FAF7F0] text-[#3A3564] font-bold border border-black/10 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
        }`}
      >
        <div className="flex items-center min-w-0">
          <Icon
            className={`shrink-0 transition-colors ${
              isActive ? 'text-[#3A3564]' : 'text-slate-500'
            } ${isExpanded ? 'w-4 h-4 mr-3' : 'w-5 h-5'}`}
          />
          {isExpanded && (
            <span className="truncate text-xs font-mono font-bold tracking-tight">
              {item.label}
            </span>
          )}
        </div>

        {isExpanded && item.badge && (
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
            isActive 
              ? 'bg-[#3A3564] text-white border-[#3A3564]' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* 1. DESKTOP EXPANDABLE SIDEBAR (lg and above) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:flex fixed top-0 left-0 z-40 h-screen bg-white border-r border-black/10 flex-col justify-between shadow-2xs select-none ${
          isHovered
            ? 'w-[260px] duration-200 ease-out'
            : 'w-[72px] duration-500 ease-in-out'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-4 pb-3 flex items-center justify-between border-b border-black/5 min-h-[64px]">
            <Link href="/platform-admin" className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/z i g z a (2).png"
                alt="zigza."
                className="h-8 w-auto object-contain rounded-lg shrink-0 shadow-2xs"
              />
            </Link>
            {isHovered && (
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3A3564] text-white animate-in fade-in duration-150 shrink-0">
                ROOT ADMIN
              </span>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((group) => (
              <div key={group.section} className="space-y-1">
                {isHovered && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 font-mono mb-1.5 animate-in fade-in duration-150">
                    {group.section}
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => renderNavItem(item, isHovered))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Root Profile & Sign Out */}
        <div className="p-3 border-t border-black/10 bg-[#FAF7F0]/60 flex items-center justify-between gap-2">
          <Link
            href="/platform-admin/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#3A3564] text-white flex items-center justify-center text-xs font-black font-mono shrink-0 shadow-xs">
              RA
            </div>
            {isHovered && (
              <div className="flex flex-col min-w-0 flex-1 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {userEmail}
                </span>
                <span className="text-[10px] font-mono text-[#3A3564] font-bold">
                  Platform SuperAdmin ↗
                </span>
              </div>
            )}
          </Link>

          {isHovered && (
            <form action="/auth/signout" method="POST" className="shrink-0 animate-in fade-in duration-150">
              <button
                type="submit"
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          )}
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
          <div className="p-4 pb-3.5 border-b border-black/10 flex items-center justify-between">
            <Link href="/platform-admin" className="flex items-center gap-2">
              <img
                src="/z i g z a (2).png"
                alt="zigza."
                className="h-8 w-auto object-contain rounded-lg shadow-2xs"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#3A3564] text-white">
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
                <div className="px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 font-mono mb-1.5">
                  {group.section}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => renderNavItem(item, true))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-[#3A3564] text-white flex items-center justify-center text-xs font-black font-mono shrink-0">
              RA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {userEmail}
              </span>
              <span className="text-[10px] font-mono text-[#3A3564] font-bold">
                Platform SuperAdmin
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
