// ============================================================================
// Zigza MES Enterprise - Centralized Access Control & Module Authorization
// Enforces Strict Per-Account Module Isolation with Zero Cross-Division Access
// ============================================================================

export const ALL_DIVISION_ROUTES = [
  '/design',
  '/merchandising',
  '/cutting',
  '/printing',
  '/embroidery',
  '/stitching-sewing',
  '/washing',
  '/iron',
  '/ready-goods',
  '/alter',
  '/store',
  '/dispatch',
] as const

export type DivisionRoute = typeof ALL_DIVISION_ROUTES[number]

export const ROLE_MODULE_MAPPING: Record<string, DivisionRoute[]> = {
  // Pre-Production & CAD
  DESIGN: ['/design'],
  DESIGNER: ['/design'],
  CAD_MASTER: ['/design'],
  
  // Sourcing & Commercial
  MERCHANDISING: ['/merchandising'],
  MERCHANDISER: ['/merchandising'],
  SOURCING_HEAD: ['/merchandising'],
  
  // Cutting & Spreading
  CUTTING: ['/cutting'],
  CUTTING_MASTER: ['/cutting'],
  SPREADER_OPERATOR: ['/cutting'],
  
  // Surface Art
  PRINTING: ['/printing'],
  PRINTING_MASTER: ['/printing'],
  EMBROIDERY: ['/embroidery'],
  EMBROIDERY_MASTER: ['/embroidery'],
  
  // Core Stitching Backbone
  STITCHING: ['/stitching-sewing'],
  STITCHING_SUPERVISOR: ['/stitching-sewing'],
  LINEMAN: ['/stitching-sewing'],
  PRODUCTION_MANAGER: ['/stitching-sewing'],
  
  // Wet & Finishing Ops
  WASHING: ['/washing'],
  WASHING_MASTER: ['/washing'],
  IRON: ['/iron'],
  IRONING_MASTER: ['/iron'],
  
  // Quality & Packing
  QC: ['/ready-goods'],
  PACKING: ['/ready-goods'],
  AQL_INSPECTOR: ['/ready-goods'],
  
  // Alteration Clinic
  MENDING: ['/alter'],
  ALTERATION: ['/alter'],
  REPAIR_TAILOR: ['/alter'],
  
  // Materials & Warehouse
  STORE: ['/store'],
  STORE_SUPERVISOR: ['/store'],
  GODOWN: ['/store'],
  
  // Outward Logistics
  DISPATCH: ['/dispatch'],
  LOGISTICS: ['/dispatch'],
}

export interface DepartmentHeadDefinition {
  id: string
  code: string
  name: string
  route: string
  defaultDesignation: string
  iconName: string
  description: string
}

export const DEPARTMENT_HEADS_CATALOG: DepartmentHeadDefinition[] = [
  { id: 'div-01', code: '01', name: 'Design & Tech-Pack Studio', route: '/design', defaultDesignation: 'Design Studio Head / CAD Master', iconName: 'Palette', description: 'CAD sketches, tech-pack specs, sample iterations & grading approvals' },
  { id: 'div-02', code: '02', name: 'Merchandising & Sourcing Desk', route: '/merchandising', defaultDesignation: 'Senior Merchandiser / Sourcing Head', iconName: 'Briefcase', description: 'Buyer PO allocation, BOM costing, trim procurement & shipment schedules' },
  { id: 'div-03', code: '03', name: 'Cutting Floor & Spreading CAD', route: '/cutting', defaultDesignation: 'Cutting Master / Cutting Floor Head', iconName: 'Scissors', description: 'Fabric roll lay planning, marker efficiency, auto-cutters & bundle tickets' },
  { id: 'div-04', code: '04', name: 'Screen & Digital Printing Studio', route: '/printing', defaultDesignation: 'Printing Master / Print Unit Head', iconName: 'Printer', description: 'Screen print tables, industrial DTG curing & strike-off color approvals' },
  { id: 'div-05', code: '05', name: 'Multi-Head Embroidery Studio', route: '/embroidery', defaultDesignation: 'Embroidery Master / Unit Head', iconName: 'Sparkles', description: 'Multi-head computerized machines, punch digitizing & stitch billing' },
  { id: 'div-06', code: '06', name: 'Stitching & Sewing Assembly Line', route: '/stitching-sewing', defaultDesignation: 'Production Manager / Sewing Floor Head', iconName: 'Layers', description: 'Live cutting lots, lineman bundle allocations, 3-stage QC & store sync' },
  { id: 'div-07', code: '07', name: 'Industrial Washing & Dyeing', route: '/washing', defaultDesignation: 'Washing Master / Wet Processing Head', iconName: 'Waves', description: 'Garment enzyme wash, silicon softeners & liquor ratio batch tracking' },
  { id: 'div-08', code: '08', name: 'Steam Pressing & Ironing Floor', route: '/iron', defaultDesignation: 'Finishing & Ironing Incharge', iconName: 'Flame', description: 'Industrial steam irons, vacuum pressing boards & inline finish inspection' },
  { id: 'div-09', code: '09', name: 'Ready Goods & Carton Packing', route: '/ready-goods', defaultDesignation: 'Quality Assurance Head / AQL Manager', iconName: 'Boxes', description: 'AQL 2.5 final inspection, barcode hangtags, polybag sealing & cartons' },
  { id: 'div-10', code: '10', name: 'Alteration & Reclamation Clinic', route: '/alter', defaultDesignation: 'Alteration Incharge / Rework Master', iconName: 'Wrench', description: 'Defect categorization, seam rework, broken stitch alterations & re-inspection' },
  { id: 'div-11', code: '11', name: 'Central Store Godown & Vault', route: '/store', defaultDesignation: 'Store Manager / Chief Godown Keeper', iconName: 'Store', description: 'Raw fabric rolls, trims inventory, cutting challan issue & finished carton storage' },
  { id: 'div-12', code: '12', name: 'Dispatch & Delivery Logistics', route: '/dispatch', defaultDesignation: 'Dispatch Manager / Logistics Head', iconName: 'Truck', description: 'Delivery challans, physical counting audits, vehicle gate-out & logistics passes' },
]

