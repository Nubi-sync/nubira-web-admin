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
  Building2,
  Loader2,
  X,
  Bot,
  LogOut,
  User,
  Store,
  Boxes,
  LayoutGrid,
  Factory,
  Briefcase,
  Waves,
  Printer,
  Sparkles,
  Scissors,
  Palette,
  Flame,
  Wrench,
  FileCheck2,
  Ruler
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
    section: 'Workspace Hub',
    items: [
      { label: 'All Modules', href: '/modules', icon: LayoutGrid, badge: '11 Units' },
    ],
  },
  {
    section: 'Sewing Floor',
    items: [
      { label: 'Dashboard', href: '/stitching-sewing/dashboard', icon: LayoutDashboard },
      { label: 'Store Dashboard', href: '/stitching-sewing/store', icon: Store },
      { label: 'Zigza AI', href: '/stitching-sewing/zigza-ai', icon: Bot },
    ],
  },
  {
    section: 'Production',
    items: [
      { label: 'Production Chart', href: '/stitching-sewing/production-orders', icon: Layers },
      { label: 'Target Allotments', href: '/stitching-sewing/allotments', icon: ClipboardList },
      { label: 'Godown & Inventory', href: '/stitching-sewing/inventory', icon: Warehouse },
      { label: 'Dispatch & Challans', href: '/stitching-sewing/dispatch', icon: Truck },
    ],
  },
  {
    section: 'Manage',
    items: [
      { label: 'Profile', href: '/stitching-sewing/profile', icon: User },
      { label: 'Brands & Vendors', href: '/stitching-sewing/vendors', icon: Building2 },
      { label: 'Employees', href: '/stitching-sewing/employees', icon: Users },
      { label: 'Articles', href: '/stitching-sewing/articles', icon: Tag },
      { label: 'Reports & Analytics', href: '/stitching-sewing/reports', icon: FileText },
    ],
  },
]

interface AdminSidebarProps {
  userEmail?: string
  userRole?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ 
  userEmail = 'admin@nubira.local',
  userRole,
  isMobileOpen = false,
  onMobileClose
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isStoreUser = (
    userRole?.toUpperCase() === 'STORE' ||
    userRole?.toUpperCase() === 'STORE_SUPERVISOR' ||
    userRole?.toUpperCase() === 'GODOWN' ||
    userEmail?.toLowerCase().startsWith('store@') ||
    userEmail?.toLowerCase() === 'store'
  )

  // Module-specific unique side navigation
  let activeNavSections: NavSection[] = []

