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
  Wind,
  Wrench,
  FileCheck2,
  Ruler,
  Calendar,
  Calculator,
  ShoppingCart,
  Ship,
  QrCode,
  Maximize2,
  CheckCircle2,
  Clock,
  Cpu,
  BarChart3,
  FileCode,
  FlaskConical,
  Droplets,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Gauge,
  PackageCheck,
  AlertTriangle,
  Settings,
  Bell
} from 'lucide-react'
import { getUnreadNotificationCount, FLOOR_NOTIFICATIONS_UPDATE_EVENT } from '@/utils/floorNotificationsStorage'

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
    section: 'Workspace Hub',
    items: [
      { label: 'All Modules', href: '/modules', icon: LayoutGrid },
      { label: 'Live Notifications', href: '#live-notifications', icon: Bell },
      { label: 'SA Design Approvals', href: '/design/sa-approvals', icon: Sparkles },
    ],
  },
  {
    section: 'Sewing Floor',
    items: [
      { label: 'Dashboard', href: '/stitching-sewing/dashboard', icon: LayoutDashboard },
      { label: 'Live Notifications', href: '#live-notifications', icon: Bell },
      { label: 'Supervisor Desk', href: '/modules/supervisor-desk', icon: Wrench },
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
      { label: 'Dispatch & Challans', href: '/dispatch', icon: Truck },
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
  companyName?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ 
  userEmail = 'admin@nubira.local',
  userRole,
  companyName,
  isMobileOpen = false,
  onMobileClose
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [unreadCount, setUnreadCount] = useState(0)

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

  const isStoreUser = (
    userRole?.toUpperCase() === 'STORE' ||
    userRole?.toUpperCase() === 'STORE_SUPERVISOR' ||
    userRole?.toUpperCase() === 'GODOWN' ||
    userEmail?.toLowerCase().startsWith('store@') ||
    userEmail?.toLowerCase() === 'store'
  )

  const isAdmin = (
    userEmail?.toLowerCase() === 'admin@zigza.in' ||
    userEmail?.toLowerCase() === 'team.anga9@gmail.com' ||
    userEmail?.toLowerCase() === 'aj@nubiracreation.com' ||
    userRole?.toUpperCase() === 'SUPERADMIN' ||
    userRole?.toUpperCase() === 'PLATFORM_SUPERADMIN'
  )

  const isDesignerUser = (
    userRole?.toUpperCase() === 'DESIGNER' ||
    userEmail?.toLowerCase().includes('@designer.') ||
    userEmail?.toLowerCase().endsWith('@designer.nubira.local')
  )

  const isCuttingWorker = (
    userRole?.toUpperCase() === 'CUTTING_WORKER' ||
    userRole?.toUpperCase() === 'CUTTER' ||
    userEmail?.toLowerCase().includes('@cutting.') ||
    userEmail?.toLowerCase().endsWith('@cutting.nubira.local')
  )

  const isPrintingWorker = (
    userRole?.toUpperCase() === 'PRINTING_WORKER' ||
    userEmail?.toLowerCase().includes('@printing.') ||
    userEmail?.toLowerCase().endsWith('@printing.nubira.local')
  )

  const isEmbroideryWorker = (
    userRole?.toUpperCase() === 'EMBROIDERY_WORKER' ||
    userEmail?.toLowerCase().includes('@embroidery.') ||
    userEmail?.toLowerCase().endsWith('@embroidery.nubira.local')
  )

  const isWashingWorker = (
    userRole?.toUpperCase() === 'WASHING_WORKER' ||
    userRole?.toUpperCase() === 'WASHER' ||
    userEmail?.toLowerCase().includes('@washing.') ||
    userEmail?.toLowerCase().endsWith('@washing.nubira.local')
  )

  const isIronWorker = (
    userRole?.toUpperCase() === 'IRON_WORKER' ||
    userRole?.toUpperCase() === 'IRON_PRESSER' ||
    userRole?.toUpperCase() === 'PRESSER' ||
    userEmail?.toLowerCase().includes('@iron.') ||
    userEmail?.toLowerCase().endsWith('@iron.nubira.local')
  )

  const isStitchingWorker = (
    userRole?.toUpperCase() === 'STITCHING_WORKER' ||
    userRole?.toUpperCase() === 'TAILOR' ||
    userRole?.toUpperCase() === 'SEWING_OPERATOR' ||
    userEmail?.toLowerCase().includes('@stitching.') ||
    userEmail?.toLowerCase().endsWith('@stitching.nubira.local')
  )

  const roleLabel = isAdmin 
    ? 'Super Admin' 
    : (isDesignerUser
        ? 'Creative Designer'
        : (isCuttingWorker
            ? 'Cutting Floor Operator'
            : (isPrintingWorker
                ? 'Printing Floor Operator'
                : (isEmbroideryWorker
                    ? 'Embroidery Machine Operator'
                    : (isWashingWorker
                        ? 'Washing Floor Operator'
                        : (isIronWorker
                            ? 'Steam Iron Presser'
                            : (isStitchingWorker
                                ? 'Tailor / Sewing Operator'
                                : (userRole && userRole.toUpperCase() !== 'ADMIN'
                                    ? userRole.split('/')[0].trim().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    : (isStoreUser ? 'Store Supervisor' : 'Department Head')))))))))

  // Module-specific unique side navigation
  let activeNavSections: NavSection[] = []

  if (isDesignerUser) {
    activeNavSections = [
      {
        section: 'Designer Studio',
        items: [
          { label: 'Active Assignments', href: '/design/designer', icon: Palette },
          { label: 'Submission History', href: '/design/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Profile', href: '/design/profile', icon: User },
        ],
      },
    ]
  } else if (isCuttingWorker || pathname?.startsWith('/cutting/worker')) {
    activeNavSections = [
      {
        section: 'Floor Workstation',
        items: [
          { label: 'Active Assignments', href: '/cutting/worker', icon: Scissors },
          { label: 'Completed History', href: '/cutting/worker/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Operator Profile', href: '/cutting/worker/profile', icon: User },
        ],
      },
    ]
  } else if (isPrintingWorker || pathname?.startsWith('/printing/worker')) {
    activeNavSections = [
      {
        section: 'Floor Workstation',
        items: [
          { label: 'Active Assignments', href: '/printing/worker', icon: Printer },
          { label: 'Completed History', href: '/printing/worker/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Operator Profile', href: '/printing/worker/profile', icon: User },
        ],
      },
    ]
  } else if (isEmbroideryWorker || pathname?.startsWith('/embroidery/worker')) {
    activeNavSections = [
      {
        section: 'Floor Workstation',
        items: [
          { label: 'Active Assignments', href: '/embroidery/worker', icon: Sparkles },
          { label: 'Completed History', href: '/embroidery/worker/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Operator Profile', href: '/embroidery/worker/profile', icon: User },
        ],
      },
    ]
  } else if (isWashingWorker || pathname?.startsWith('/washing/worker')) {
    activeNavSections = [
      {
        section: 'Floor Workstation',
        items: [
          { label: 'Active Assignments', href: '/washing/worker', icon: Waves },
          { label: 'Completed History', href: '/washing/worker/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Operator Profile', href: '/washing/worker/profile', icon: User },
        ],
      },
    ]
  } else if (isIronWorker || pathname?.startsWith('/iron/worker')) {
    activeNavSections = [
      {
        section: 'Floor Workstation',
        items: [
          { label: 'Active Assignments', href: '/iron/worker', icon: Wind },
          { label: 'Completed History', href: '/iron/worker/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Operator Profile', href: '/iron/worker/profile', icon: User },
        ],
      },
    ]
  } else if (isStitchingWorker || pathname?.startsWith('/stitching-sewing/worker')) {
    activeNavSections = [
      {
        section: 'Floor Workstation',
        items: [
          { label: 'Active Assignments', href: '/stitching-sewing/worker', icon: Scissors },
          { label: 'Completed History', href: '/stitching-sewing/worker/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Operator Profile', href: '/stitching-sewing/worker/profile', icon: User },
        ],
      },
    ]
  } else if (isStoreUser && !pathname?.startsWith('/modules')) {
    activeNavSections = [
      ...(isAdmin ? [
        {
          section: 'Workspace Hub',
          items: [
            { label: 'All Modules', href: '/modules', icon: LayoutGrid },
          ],
        },
      ] : []),
      {
        section: 'Godown Shift',
        items: [
          { label: 'Store Dashboard', href: '/stitching-sewing/store', icon: Store },
          { label: 'Godown & Inventory', href: '/stitching-sewing/inventory', icon: Warehouse },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Profile', href: '/stitching-sewing/profile', icon: User },
        ],
      },
    ]
  } else if (
    pathname === '/modules' || 
    pathname?.startsWith('/modules') || 
    pathname === '/access-control' || 
    pathname?.startsWith('/access-control') ||
    pathname?.startsWith('/design/sa-approvals')
  ) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
          { label: 'Department Heads', href: '/modules/access-control', icon: ShieldCheck },
          { label: 'Supervisor Operations', href: '/modules/supervisor-desk', icon: Wrench },
          { label: 'SA Design Approvals', href: '/design/sa-approvals', icon: ShieldCheck },
          { label: 'Company Profile', href: '/modules/profile', icon: Building2 },
        ],
      },
    ]
  } else if (pathname?.startsWith('/design/designer') || pathname?.startsWith('/design/history')) {
    activeNavSections = [
      {
        section: 'Designer Studio',
        items: [
          { label: 'Active Assignments', href: '/design/designer', icon: Palette },
          { label: 'Submission History', href: '/design/history', icon: Clock },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Profile', href: '/design/profile', icon: User },
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
          { label: 'Team Management', href: '/design/team', icon: Users },
          { label: 'PH Settings', href: '/design/settings', icon: Settings },
          { label: 'Zigza AI', href: '/design/zigza-ai', icon: Bot },
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
          { label: 'Desk Dashboard', href: '/merchandising', icon: Briefcase },
          { label: 'Floor Store (Fabric)', href: '/merchandising/store', icon: Store },
          { label: 'Active Buyers', href: '/merchandising/buyers', icon: Users },
          { label: 'Buyer Purchase Orders', href: '/merchandising/orders', icon: ClipboardList },
          { label: 'Time & Action (T&A) Planner', href: '/merchandising/tna-calendar', icon: Calendar },
          { label: 'Zigza AI', href: '/merchandising/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Desk Profile', href: '/merchandising/profile', icon: User },
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
          { label: 'Floor Dashboard', href: '/cutting', icon: Scissors },
          { label: 'Floor Store (Rolls)', href: '/cutting/store', icon: Store },
          { label: 'Spreading & Lay Plans', href: '/cutting/lay-sheets', icon: Layers },
          { label: 'CAD Markers & Nesting', href: '/cutting/markers', icon: Maximize2 },
          { label: 'Cutting Orders & Queue', href: '/cutting/orders', icon: Cpu },
          { label: 'Bundle Tickets & Barcodes', href: '/cutting/bundles', icon: QrCode },
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
          { label: 'Floor Dashboard', href: '/printing', icon: Printer },
          { label: 'Floor Store (Panels)', href: '/printing/store', icon: Store },
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
          { label: 'Floor Dashboard', href: '/embroidery', icon: Sparkles },
          { label: 'Floor Store (Panels)', href: '/embroidery/store', icon: Store },
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
  } else if (pathname?.startsWith('/stitching-sewing')) {
    const isCustomStitching = (
      userEmail?.toLowerCase() === 'aj@nubiracreation.com' ||
      userEmail?.toLowerCase() === 'team.anga9@gmail.com' ||
      userEmail?.toLowerCase().includes('nubira')
    )

    if (isCustomStitching) {
      activeNavSections = [
        {
          section: 'Workspace Hub',
          items: [
            { label: 'All Modules', href: '/modules', icon: LayoutGrid },
          ],
        },
        {
          section: '6. Sewing Operations',
          items: [
            { label: 'Floor Dashboard', href: '/stitching-sewing/dashboard', icon: LayoutDashboard },
            { label: 'Supervisor Desk', href: '/modules/supervisor-desk', icon: Wrench },
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
            { label: 'Dispatch & Challans', href: '/dispatch', icon: Truck },
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
    } else {
      activeNavSections = [
        {
          section: 'Workspace Hub',
          items: [
            { label: 'All Modules', href: '/modules', icon: LayoutGrid },
          ],
        },
        {
          section: '6. Sewing Operations',
          items: [
            { label: 'Floor Dashboard', href: '/stitching-sewing/dashboard', icon: Scissors },
            { label: 'Floor Store (Bundles)', href: '/stitching-sewing/store', icon: Store },
            { label: 'Zigza AI', href: '/stitching-sewing/zigza-ai', icon: Bot },
          ],
        },
        {
          section: 'Account',
          items: [
            { label: 'Division Profile', href: '/stitching-sewing/profile', icon: User },
          ],
        },
      ]
    }
  } else if (pathname?.startsWith('/washing')) {
    activeNavSections = [
      {
        section: 'Workspace Hub',
        items: [
          { label: 'All Modules', href: '/modules', icon: LayoutGrid },
        ],
      },
      {
        section: '7. Washing Operations',
        items: [
          { label: 'Floor Dashboard', href: '/washing', icon: Waves },
          { label: 'Floor Store (Garments)', href: '/washing/store', icon: Store },
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
        section: '8. Ironing Operations',
        items: [
          { label: 'Floor Dashboard', href: '/iron', icon: Wind },
          { label: 'Floor Store (Press)', href: '/iron/store', icon: Store },
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
        section: '9. Ready Goods & Packing',
        items: [
          { label: 'Packing Dashboard', href: '/ready-goods', icon: Boxes },
          { label: 'AQL 2.5 Inspection', href: '/ready-goods/aql-inspection', icon: CheckCircle2 },
          { label: 'Hangtag & Polybag', href: '/ready-goods/tagging-polybag', icon: Tag },
          { label: 'Carton Packing Manifest', href: '/ready-goods/carton-packing', icon: PackageCheck },
          { label: 'Scale Weight & Audit', href: '/ready-goods/carton-weight', icon: Gauge },
          { label: 'Central Godown Handover', href: '/ready-goods/handover', icon: Warehouse },
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
        section: '10. Alteration & Quality Recovery',
        items: [
          { label: 'Clinic Dashboard', href: '/alter', icon: Wrench },
          { label: 'Defect Intake & Pareto', href: '/alter/defect-intake', icon: AlertTriangle },
          { label: 'Master Mending Stations', href: '/alter/repair-stations', icon: Scissors },
          { label: 'Chemical Spotting & Clean', href: '/alter/spot-cleaning', icon: Droplets },
          { label: 'Secondary AQL Re-Audit', href: '/alter/secondary-qc', icon: CheckCircle2 },
          { label: 'Scrap Salvage & Write-Off', href: '/alter/scrap-salvage', icon: FileText },
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
        section: '11. Central Store & Godown',
        items: [
          { label: 'Central Hub (Cloth Stock)', href: '/store', icon: Store },
          { label: 'Merchandise Store', href: '/store/merchandise', icon: Briefcase },
          { label: 'Cutting Floor Store', href: '/store/cutting', icon: Scissors },
          { label: 'Printing Floor Store', href: '/store/printing', icon: Printer },
          { label: 'Embroidery Floor Store', href: '/store/embroidery', icon: Sparkles },
          { label: 'Sewing Floor Store', href: '/store/sewing', icon: Layers },
          { label: 'Washing Floor Store', href: '/store/washing', icon: Waves },
          { label: 'Ironing Floor Store', href: '/store/iron', icon: Wind },
          { label: 'Zigza AI Copilot', href: '/store/zigza-ai', icon: Bot },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Division Profile', href: '/store/profile', icon: User },
        ],
      },
    ]
  } else if (pathname === '/dispatch' || pathname?.startsWith('/dispatch')) {
    activeNavSections = [
      ...(isAdmin ? [
        {
          section: 'Workspace Hub',
          items: [
            { label: 'All Modules', href: '/modules', icon: LayoutGrid },
          ],
        },
      ] : []),
      {
        section: '12. Dispatch Operations',
        items: [
          { label: 'Dispatch Hub', href: '/dispatch', icon: Truck },
          { label: 'Pre-Loading Audits', href: '/dispatch?tab=counting', icon: ClipboardList },
          { label: 'Delivery Challans', href: '/dispatch?tab=challans', icon: FileText },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Company Profile', href: '/modules/profile', icon: Building2 },
        ],
      },
    ]
  } else {
    // Default to full 6. Stitching & Sewing Floor Nav (Preserved)
    activeNavSections = navSections
  }

  // Non-admin / Department Head filtering:
  // If the user is NOT an admin, they should NOT see the Workspace Hub or links to "All Modules"
  if (!isAdmin) {
    activeNavSections = activeNavSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter((item) => item.href !== '/modules' && item.href !== '/modules/access-control'),
      }))
      .filter((sec) => sec.items.length > 0 && sec.section !== 'Workspace Hub')
  }

  // Ensure "Live Notifications" is always present in every module's primary section
  activeNavSections = activeNavSections.map((sec) => {
    const hasLiveNotif = sec.items.some(it => it.href === '#live-notifications')
    if (!hasLiveNotif && sec.section !== 'Account') {
      const updatedItems = [...sec.items]
      // Insert after the first item (Dashboard / Overview)
      updatedItems.splice(1, 0, {
        label: 'Live Notifications',
        href: '#live-notifications',
        icon: Bell
      })
      return { ...sec, items: updatedItems }
    }
    return sec
  })

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
    if (
      (href === '/modules/access-control' || href === '/access-control') &&
      (currentPath === '/modules/access-control' || currentPath === '/access-control')
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
    if (href === '#live-notifications') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('open-floor-notifications'))
      onMobileClose?.()
      return
    }

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
    const isLiveNotifications = item.href === '#live-notifications'
    const isActive = !isLiveNotifications && checkIsCurrentActive(item.href, pathname)
    const isLoading = navigatingTo === item.href

    return (
      <Link
        key={`${item.href}-${item.label}`}
        href={item.href}
        prefetch={!isLiveNotifications}
        onMouseEnter={() => {
          if (!isLiveNotifications) {
            try {
              router.prefetch(item.href)
            } catch (_) {}
          }
        }}
        onClick={(e) => handleNavClick(e, item.href)}
        title={!isExpanded ? item.label : undefined}
        className={`relative flex items-center rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#3A3564] cursor-pointer ${
          isExpanded 
            ? 'px-3 py-2.5 justify-between w-full transition-all duration-200 ease-out' 
            : 'w-10 h-10 mx-auto justify-center transition-all duration-500 ease-in-out'
        } ${
          isLiveNotifications
            ? 'font-semibold text-slate-800 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-300/50 shadow-2xs'
            : isActive
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
            <div className="relative shrink-0 flex items-center justify-center">
              <Icon className={`w-[18px] h-[18px] shrink-0 ${
                isLiveNotifications ? 'text-amber-600' : isActive ? 'text-[#3A3564]' : 'text-slate-500'
              }`} />
              {isLiveNotifications && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              )}
            </div>
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

        {/* Live notification badge & indicator when expanded */}
        {isLiveNotifications && isExpanded && (
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live WS Connected" />
          </div>
        )}

        {/* Loading Spinner only (pill boxes completely removed) */}
        {isLoading && (
          <div className={`overflow-hidden transition-all shrink-0 ${
            isExpanded 
              ? 'opacity-100 duration-200 ease-out' 
              : 'opacity-0 duration-400 ease-in-out'
          }`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3A3564]" />
          </div>
        )}
      </Link>
    )
  }

  let divisionProfileHref = '/stitching-sewing/profile'
  if (isCuttingWorker || pathname?.startsWith('/cutting/worker')) divisionProfileHref = '/cutting/worker/profile'
  else if (isPrintingWorker || pathname?.startsWith('/printing/worker')) divisionProfileHref = '/printing/worker/profile'
  else if (isEmbroideryWorker || pathname?.startsWith('/embroidery/worker')) divisionProfileHref = '/embroidery/worker/profile'
  else if (isWashingWorker || pathname?.startsWith('/washing/worker')) divisionProfileHref = '/washing/worker/profile'
  else if (isIronWorker || pathname?.startsWith('/iron/worker')) divisionProfileHref = '/iron/worker/profile'
  else if (isDesignerUser || pathname?.startsWith('/design/designer')) divisionProfileHref = '/design/profile'
  else if (pathname?.startsWith('/factory')) divisionProfileHref = '/factory/profile'
  else if (pathname?.startsWith('/brands')) divisionProfileHref = '/brands/profile'
  else if (pathname?.startsWith('/washing')) divisionProfileHref = '/washing/profile'
  else if (pathname?.startsWith('/iron')) divisionProfileHref = '/iron/profile'
  else if (pathname?.startsWith('/printing')) divisionProfileHref = '/printing/profile'
  else if (pathname?.startsWith('/embroidery')) divisionProfileHref = '/embroidery/profile'
  else if (pathname?.startsWith('/cutting')) divisionProfileHref = '/cutting/profile'
  else if (pathname?.startsWith('/design')) divisionProfileHref = '/design/profile'
  else if (pathname?.startsWith('/merchandising')) divisionProfileHref = '/merchandising/profile'
  else if (pathname === '/store' || (pathname?.startsWith('/store') && !pathname?.startsWith('/stitching-sewing/store'))) divisionProfileHref = '/store/profile'
  else if (pathname === '/modules' || pathname?.startsWith('/modules')) divisionProfileHref = '/modules/profile'
  const isProfileActive = pathname === divisionProfileHref || pathname === '/modules/profile' || pathname === '/profile'

  const homeHref = isAdmin 
    ? '/modules' 
    : (isDesignerUser
        ? '/design/designer'
        : (isCuttingWorker
            ? '/cutting/worker'
            : (isPrintingWorker
                ? '/printing/worker'
                : (isEmbroideryWorker
                    ? '/embroidery/worker'
                    : (isWashingWorker
                        ? '/washing/worker'
                        : (isIronWorker
                            ? '/iron/worker'
                            : (isStoreUser 
                                ? '/stitching-sewing/store' 
                                : (activeNavSections[0]?.items[0]?.href || '/stitching-sewing/dashboard'))))))))

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
          <Link href={homeHref} className="flex items-center gap-2.5 min-w-0 w-full">
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

        {/* Dedicated Quick Action: Live Floor Notifications Feed */}
        <div className="px-2.5 pt-3 pb-1 border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-floor-notifications'))
              onMobileClose?.()
            }}
            className={`group relative flex items-center rounded-xl cursor-pointer border transition-all duration-200 ${
              isHovered
                ? 'w-full px-3 py-2 justify-between bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 hover:from-amber-100/90 hover:to-white border-amber-300/60 hover:border-amber-400 shadow-2xs'
                : 'w-10 h-10 mx-auto justify-center bg-amber-50/80 hover:bg-amber-100/90 border-amber-300/60 shadow-2xs'
            }`}
            title="Open Live Floor Notifications & Audit Trail"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              </div>
              <div className={`overflow-hidden whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isHovered ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'
              }`}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  Live Feed
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  LIVE
                </span>
              </div>
            </div>
            {isHovered && unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold shadow-xs shrink-0 animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
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
                  <span>{roleLabel}</span>
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
            <Link href={homeHref} className="flex items-center gap-2.5">
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

          {/* Quick Action: Live Feed */}
          <div className="p-3 border-b border-slate-100">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-floor-notifications'))
                onMobileClose?.()
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 via-white to-amber-50/40 border border-amber-300/60 shadow-xs cursor-pointer hover:bg-amber-100/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <Bell className="w-4 h-4 text-amber-700" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  Live Floor Feed
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  LIVE
                </span>
              </div>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
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
                <span>{roleLabel}</span>
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
