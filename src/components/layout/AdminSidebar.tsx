'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition, useEffect, useRef } from 'react'
import { 
  LayoutDashboard,
  Layers, 
  ClipboardList, 
  Warehouse, 
  Truck, 
  Users, 
  Tag, 
  FileText,
  Loader2,
  X,
  Bot
} from 'lucide-react'

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
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Zigza AI', href: '/zigza-ai', icon: Bot },
    ],
  },
  {
    section: 'Production',
    items: [
      { label: 'Production Chart', href: '/production-orders', icon: Layers },
      { label: 'Target Allotments', href: '/allotments', icon: ClipboardList },
      { label: 'Godown & Inventory', href: '/inventory', icon: Warehouse },
      { label: 'Dispatch & Challans', href: '/dispatch', icon: Truck },
    ],
  },
  {
    section: 'Manage',
    items: [
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'Articles', href: '/articles', icon: Tag },
      { label: 'Reports & Analytics', href: '/reports', icon: FileText },
    ],
  },
]

interface AdminSidebarProps {
  userEmail?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ 
  userEmail = 'admin@nubira.local',
  isMobileOpen = false,
  onMobileClose
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fast, eager open when cursor moves towards side nav
  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setIsHovered(true)
  }

  // Graceful, calm exit buffer when pulled away from side nav
  const handleMouseLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
    }
    // 280ms grace buffer + 700ms smooth cubic-bezier collapse = ~1s total graceful exit
    leaveTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 280)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
      }
    }
  }, [])

  // Reset loading state whenever the active route changes
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose()
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Generate initials for avatar
  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'SA'

  function handleNavClick(e: React.MouseEvent, href: string) {
    const isCurrentActive = href === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/'
      : pathname.startsWith(href)

    if (isCurrentActive) {
      e.preventDefault()
      onMobileClose?.()
      return
    }

    // Immediate visual state and drawer close; Next.js Link handles native instant prefetch & transition
    setNavigatingTo(href)
    onMobileClose?.()
  }

  // Render navigation item
  function renderNavItem(item: NavItem, isExpanded: boolean) {
    const Icon = item.icon
    const isActive = item.href === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/'
      : pathname.startsWith(item.href)
    const isLoading = navigatingTo === item.href

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={true}
        onClick={(e) => handleNavClick(e, item.href)}
        title={!isExpanded ? item.label : undefined}
        className={`relative flex items-center rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#3A3564] cursor-pointer ${
          isExpanded 
            ? 'px-3 py-2.5 justify-between w-full transition-all duration-200 ease-out' 
            : 'w-10 h-10 mx-auto justify-center transition-all duration-500 ease-in-out'
        } ${
          isActive
            ? 'font-bold text-[#3A3564] bg-[#FAF7F0] border border-black/10 shadow-2xs'
            : isLoading
              ? 'font-semibold text-[#3A3564] bg-[#FAF7F0]/80 border border-black/15 shadow-2xs'
              : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        {/* Left active accent bar */}
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
          {isLoading ? (
            <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
              <Loader2 className="w-[18px] h-[18px] text-[#3A3564] animate-spin" />
            </div>
          ) : (
            <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#3A3564]' : 'text-slate-500'}`} />
          )}

          {/* Label: expands quickly on open, fades out gracefully on close */}
          <span className={`overflow-hidden whitespace-nowrap transition-all ${
            isExpanded 
              ? 'max-w-[170px] opacity-100 truncate duration-200 ease-out' 
              : 'max-w-0 opacity-0 duration-400 ease-in-out'
          }`}>
            {item.label}
          </span>
        </div>

        {/* Pill indicator */}
        <div className={`overflow-hidden transition-all shrink-0 ${
          isExpanded 
            ? 'max-w-[90px] opacity-100 duration-200 ease-out' 
            : 'max-w-0 opacity-0 duration-400 ease-in-out'
        }`}>
          {isLoading ? (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-white px-2 py-0.5 rounded-md border border-black/10 animate-pulse whitespace-nowrap">
              Opening...
            </span>
          ) : item.badge ? (
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
      {/* ======================================================== */}
      {/* 1. DESKTOP HOVER-SLIDE SIDEBAR (Always icon-rail, slides open on cursor drag) */}
      {/* ======================================================== */}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-40 bg-white border-r border-slate-200 flex-col justify-between select-none ${
          isHovered 
            ? 'w-[264px] shadow-2xl transition-all duration-200 ease-out' 
            : 'w-[72px] shadow-xs transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'
        }`}
      >
        {/* Top Header / Logo Block */}
        <div className="border-b border-slate-200 h-[65px] flex items-center px-4 overflow-hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 w-full">
            {/* Collapsed Favicon */}
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

            {/* Expanded Full Logo */}
            <div className={`flex items-center overflow-hidden transition-all ${
              isHovered 
                ? 'opacity-100 max-w-[200px] duration-200 ease-out' 
                : 'opacity-0 max-w-0 duration-500 ease-in-out'
            }`}>
              <img 
                src="/z i g z a (1) copy.png" 
                alt="zigza." 
                className="h-9 w-auto object-contain rounded-xl shadow-2xs"
              />
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="p-2.5 py-4 space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
          {navSections.map((group) => (
            <div key={group.section} className="space-y-1">
              <div className={`overflow-hidden transition-all ${
                isHovered 
                  ? 'h-5 opacity-100 duration-200 ease-out' 
                  : 'h-2 opacity-0 duration-500 ease-in-out'
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

        {/* Bottom User Profile Block */}
        <div className="p-3.5 border-t border-slate-200 bg-[#FAFAF8] flex items-center overflow-hidden h-[65px]">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-xs bg-[#3A3564] mx-auto">
            {initials}
          </div>
          
          <div className={`flex flex-col min-w-0 transition-all ${
            isHovered 
              ? 'ml-3 max-w-[180px] opacity-100 flex-1 duration-200 ease-out' 
              : 'ml-0 max-w-0 opacity-0 duration-500 ease-in-out'
          }`}>
            <span 
              className="text-[13px] font-bold text-slate-900 truncate leading-tight"
              title={userEmail}
            >
              {userEmail}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Super Admin
            </span>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER OVERLAY (below lg)                       */}
      {/* ======================================================== */}
      {/* Backdrop */}
      <div 
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
      />

      {/* Drawer Panel */}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-4 pb-3.5 border-b border-slate-200 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <img 
                src="/z i g z a (1) copy.png" 
                alt="zigza." 
                className="h-9 w-auto object-contain rounded-xl shadow-2xs"
              />
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                ERP MES
              </span>
              {onMobileClose && (
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((group) => (
              <div key={group.section} className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-[1.5px] mb-2 text-slate-400 font-mono">
                  {group.section}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => renderNavItem(item, true))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User */}
        <div className="p-4 border-t border-slate-200 bg-[#FAFAF8] flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-xs bg-[#3A3564]">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-bold text-slate-900 truncate leading-tight">
              {userEmail}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Super Admin
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
