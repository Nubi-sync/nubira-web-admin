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
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
      className="w-[250px] shrink-0 min-h-screen h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col justify-between z-30 transition-all duration-200"
    >
      {/* Top Header / Brand Block */}
      <div>
        <div className="p-4 pb-3.5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img 
              src="/z i g z a (1).png" 
              alt="zigza." 
              className="h-7 w-auto object-contain rounded-md transition-opacity group-hover:opacity-85"
            />
          </Link>
          <span 
            className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15"
          >
            ERP MES
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((group) => (
            <div key={group.section} className="space-y-1">
              <div 
                className="px-3 text-[10px] font-bold uppercase tracking-[1.5px] mb-1.5 text-slate-400 font-mono"
              >
                {group.section}
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.href === '/dashboard'
                    ? pathname === '/dashboard' || pathname === '/'
                    : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#3A3564] ${
                        isActive
                          ? 'font-bold text-[#3A3564] bg-[#FAF7F0] border border-black/10 shadow-2xs'
                          : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {/* Left 3px active accent bar */}
                      {isActive && (
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#3A3564]"
                        />
                      )}

                      <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-[#3A3564]' : 'text-slate-500'}`} />
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
        className="p-3.5 border-t border-slate-200 bg-[#FAFAF8] flex items-center gap-3 shrink-0"
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-xs bg-[#3A3564]"
        >
          {initials}
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
          <span 
            className="text-[12px] font-bold text-slate-900 truncate leading-tight"
            title={userEmail}
          >
            {userEmail}
          </span>
          <span 
            className="text-[10.5px] font-mono text-slate-500"
          >
            Super Admin
          </span>
        </div>
      </div>
    </aside>
  )
}