  if (isStoreUser && !pathname?.startsWith('/modules')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: 'Godown Shift',
        items: [
          { label: 'Store Dashboard', href: '/stitching-sewing/store', icon: Store },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Profile', href: '/stitching-sewing/store', icon: User },
        ],
      },
    ]
  } else if (pathname === '/modules' || pathname?.startsWith('/modules')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid, badge: '11 Units' },
          { label: 'Company Profile', href: '/modules/profile', icon: Building2 },
          { label: 'Zigza AI', href: '/modules/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Operating Divisions (1–5)',
        items: [
          { label: '1. Design Studio', href: '/modules/design', icon: Palette },
          { label: '2. Merchandising', href: '/modules/merchandising', icon: Briefcase },
          { label: '3. Cutting Floor', href: '/modules/cutting', icon: Scissors },
          { label: '4. Printing Unit', href: '/modules/printing', icon: Printer },
          { label: '5. Embroidery Unit', href: '/modules/embroidery', icon: Sparkles },
        ],
      },
      {
        section: 'Operating Divisions (6–11)',
        items: [
          { label: '6. Stitching & Sewing', href: '/modules/stitching-sewing', icon: Layers },
          { label: '7. Industrial Washing', href: '/modules/washing', icon: Waves },
          { label: '8. Steam Ironing', href: '/modules/iron', icon: Flame },
          { label: '9. Ready Goods & Packing', href: '/modules/ready-goods', icon: Boxes },
          { label: '10. Alteration & Rework', href: '/modules/alter', icon: Wrench },
          { label: '11. Central Store', href: '/modules/store', icon: Store },
        ],
      },
    ]
  } else if (pathname?.startsWith('/design')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '1. Design Studio',
        items: [
          { label: 'Studio Dashboard', href: '/design', icon: Palette },
          { label: 'Tech-Pack Catalog', href: '/design/tech-packs', icon: FileCheck2 },
          { label: 'Sample Approvals (PPS)', href: '/design/sample-approvals', icon: Sparkles },
          { label: 'Size Grading Matrix', href: '/design/grading-matrix', icon: Ruler },
          { label: 'Fabric & Trims Library', href: '/design/materials-library', icon: Layers },
          { label: 'Zigza AI Copilot', href: '/design/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Studio Profile', href: '/design/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/merchandising')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '2. Merchandising',
        items: [
          { label: 'Merchandising & POs', href: '/merchandising', icon: Briefcase },
          { label: 'Zigza AI', href: '/merchandising/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/merchandising/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/cutting')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '3. Cutting Floor',
        items: [
          { label: 'Cutting & Lay Sheets', href: '/cutting', icon: Scissors },
          { label: 'Zigza AI', href: '/cutting/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/cutting/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/printing')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '4. Printing Division',
        items: [
          { label: 'Screen & Digital Print', href: '/printing', icon: Printer },
          { label: 'Zigza AI', href: '/printing/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/printing/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/embroidery')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '5. Embroidery Division',
        items: [
          { label: 'Multi-Head Embroidery', href: '/embroidery', icon: Sparkles },
          { label: 'Zigza AI', href: '/embroidery/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/embroidery/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/washing')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '7. Washing Division',
        items: [
          { label: 'Industrial Washing', href: '/washing', icon: Waves },
          { label: 'Zigza AI', href: '/washing/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/washing/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/iron')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '8. Steam Ironing',
        items: [
          { label: 'Ironing & Finishing', href: '/iron', icon: Flame },
          { label: 'Zigza AI', href: '/iron/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/iron/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/ready-goods')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '9. Ready Goods',
        items: [
          { label: 'Ready Stock & Packing', href: '/ready-goods', icon: Boxes },
          { label: 'Zigza AI', href: '/ready-goods/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/ready-goods/profile', icon: User },
        ],
      },
    ]
  } else if (pathname?.startsWith('/alter')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '10. Alteration Unit',
        items: [
          { label: 'Alteration & Rework', href: '/alter', icon: Wrench },
          { label: 'Zigza AI', href: '/alter/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/alter/profile', icon: User },
        ],
      },
    ]
  } else if (pathname === '/store' || (pathname?.startsWith('/store') && !pathname?.startsWith('/stitching-sewing/store'))) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '11. Central Store',
        items: [
          { label: 'Store & Godown Ops', href: '/store', icon: Store },
          { label: 'Zigza AI', href: '/store/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/store/profile', icon: User },
        ],
      },
    ]
  } else {
    // Default to full 6. Stitching & Sewing Floor Nav (Preserved)
    activeNavSections = navSections
  }

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

  function itemIsExactMatch(href: string, currentPath: string) {
    if (href === currentPath) return true
    if (
      (href === '/stitching-sewing/dashboard' || href === '/dashboard') &&
      (currentPath === '/' || currentPath === '/dashboard' || currentPath === '/stitching-sewing/dashboard')
    ) {
      return true
    }
    return false
  }

  function checkIsCurrentActive(href: string, currentPath: string) {
    const allItems = activeNavSections.flatMap((group) => group.items)
    const hasExactMatch = allItems.some((item) => itemIsExactMatch(item.href, currentPath))

    if (hasExactMatch) {
      return itemIsExactMatch(href, currentPath)
    }

    if (href === '/modules' || href === '/') {
      return currentPath === href
    }

    return currentPath === href || currentPath.startsWith(href + '/')
  }

  function handleNavClick(e: React.MouseEvent, href: string) {
    const isCurrentActive = checkIsCurrentActive(href, pathname)

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
    const isActive = checkIsCurrentActive(item.href, pathname)
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

  let divisionProfileHref = '/stitching-sewing/profile'
  if (pathname?.startsWith('/factory')) divisionProfileHref = '/factory/profile'
  else if (pathname?.startsWith('/brands')) divisionProfileHref = '/brands/profile'
  else if (pathname?.startsWith('/washing')) divisionProfileHref = '/washing/profile'
  else if (pathname?.startsWith('/printing')) divisionProfileHref = '/printing/profile'
  else if (pathname?.startsWith('/embroidery')) divisionProfileHref = '/embroidery/profile'
  else if (pathname?.startsWith('/design')) divisionProfileHref = '/design/profile'
  else if (pathname === '/modules' || pathname?.startsWith('/modules')) divisionProfileHref = '/modules/profile'

  const isProfileActive = pathname === divisionProfileHref || pathname === '/modules/profile' || pathname === '/profile'

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
          <Link href={isStoreUser ? '/stitching-sewing/store' : '/modules'} className="flex items-center gap-2.5 min-w-0 w-full">
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
                src="/z i g z a (2).png" 
                alt="zigza." 
                className="h-9 w-auto object-contain rounded-xl shadow-2xs"
              />
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="p-2.5 py-4 space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
          {activeNavSections.map((group) => (
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
        <div className={`p-3.5 border-t transition-colors flex items-center overflow-hidden h-[65px] ${
          isProfileActive
            ? 'bg-[#FAF7F0] border-[#3A3564]/30 shadow-2xs'
            : 'border-slate-200 bg-[#FAFAF8] hover:bg-slate-50'
        }`}>
          <Link
            href={divisionProfileHref}
            className="flex items-center min-w-0 flex-1 group"
            title="Open Profile"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-xs bg-[#3A3564] mx-auto transition-all ${
              isProfileActive
                ? 'ring-2 ring-[#3A3564] ring-offset-2 ring-offset-[#FAF7F0]'
                : 'group-hover:ring-2 group-hover:ring-[#3A3564]/30'
            }`}>
              {initials}
            </div>
            
            <div className={`flex items-center min-w-0 transition-all ${
              isHovered 
                ? 'ml-3 max-w-[155px] opacity-100 flex-1 duration-200 ease-out' 
                : 'ml-0 max-w-0 opacity-0 duration-500 ease-in-out'
            }`}>
              <div className="flex flex-col min-w-0 flex-1">
                <span 
                  className={`text-[13px] font-bold truncate leading-tight transition-colors ${
                    pathname === '/profile' ? 'text-[#3A3564]' : 'text-slate-900 group-hover:text-[#3A3564]'
                  }`}
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <span className="text-[11px] font-mono text-slate-500 flex items-center justify-between gap-1.5 mt-0.5">
                  <span>{isStoreUser ? 'Store Supervisor' : 'Super Admin'}</span>
                  <span className="text-[#3A3564] font-bold group-hover:underline text-[10px] tracking-tight shrink-0">
                    Profile ↗
                  </span>
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Sign Out on Hover */}
          {isHovered && (
            <form action="/auth/signout" method="POST" className="shrink-0 ml-1.5 animate-in fade-in duration-200">
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
            <Link href={isStoreUser ? '/stitching-sewing/store' : '/modules'} className="flex items-center gap-2.5">
              <img 
                src="/z i g z a (2).png" 
                alt="zigza." 
                className="h-9 w-auto object-contain rounded-xl shadow-2xs"
              />
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                {isStoreUser ? 'STORE MES' : 'ERP MES'}
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
            {activeNavSections.map((group) => (
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

        {/* Bottom User with Sign Out */}
        <div className={`p-4 border-t transition-colors flex items-center justify-between gap-3 shrink-0 ${
          isProfileActive
            ? 'bg-[#FAF7F0] border-[#3A3564]/30'
            : 'border-slate-200 bg-[#FAFAF8]'
        }`}>
          <Link
            href={divisionProfileHref}
            onClick={onMobileClose}
            className="flex items-center gap-3 min-w-0 flex-1 group"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-xs bg-[#3A3564] transition-all ${
              isProfileActive
                ? 'ring-2 ring-[#3A3564] ring-offset-2 ring-offset-[#FAF7F0]'
                : 'group-hover:ring-2 group-hover:ring-[#3A3564]/30'
            }`}>
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-[13px] font-bold truncate leading-tight transition-colors ${
                isProfileActive ? 'text-[#3A3564]' : 'text-slate-900 group-hover:text-[#3A3564]'
              }`}>
                {userEmail}
              </span>
              <span className="text-[11px] font-mono text-slate-500 flex items-center justify-between gap-1.5 mt-0.5">
                <span>Super Admin</span>
                <span className="text-[#3A3564] font-bold text-[10px] tracking-tight shrink-0">
                  Profile ↗
                </span>
              </span>
            </div>
          </Link>

          <form action="/auth/signout" method="POST" className="shrink-0">
            <button 
              type="submit" 
              title="Sign Out" 
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
