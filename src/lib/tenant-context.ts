import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CacheManager } from './cache/cache-manager'

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
 * and permissions for any authenticated user with high-performance multi-tier caching.
 */
export async function resolveUserTenant(user: {
  id: string
  email?: string
  user_metadata?: any
}): Promise<ResolvedTenantProfile> {
  const userEmail = (user.email || '').trim().toLowerCase()
  const cacheKey = `tenant:user:${user.id}:${userEmail}`

  return CacheManager.fetchOrSet<ResolvedTenantProfile>(
    cacheKey,
    () => resolveUserTenantFresh(user),
    600, // 10 minutes TTL — tenant profiles rarely change mid-session
    [`user:${user.id}`, `email:${userEmail}`, 'tenant_resolution']
  )
}

/**
 * Clears the cached tenant profile for a specific user.
 */
export async function invalidateUserTenantCache(userId: string, userEmail?: string) {
  if (userId) {
    await CacheManager.invalidateTag(`user:${userId}`)
  }
  if (userEmail) {
    await CacheManager.invalidateTag(`email:${userEmail.trim().toLowerCase()}`)
  }
}

async function resolveUserTenantFresh(user: {
  id: string
  email?: string
  user_metadata?: any
}): Promise<ResolvedTenantProfile> {
  const userEmail = (user.email || '').trim().toLowerCase()
  const metadata = user.user_metadata || {}

  // 1. Platform Root SuperAdmin — instant short-circuit, no DB needed
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

  // Pre-compute phone digits once (used by all worker lookups)
  const rawDigits = userEmail.split('@')[0].replace(/\D/g, '')
  const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits
  const hasPhone = phone10.length === 10

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 PARALLEL EXECUTION: Fire ALL lookups simultaneously instead of sequentially
  // Previously: 10-16 sequential queries → 3-5 seconds
  // Now: All in parallel → ~300ms (time of the slowest single query)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Helper: build a worker query for a given table
  function buildWorkerQuery(table: string, userIdCol: string, emailCol: string) {
    let q = supabaseAdmin.from(table).select('*')
    if (hasPhone) {
      q = q.or(`${userIdCol}.eq.${user.id},${emailCol}.eq.${userEmail},phone_number.eq.${phone10},phone_number.ilike.%${phone10}%`)
    } else {
      q = q.or(`${userIdCol}.eq.${user.id},${emailCol}.eq.${userEmail}`)
    }
    return q.limit(1).maybeSingle()
  }

  // Helper: build a task allocation fallback query
  function buildTaskQuery(table: string) {
    let q = supabaseAdmin.from(table).select('worker_name, worker_phone, worker_id')
    if (hasPhone) {
      q = q.or(`worker_id.eq.${user.id},worker_phone.ilike.%${phone10}%`)
    } else {
      q = q.eq('worker_id', user.id)
    }
    return q.limit(1).maybeSingle()
  }

  // Helper: build design team member query
  function buildDesignQuery() {
    let q = supabaseAdmin.from('design_team_members').select('*')
    if (hasPhone) {
      q = q.or(`designer_user_id.eq.${user.id},designer_email.eq.${userEmail},phone_number.eq.${phone10},designer_phone.eq.${phone10}`)
    } else {
      q = q.or(`designer_user_id.eq.${user.id},designer_email.eq.${userEmail}`)
    }
    return q.limit(1).maybeSingle()
  }

  // Fire ALL queries in parallel
  const [
    cuttingWorkerRes,
    cuttingTaskRes,
    printingWorkerRes,
    printingTaskRes,
    embroideryWorkerRes,
    embroideryTaskRes,
    washingWorkerRes,
    washingTaskRes,
    ironWorkerRes,
    ironTaskRes,
    designMemberRes,
    tenantExactRes,
    tenantCompanyRes,
    profileRes,
  ] = await Promise.allSettled([
    buildWorkerQuery('cutting_workers', 'worker_user_id', 'worker_email'),            // 0
    buildTaskQuery('cutting_task_allocations'),                                          // 1
    buildWorkerQuery('printing_workers', 'worker_user_id', 'worker_email'),            // 2
    buildTaskQuery('printing_task_allocations'),                                         // 3
    buildWorkerQuery('embroidery_workers', 'worker_user_id', 'worker_email'),          // 4
    buildTaskQuery('embroidery_task_allocations'),                                       // 5
    buildWorkerQuery('washing_workers', 'worker_user_id', 'worker_email'),             // 6
    buildTaskQuery('washing_task_allocations'),                                          // 7
    buildWorkerQuery('iron_workers', 'worker_user_id', 'worker_email'),                // 8
    buildTaskQuery('iron_task_allocations'),                                              // 9
    buildDesignQuery(),                                                                   // 10
    supabaseAdmin.from('platform_tenant_factories').select('*').ilike('admin_email', userEmail).maybeSingle(),  // 11
    metadata.company                                                                      // 12
      ? supabaseAdmin.from('platform_tenant_factories').select('*').ilike('company_name', metadata.company.trim()).maybeSingle()
      : Promise.resolve({ data: null }),
    supabaseAdmin.from('profiles').select('username, role, allowed_modules, is_head, designation, company_name').eq('id', user.id).maybeSingle(),  // 13
  ])

  // Safe extractors
  const extract = <T,>(res: PromiseSettledResult<{ data: T | null }>): T | null => {
    if (res.status === 'fulfilled' && res.value?.data) return res.value.data
    return null
  }

  const cuttingWorker = extract(cuttingWorkerRes as any)
  const cuttingTask = extract(cuttingTaskRes as any)
  const printingWorker = extract(printingWorkerRes as any)
  const printingTask = extract(printingTaskRes as any)
  const embroideryWorker = extract(embroideryWorkerRes as any)
  const embroideryTask = extract(embroideryTaskRes as any)
  const washingWorker = extract(washingWorkerRes as any)
  const washingTask = extract(washingTaskRes as any)
  const ironWorker = extract(ironWorkerRes as any)
  const ironTask = extract(ironTaskRes as any)
  const designMember = extract(designMemberRes as any)
  let tenant: any = extract(tenantExactRes as any)
  if (!tenant) tenant = extract(tenantCompanyRes as any)
  const profile: any = extract(profileRes as any)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROCESS RESULTS IN PRIORITY ORDER (same logic as before, just using pre-fetched data)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Helper to build a floor worker profile
  function buildWorkerProfile(
    matchedWorker: any,
    taskWorkerName: string,
    role: string,
    defaultName: string,
    allowedDivisions: string[],
    usernamePostfix: string,
    localSuffix: string
  ): ResolvedTenantProfile | null {
    const metaName = metadata.full_name && metadata.full_name !== 'Floor Operator' && metadata.full_name !== defaultName
      ? metadata.full_name
      : ''
    
    const isMatch = matchedWorker || taskWorkerName || metadata.role === role || userEmail.endsWith(`@${localSuffix}.nubira.local`)
    if (!isMatch) return null

    const workerName = matchedWorker?.worker_name || taskWorkerName || metaName || defaultName
    const workerPhone = matchedWorker?.phone_number || metadata.phone_number || phone10
    return {
      userId: user.id,
      userEmail,
      role,
      isSuperAdmin: false,
      isPlatformAdmin: false,
      companyName: matchedWorker?.company_name || metadata.company_name || metadata.company || 'Nubira Creation',
      adminDisplayName: workerName,
      customUsername: `${workerName.toLowerCase().replace(/\s+/g, '_')}_${usernamePostfix}`,
      phone: workerPhone,
      cityState: 'India',
      subscriptionTier: 'ENTERPRISE_PLAN',
      allowedDivisions,
      isProvisionedTenant: true,
      accessType: 'FULL_ACCESS',
      isExpired: false,
      tenantStatus: matchedWorker?.status || 'ACTIVE',
      provisionedAt: matchedWorker?.created_at || '2026-09-17T00:00:00.000Z'
    }
  }

  // 1.5 Cutting worker check
  const cuttingProfile = buildWorkerProfile(
    cuttingWorker, (cuttingTask as any)?.worker_name || '',
    'CUTTING_WORKER', 'Cutting Floor Operator',
    ['/cutting/worker', '/cutting/worker/history', '/cutting/worker/profile'],
    'cutting', 'cutting'
  )
  if (cuttingProfile) return cuttingProfile

  // 1.55 Printing worker check
  const printingProfile = buildWorkerProfile(
    printingWorker, (printingTask as any)?.worker_name || '',
    'PRINTING_WORKER', 'Printing Floor Operator',
    ['/printing/worker', '/printing/worker/history', '/printing/worker/profile'],
    'printing', 'printing'
  )
  if (printingProfile) return printingProfile

  // 1.56 Embroidery worker check
  const embroideryProfile = buildWorkerProfile(
    embroideryWorker, (embroideryTask as any)?.worker_name || '',
    'EMBROIDERY_WORKER', 'Embroidery Machine Operator',
    ['/embroidery/worker', '/embroidery/worker/history', '/embroidery/worker/profile'],
    'embroidery', 'embroidery'
  )
  if (embroideryProfile) return embroideryProfile

  // 1.57 Washing worker check
  const washingProfile = buildWorkerProfile(
    washingWorker, (washingTask as any)?.worker_name || '',
    'WASHING_WORKER', 'Washing Floor Operator',
    ['/washing/worker', '/washing/worker/history', '/washing/worker/profile'],
    'washing', 'washing'
  )
  if (washingProfile) return washingProfile

  // 1.58 Iron worker check
  const ironProfile = buildWorkerProfile(
    ironWorker, (ironTask as any)?.worker_name || '',
    'IRON_WORKER', 'Steam Iron Presser',
    ['/iron/worker', '/iron/worker/history', '/iron/worker/profile'],
    'iron', 'iron'
  )
  if (ironProfile) return ironProfile

  // 1.6 Design team member check
  if (designMember) {
    const dm = designMember as any
    const company = dm.company_name || 'Nubira Creation'
    return {
      userId: user.id,
      userEmail,
      role: 'DESIGNER',
      isSuperAdmin: false,
      isPlatformAdmin: false,
      companyName: company,
      adminDisplayName: dm.designer_name || 'Creative Designer',
      customUsername: dm.username || `${(dm.designer_name || 'designer').toLowerCase().replace(/\s+/g, '_')}_nubira`,
      phone: dm.phone_number || dm.designer_phone || '',
      cityState: 'India',
      subscriptionTier: 'ENTERPRISE_PLAN',
      allowedDivisions: ['/design/designer', '/design/profile'],
      isProvisionedTenant: true,
      accessType: 'FULL_ACCESS',
      isExpired: false,
      tenantStatus: dm.status || 'ACTIVE',
      provisionedAt: dm.created_at || '2026-09-15T00:00:00.000Z'
    }
  }

  // 2. Tenant factory lookup — keyword fallbacks (only if exact + company match failed)
  if (!tenant && userEmail.includes('shaw')) {
    try {
      const { data: shawTenant } = await supabaseAdmin
        .from('platform_tenant_factories')
        .select('*')
        .or('plant_slug.ilike.%shaw%,company_name.ilike.%shaw%')
        .limit(1)
        .maybeSingle()
      tenant = shawTenant
    } catch (_) {}
  }

  if (!tenant && (userEmail.includes('nubira') || userEmail === 'team.anga9@gmail.com' || userEmail === 'aj@nubiracreation.com' || userEmail.startsWith('aj@'))) {
    try {
      const { data: nubiraTenant } = await supabaseAdmin
        .from('platform_tenant_factories')
        .select('*')
        .or('plant_slug.ilike.%nubira%,company_name.ilike.%nubira%')
        .limit(1)
        .maybeSingle()
      tenant = nubiraTenant
    } catch (_) {}
  }

  if (tenant) {
    // Check if user is the tenant's primary factory admin
    const isTenantAdmin = Boolean(
      (tenant.admin_email && tenant.admin_email.toLowerCase() === userEmail.toLowerCase()) ||
      userEmail === 'admin@zigza.in' ||
      userEmail === 'team.anga9@gmail.com' ||
      userEmail === 'aj@nubiracreation.com'
    )

    // Use the already-fetched profile data
    let profileRole = profile?.role || ''
    let profileUsername = profile?.username || ''
    let profileAllowedModules: string[] = Array.isArray(profile?.allowed_modules) ? profile.allowed_modules : []
    let profileIsHead = Boolean(profile?.is_head)
    let profileDesignation = profile?.designation || ''

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
    const provisionedTime = tenant.provisioned_at ? new Date(tenant.provisioned_at).getTime() : Date.now()
    const defaultCalculatedExpiry = accessType === 'DEMO_TRIAL'
      ? new Date(provisionedTime + 7 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(provisionedTime + 30 * 24 * 60 * 60 * 1000).toISOString()

    let expiresAt = tenant.expires_at || defaultCalculatedExpiry
    // Auto-correct any Full Access accounts that were mistakenly given a 7/8-day trial expiry
    if (accessType === 'FULL_ACCESS' && tenant.expires_at) {
      const storedExpiryTime = new Date(tenant.expires_at).getTime()
      if (storedExpiryTime - provisionedTime < 15 * 24 * 60 * 60 * 1000) {
        expiresAt = new Date(provisionedTime + 30 * 24 * 60 * 60 * 1000).toISOString()
        try {
          supabaseAdmin
            .from('platform_tenant_factories')
            .update({ expires_at: expiresAt })
            .eq('id', tenant.id)
            .then(() => {})
        } catch (_) {}
      }
    }
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

  // 3. Check profiles for company_name and try to match a tenant factory
  const profileCompanyName = profile?.company_name || ''
  if (profileCompanyName) {
    try {
      const { data: matchedFactory } = await supabaseAdmin
        .from('platform_tenant_factories')
        .select('*')
        .ilike('company_name', profileCompanyName.trim())
        .maybeSingle()

      if (matchedFactory) {
        const profileAllowedModules: string[] = Array.isArray(profile?.allowed_modules) ? profile.allowed_modules : []
        const profileIsHead = Boolean(profile?.is_head)
        const profileRole = profile?.role || ''
        const profileUsername = profile?.username || ''
        const profileDesignation = profile?.designation || ''

        const isHead = profileIsHead || metadata.is_head || profileAllowedModules.length > 0
        const isSuperAdmin = !isHead && (profileRole?.toUpperCase() === 'SUPERADMIN' || profileRole?.toUpperCase() === 'ADMIN')
        const effectiveRole = isHead
          ? (profileDesignation || metadata.designation || profileRole || 'DEPARTMENT_HEAD')
          : (profileRole || metadata.role || (isSuperAdmin ? 'SUPERADMIN' : 'STAFF')).toUpperCase()

        const accessType: 'DEMO_TRIAL' | 'FULL_ACCESS' = matchedFactory.access_type || 'FULL_ACCESS'
        const isSuspended = matchedFactory.status === 'SUSPENDED' || matchedFactory.status === 'EXPIRED'
        const isPastExpiry = matchedFactory.expires_at ? new Date(matchedFactory.expires_at).getTime() < Date.now() : false
        const isExpired = isSuspended || isPastExpiry

        return {
          userId: user.id,
          userEmail,
          role: effectiveRole,
          isSuperAdmin,
          isPlatformAdmin: false,
          companyName: matchedFactory.company_name,
          adminDisplayName: profileUsername || metadata.displayName || 'Staff Member',
          customUsername: profileUsername || metadata.username || `${userEmail.split('@')[0]}`,
          phone: metadata.phone || '',
          cityState: matchedFactory.city_state || 'India',
          subscriptionTier: matchedFactory.subscription_tier || 'FULL_PLANT_AI',
          allowedDivisions: isSuperAdmin ? ALL_DEFAULT_DIVISIONS : (profileAllowedModules.length > 0 ? profileAllowedModules : ['/stitching-sewing']),
          isProvisionedTenant: true,
          accessType,
          isExpired,
          tenantStatus: matchedFactory.status || 'ACTIVE',
          provisionedAt: matchedFactory.provisioned_at || '2026-09-15T00:00:00.000Z',
          expiresAt: matchedFactory.expires_at || '2026-10-15T00:00:00.000Z',
          monthlyBillingInr: Number(matchedFactory.monthly_billing_inr || 4999)
        }
      }
    } catch (_) {}
  }

  // 4. No matching tenant found — return deactivated state
  return {
    userId: user.id,
    userEmail,
    role: 'DEACTIVATED',
    isSuperAdmin: false,
    isPlatformAdmin: false,
    companyName: 'Account Deactivated',
    adminDisplayName: 'Deactivated Account',
    customUsername: profile?.username || metadata.username || 'deactivated',
    phone: '',
    cityState: 'India',
    subscriptionTier: 'MODULAR',
    allowedDivisions: [],
    isProvisionedTenant: false,
    accessType: 'DEMO_TRIAL',
    isExpired: true,
    tenantStatus: 'DELETED',
    provisionedAt: '2026-09-15T00:00:00.000Z',
    expiresAt: '1970-01-01T00:00:00.000Z',
    monthlyBillingInr: 0
  }
}

/**
 * Checks if a resolved tenant profile belongs to the custom/flagship Nubira Creation plant or CUSTOM tier.
 */
export function isLegacyNubiraTenant(tenant: ResolvedTenantProfile): boolean {
  if (!tenant) return false
  const comp = (tenant.companyName || '').toLowerCase()
  const email = (tenant.userEmail || '').toLowerCase()
  return (
    !tenant.isProvisionedTenant ||
    comp.includes('nubira') ||
    email === 'aj@nubiracreation.com' ||
    email === 'team.anga9@gmail.com' ||
    email === 'admin@zigza.in' ||
    email.endsWith('@nubira.local') ||
    email.includes('nubira') ||
    tenant.subscriptionTier === 'CUSTOM'
  )
}