/**
 * Resolves the complete list of authorized routes for a user based on their email, metadata, and database profile.
 */
export function getUserAllowedModules(
  user?: { email?: string | null; user_metadata?: Record<string, any> } | null,
  profile?: { role?: string | null; allowed_modules?: string[] | null } | null
): string[] {
  if (!user) return []

  const email = (user.email || '').toLowerCase().trim()
  const role = (profile?.role || user.user_metadata?.role || '').toUpperCase().trim()

  // 1. Root Platform SuperAdmin (admin@zigza.in)
  if (email === 'admin@zigza.in' || role === 'PLATFORM_SUPERADMIN') {
    return ['/platform-admin', ...ALL_DIVISION_ROUTES, '/modules']
  }

  // 2. Enterprise SuperAdmins & Master Factory Owners
  if (role === 'SUPERADMIN' || role === 'ADMIN' || email === 'team.anga9@gmail.com') {
    return [...ALL_DIVISION_ROUTES, '/modules']
  }

  // 3. Explicitly assigned modules in profile (source of truth) or user_metadata
  const profileModules = profile?.allowed_modules
  if (Array.isArray(profileModules) && profileModules.length > 0) {
    return profileModules
  }

  const explicitModules = user.user_metadata?.allowed_modules
  if (Array.isArray(explicitModules) && explicitModules.length > 0) {
    return explicitModules
  }

  // 4. Role-based module mapping for operational floor staff
  if (ROLE_MODULE_MAPPING[role]) {
    return ROLE_MODULE_MAPPING[role]
  }

  // 5. Fallback inference by email prefix (e.g. store@nubira.local -> /store)
  if (email.startsWith('store@')) return ['/store']
  if (email.startsWith('cutting@')) return ['/cutting']
  if (email.startsWith('washing@')) return ['/washing']
  if (email.startsWith('printing@')) return ['/printing']
  if (email.startsWith('embroidery@')) return ['/embroidery']
  if (email.startsWith('iron@')) return ['/iron']
  if (email.startsWith('packing@') || email.startsWith('checking@')) return ['/ready-goods']
  if (email.startsWith('mending@') || email.startsWith('alter@')) return ['/alter']
  if (email.startsWith('dispatch@')) return ['/dispatch']
  if (email.startsWith('design@')) return ['/design']
  if (email.startsWith('merchandising@')) return ['/merchandising']

  // Default floor fallback for generic lineman/tailor
  return ['/stitching-sewing']
}

/**
 * Returns the single default starting landing route for a user upon login.
 */
export function getDefaultLandingRoute(
  allowedModules: string[],
  role?: string | null,
  email?: string | null
): string {
  const normEmail = (email || '').toLowerCase().trim()
  const normRole = (role || '').toUpperCase().trim()

  // Platform root admin lands on platform console
  if (normEmail === 'admin@zigza.in' || normRole === 'PLATFORM_SUPERADMIN') {
    return '/platform-admin'
  }

  // Enterprise SuperAdmin & Factory Owners land on modules hub
  if (normRole === 'SUPERADMIN' || normRole === 'ADMIN' || normEmail === 'team.anga9@gmail.com') {
    return '/modules'
  }

  // Single-module operational account lands directly inside their assigned module
  if (allowedModules.length === 1) {
    return allowedModules[0]
  }

  // If user has specific modules but not all, land on the first one
  if (allowedModules.length > 0 && !allowedModules.includes('/modules')) {
    return allowedModules[0]
  }

  return '/modules'
}

/**
 * Determines whether a requested pathname is authorized for a given set of allowed modules.
 */
export function isRouteAuthorized(allowedModules: string[], pathname: string): boolean {
  // Always permit public authentication, profile, account settings, reset password, and API routes
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/reset-password')
  ) {
    return true
  }

  // If user has full access to the modules hub
  if (allowedModules.includes('/modules') && pathname.startsWith('/modules')) {
    return true
  }

  // If user is Platform SuperAdmin
  if (allowedModules.includes('/platform-admin') && pathname.startsWith('/platform-admin')) {
    return true
  }

  // Permit root /allotments and /production-orders paths for users with Stitching & Sewing access
  if (allowedModules.includes('/stitching-sewing')) {
    if (pathname === '/allotments' || pathname.startsWith('/allotments/')) return true
    if (pathname === '/production-orders' || pathname.startsWith('/production-orders/')) return true
  }

  // Check if requested path matches any of the user's allowed division prefixes
  return allowedModules.some(allowedRoute => {
    return pathname === allowedRoute || pathname.startsWith(`${allowedRoute}/`)
  })
}
