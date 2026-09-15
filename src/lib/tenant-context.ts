import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const ALL_DEFAULT_DIVISIONS = [
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
]

export interface ResolvedTenantProfile {
  userId: string
  userEmail: string
  role: string
  isSuperAdmin: boolean
  isPlatformAdmin: boolean
  companyName: string
  adminDisplayName: string
  customUsername: string
  phone: string
  cityState: string
  subscriptionTier: string
  allowedDivisions: string[]
  isProvisionedTenant: boolean
  tenantId?: string
  accessType?: 'DEMO_TRIAL' | 'FULL_ACCESS'
  expiresAt?: string
  provisionedAt?: string
  isExpired: boolean
  tenantStatus: string
  monthlyBillingInr?: number
}

/**
 * Centrally resolves the active tenant organization, company name, role,
 * and permissions for any authenticated user.
 */
export async function resolveUserTenant(user: {
  id: string
  email?: string
  user_metadata?: any
}): Promise<ResolvedTenantProfile> {
  const userEmail = (user.email || '').trim().toLowerCase()
  const metadata = user.user_metadata || {}

  // 1. Platform Root SuperAdmin (Platform Console)
  if (userEmail === 'admin@zigza.in' || metadata.role === 'PLATFORM_SUPERADMIN') {
    return {
      userId: user.id,
      userEmail,
      role: 'PLATFORM_SUPERADMIN',
      isSuperAdmin: true,
      isPlatformAdmin: true,
      companyName: 'Zigza MES Platform Operations',
      adminDisplayName: metadata.displayName || 'Platform SuperAdmin',
      customUsername: metadata.username || 'platform_admin',
      phone: '+91 98000 00000',
      cityState: 'India',
      subscriptionTier: 'ENTERPRISE_PLATFORM',
      allowedDivisions: ['/platform-admin'],
      isProvisionedTenant: false,
      accessType: 'FULL_ACCESS',
      isExpired: false,
      tenantStatus: 'ACTIVE',
      provisionedAt: '2026-09-15T00:00:00.000Z'
    }
  }

  // 2. Check platform_tenant_factories for provisioned client factory accounts
  try {
    let tenant: any = null

    // Exact email match
    const { data: exactTenant } = await supabaseAdmin
      .from('platform_tenant_factories')
      .select('*')
      .ilike('admin_email', userEmail)
      .maybeSingle()

    tenant = exactTenant

    // Company metadata match fallback
    if (!tenant && metadata.company) {
      const { data: compTenant } = await supabaseAdmin
        .from('platform_tenant_factories')
        .select('*')
        .ilike('company_name', metadata.company.trim())
        .maybeSingle()
      tenant = compTenant
    }

    // Keyword match fallback for provisioned slugs
    if (!tenant && userEmail.includes('shaw')) {
      const { data: shawTenant } = await supabaseAdmin
        .from('platform_tenant_factories')
        .select('*')
        .or('plant_slug.ilike.%shaw%,company_name.ilike.%shaw%')
        .limit(1)
        .maybeSingle()
      tenant = shawTenant
    }

    if (!tenant && (userEmail.includes('nubira') || userEmail === 'team.anga9@gmail.com')) {
      const { data: nubiraTenant } = await supabaseAdmin
        .from('platform_tenant_factories')
        .select('*')
        .or('plant_slug.ilike.%nubira%,company_name.ilike.%nubira%')
        .limit(1)
        .maybeSingle()
      tenant = nubiraTenant
    }

    if (tenant) {
      // Check if user is the tenant's primary factory admin
      const isTenantAdmin = Boolean(
        (tenant.admin_email && tenant.admin_email.toLowerCase() === userEmail.toLowerCase()) ||
        userEmail === 'admin@zigza.in' ||
        userEmail === 'team.anga9@gmail.com'
      )

      // Fetch user's profile to check if they are a department head or employee
      let profileRole = ''
      let profileUsername = ''
      let profileAllowedModules: string[] = []
      let profileIsHead = false
      let profileDesignation = ''
      try {
        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('username, role, allowed_modules, is_head, designation')
          .eq('id', user.id)
          .maybeSingle()
        if (prof) {
          profileRole = prof.role || ''
          profileUsername = prof.username || ''
          profileAllowedModules = Array.isArray(prof.allowed_modules) ? prof.allowed_modules : []
          profileIsHead = Boolean(prof.is_head)
          profileDesignation = prof.designation || ''
        }
      } catch (_) {}

      // A user is a Department Head if is_head is true, or if they have restricted modules (not full factory admin)
      const isDepartmentHead = profileIsHead || metadata.is_head || (!isTenantAdmin && profileAllowedModules.length > 0)

      // Strict SuperAdmin check: only primary tenant factory admin, and never department heads
      const isSuperAdmin = isTenantAdmin && !isDepartmentHead

      const effectiveRole = isDepartmentHead
        ? (profileDesignation || metadata.designation || profileRole || 'DEPARTMENT_HEAD')
        : (isTenantAdmin ? 'SUPERADMIN' : (profileRole || metadata.role || 'STAFF')).toUpperCase()

      const userAllowedModules = profileAllowedModules.length > 0
        ? profileAllowedModules
        : (Array.isArray(metadata.allowed_modules) && metadata.allowed_modules.length > 0 ? metadata.allowed_modules : [])

      const divisions = isSuperAdmin
        ? (Array.isArray(tenant.allowed_divisions) && tenant.allowed_divisions.length > 0 ? tenant.allowed_divisions : ALL_DEFAULT_DIVISIONS)
        : (userAllowedModules.length > 0 ? userAllowedModules : ['/stitching-sewing'])

      const displayName = isTenantAdmin
        ? (tenant.admin_name || metadata.displayName || 'Plant Head')
        : (metadata.display_name || metadata.displayName || profileUsername || 'Department Head')

      const accessType: 'DEMO_TRIAL' | 'FULL_ACCESS' = tenant.access_type || 'FULL_ACCESS'
      const expiresAt = tenant.expires_at || undefined
      const tenantStatus = tenant.status || 'ACTIVE'

      // Check if account has expired or been revoked
      const isPastExpiry = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false
      const isExpired = tenantStatus === 'SUSPENDED' || tenantStatus === 'EXPIRED' || isPastExpiry

      return {
        userId: user.id,
        userEmail,
        role: effectiveRole,
        isSuperAdmin,
        isPlatformAdmin: false,
        companyName: tenant.company_name,
        adminDisplayName: displayName,
        customUsername: metadata.username || profileUsername || `${userEmail.split('@')[0]}`,
        phone: isTenantAdmin ? (tenant.phone || '') : (metadata.phone || ''),
        cityState: tenant.city_state || 'India',
        subscriptionTier: tenant.subscription_tier || 'FULL_PLANT_AI',
        allowedDivisions: divisions,
        isProvisionedTenant: true,
        tenantId: tenant.id,
        accessType,
        expiresAt,
        provisionedAt: tenant.provisioned_at || '2026-09-15T00:00:00.000Z',
        isExpired,
        tenantStatus,
        monthlyBillingInr: Number(tenant.monthly_billing_inr || (tenant.subscription_tier === 'MODULAR' ? 1999 : 4999))
      }
    }
  } catch (err) {
    console.warn('[resolveUserTenant] Tenant lookup notice:', err)
  }

  // 3. Check public.profiles using admin client to bypass any RLS limitations
  let profileRole = ''
  let profileUsername = ''
  let profileIsHead = false
  let profileAllowedModules: string[] = []
  let profileDesignation = ''
  try {
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('username, role, is_head, allowed_modules, designation')
      .eq('id', user.id)
      .maybeSingle()
    if (prof) {
      profileRole = prof.role || ''
      profileUsername = prof.username || ''
      profileIsHead = Boolean(prof.is_head)
      profileAllowedModules = Array.isArray(prof.allowed_modules) ? prof.allowed_modules : []
      profileDesignation = prof.designation || ''
    }
  } catch (_) {}

  const isHead = profileIsHead || metadata.is_head || profileAllowedModules.length > 0
  const isSuperAdmin = !isHead && (profileRole?.toUpperCase() === 'SUPERADMIN' || userEmail === 'team.anga9@gmail.com')
  const effectiveRole = isHead
    ? (profileDesignation || metadata.designation || profileRole || 'DEPARTMENT_HEAD')
    : (profileRole || metadata.role || (isSuperAdmin ? 'SUPERADMIN' : 'STAFF')).toUpperCase()

  // If user metadata explicitly designates an organization
  if (metadata.company) {
    return {
      userId: user.id,
      userEmail,
      role: effectiveRole,
      isSuperAdmin,
      isPlatformAdmin: false,
      companyName: metadata.company,
      adminDisplayName: metadata.displayName || 'Plant Head',
      customUsername: profileUsername || metadata.username || 'client_admin',
      phone: '',
      cityState: 'India',
      subscriptionTier: 'FULL_PLANT_AI',
      allowedDivisions: isSuperAdmin ? ALL_DEFAULT_DIVISIONS : (profileAllowedModules.length > 0 ? profileAllowedModules : ['/stitching-sewing']),
      isProvisionedTenant: true,
      accessType: 'FULL_ACCESS',
      isExpired: false,
      tenantStatus: 'ACTIVE',
      provisionedAt: '2026-09-15T00:00:00.000Z',
      monthlyBillingInr: 4999
    }
  }

  // 4. Default Fallback Routing
  // Only users specifically belonging to Nubira Creation (legacy plant) receive Nubira Creation context
  const isLegacyNubiraUser =
    userEmail === 'team.anga9@gmail.com' ||
    userEmail === 'admin@nubira.local' ||
    userEmail.endsWith('@nubira.local')

  if (isLegacyNubiraUser) {
    return {
      userId: user.id,
      userEmail,
      role: effectiveRole || 'STAFF',
      isSuperAdmin,
      isPlatformAdmin: false,
      companyName: 'Nubira Creation',
      adminDisplayName: profileUsername || 'Nubira Admin',
      customUsername: profileUsername || 'admin',
      phone: '+91 98765 43210',
      cityState: 'Kolkata, West Bengal',
      subscriptionTier: 'FULL_PLANT_AI',
      allowedDivisions: ['/stitching-sewing', '/store'],
      isProvisionedTenant: false,
      accessType: 'DEMO_TRIAL',
      isExpired: false,
      tenantStatus: 'ACTIVE',
      provisionedAt: '2026-09-15T00:00:00.000Z',
      expiresAt: '2026-09-22T23:59:59.000Z',
      monthlyBillingInr: 4999
    }
  }

  // Any other external account is an isolated client factory tenant
  const inferredCompanyName = userEmail.includes('shaw')
    ? 'Shaw Industries'
    : userEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Enterprise'

  return {
    userId: user.id,
    userEmail,
    role: effectiveRole || 'SUPERADMIN',
    isSuperAdmin: true,
    isPlatformAdmin: false,
    companyName: inferredCompanyName,
    adminDisplayName: profileUsername || metadata.displayName || 'Plant Head',
    customUsername: profileUsername || metadata.username || `${userEmail.split('@')[0]}_admin`,
    phone: '',
    cityState: 'India',
    subscriptionTier: 'FULL_PLANT_AI',
    allowedDivisions: ALL_DEFAULT_DIVISIONS,
    isProvisionedTenant: true,
    accessType: 'DEMO_TRIAL',
    isExpired: false,
    tenantStatus: 'ACTIVE',
    provisionedAt: '2026-09-15T00:00:00.000Z',
    expiresAt: '2026-09-22T23:59:59.000Z',
    monthlyBillingInr: 4999
  }
}

/**
 * Checks if a resolved tenant profile belongs to the primary legacy plant (Nubira Creation).
 * Used across operational division modules to ensure 100% of historical production data is preserved
 * for team.anga9@gmail.com, while newly registered client factories start with an isolated sandbox.
 */
export function isLegacyNubiraTenant(tenant: ResolvedTenantProfile): boolean {
  if (!tenant) return false
  const email = (tenant.userEmail || '').toLowerCase().trim()
  const comp = (tenant.companyName || '').toLowerCase().trim()
  return (
    email === 'team.anga9@gmail.com' ||
    email === 'admin@nubira.local' ||
    email.endsWith('@nubira.local') ||
    comp === 'nubira creation'
  )
}
