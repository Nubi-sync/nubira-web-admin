'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  Layers, 
  ClipboardList, 
  Warehouse, 
  Truck, 
  Users, 
  Tag, 
  FileText 
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type NavSection = {
  section: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
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

export function AdminSidebar({ userEmail = 'admin@nubira.local' }: { userEmail?: string }) {
  const pathname = usePathname()

  // Generate initials for avatar
  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'SA'

  return (
    <aside 
      className="w-[250px] shrink-0 min-h-screen h-screen sticky top-0 bg-white border-r flex flex-col justify-between z-30 transition-all duration-200"
      style={{ borderColor: 'var(--border, #E2E8F0)' }}
    >
      {/* Top Header / Brand Block */}
      <div>
        <div className="p-5 pb-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          {/* 34x34px Zigza Logo Mark */}
          <div 
            className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-indigo-500/30"
          >
            {/* Dynamic Sharp Zigza 'Z' Stitch Icon */}
            <svg 
              className="w-4 h-4 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 4h16l-12 16h12" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span 
              className="text-[17.5px] font-black leading-tight tracking-tight font-[family-name:var(--font-heading)]"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              Zigza
            </span>
            <span 
              className="text-[9px] font-extrabold tracking-[2.5px] uppercase font-[family-name:var(--font-public-sans)]"
              style={{ color: 'var(--ink-faint, #8B9AAB)' }}
            >
              GARMENT ERP
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((group) => (
            <div key={group.section} className="space-y-1">
              <div 
                className="px-3 text-[10px] font-bold uppercase tracking-[1.5px] mb-1.5"
                style={{ color: 'var(--ink-faint, #8B9AAB)' }}
              >
                {group.section}
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.href === '/' 
                    ? pathname === '/' 
                    : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13.5px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel,#2B4C7E)] ${
                        isActive
                          ? 'font-semibold text-[var(--steel-dark,#1F3A63)] bg-[var(--steel-mist,#EEF3FA)]'
                          : 'font-medium text-[var(--ink-soft,#5B6B7C)] hover:text-[var(--ink,#1C2733)] hover:bg-slate-50'
                      }`}
                    >
                      {/* Left 3px active accent bar */}
                      {isActive && (
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                        />
                      )}

                      <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-[var(--steel,#2B4C7E)]' : 'text-[var(--ink-soft,#5B6B7C)]'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Profile Block */}
      <div 
        className="p-3.5 border-t bg-white flex items-center gap-3 shrink-0"
        style={{ borderColor: 'var(--border, #E2E8F0)' }}
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-xs"
          style={{ backgroundColor: 'var(--steel-dark, #1F3A63)' }}
        >
          {initials}
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
          <span 
            className="text-[12px] font-semibold truncate leading-tight"
            style={{ color: 'var(--ink, #1C2733)' }}
            title={userEmail}
          >
            {userEmail}
          </span>
          <span 
            className="text-[10.5px] font-medium"
            style={{ color: 'var(--ink-faint, #8B9AAB)' }}
          >
            Super Admin
          </span>
        </div>
      </div>
    </aside>
  )
}
