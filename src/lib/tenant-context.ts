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
      isProvisionedTenant: false
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

    if (tenant) {
      const divisions = Array.isArray(tenant.allowed_divisions) && tenant.allowed_divisions.length > 0
        ? tenant.allowed_divisions
        : ALL_DEFAULT_DIVISIONS

      return {
        userId: user.id,
        userEmail,
        role: 'SUPERADMIN',
        isSuperAdmin: true,
        isPlatformAdmin: false,
        companyName: tenant.company_name,
        adminDisplayName: tenant.admin_name || metadata.displayName || 'Plant Head',
        customUsername: metadata.username || `${tenant.plant_slug}_admin`,
        phone: tenant.phone || '',
        cityState: tenant.city_state || 'India',
        subscriptionTier: tenant.subscription_tier || 'FULL_PLANT_AI',
        allowedDivisions: divisions,
        isProvisionedTenant: true
      }
    }
  } catch (err) {
    console.warn('[resolveUserTenant] Tenant lookup notice:', err)
  }

  // 3. Check public.profiles using admin client to bypass any RLS limitations
  let profileRole = ''
  let profileUsername = ''
  try {
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .maybeSingle()
    if (prof) {
      profileRole = prof.role || ''
      profileUsername = prof.username || ''
    }
  } catch (_) {}

  // Effective role priority: profiles.role > metadata.role
  const effectiveRole = (profileRole || metadata.role || '').toUpperCase()
  const isSuperAdmin = effectiveRole === 'SUPERADMIN' || effectiveRole === 'ADMIN'

  // If user metadata explicitly designates an organization
  if (metadata.company) {
    return {
      userId: user.id,
      userEmail,
      role: effectiveRole || 'SUPERADMIN',
      isSuperAdmin: true,
      isPlatformAdmin: false,
      companyName: metadata.company,
      adminDisplayName: metadata.displayName || 'Plant Head',
      customUsername: profileUsername || metadata.username || 'client_admin',
      phone: '',
      cityState: 'India',
      subscriptionTier: 'FULL_PLANT_AI',
      allowedDivisions: ALL_DEFAULT_DIVISIONS,
      isProvisionedTenant: true
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
      allowedDivisions: ALL_DEFAULT_DIVISIONS,
      isProvisionedTenant: false
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
    isProvisionedTenant: true
  }
}
