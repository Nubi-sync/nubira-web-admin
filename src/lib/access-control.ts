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

/**
 * Resolves the complete list of authorized routes for a user based on their email, metadata, and database profile.
 */
export function getUserAllowedModules(
  user?: { email?: string | null; user_metadata?: Record<string, any> } | null,
  profile?: { role?: string | null } | null
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

  // 3. Explicitly assigned modules in user_metadata or profile
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

  // Check if requested path matches any of the user's allowed division prefixes
  return allowedModules.some(allowedRoute => {
    return pathname === allowedRoute || pathname.startsWith(`${allowedRoute}/`)
  })
}
