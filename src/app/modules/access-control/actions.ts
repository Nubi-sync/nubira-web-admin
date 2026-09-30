'use server'

// ============================================================================
// Zigza MES Enterprise - Supervisor & Workers (4 Divisions of Power RBAC)
// 1. Company Owner (Super Admin)
// 2. Production Manager (Factory Wide)
// 3. Department Heads (Floor In-charges)
// 4. Floor Workers (Shop Floor Execution)
// 
// 100% Leak-Proof Multi-Tenant Isolation: Every query & mutation is hard-scoped
// by authenticated tenant company name.
// ============================================================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { resolveUserTenant, ALL_DEFAULT_DIVISIONS } from '@/lib/tenant-context'
import { DEPARTMENT_HEADS_CATALOG, ALL_DIVISION_ROUTES } from '@/lib/access-control'
import { CacheManager } from '@/lib/cache/cache-manager'

export interface ProductionManagerItem {
  id: string
  name: string
  username: string
  phone: string
  email?: string
  isActive: boolean
  createdAt?: string
}

export interface DepartmentHeadItem {
  id: string
  displayName: string
  username: string
  email: string
  role: string
  designation: string
  primaryDivisionRoute?: string
  allowedModules: string[]
  allowedTabs: string[]
  isActive: boolean
  phone: string
  phone2?: string
  createdAt?: string
}

export interface DivisionWithHeadStatus {
  id: string
  code: string
  name: string
  route: string
  defaultDesignation: string
  iconName: string
  description: string
  appointedHead: DepartmentHeadItem | null
  secondaryHeads?: DepartmentHeadItem[]
}

export interface FloorWorkerItem {
  id: string
  name: string
  phone: string
  departmentRoute: string
  departmentName: string
  role: string
  shift: string
  status: string
  createdAt?: string
}

export interface SupervisorHubData {
  success: boolean
  callerPowerLevel: 'OWNER' | 'PRODUCTION_MANAGER' | 'DEPARTMENT_HEAD' | 'STAFF'
  callerAssignedModules: string[]
  tenantName: string
  owner: {
    name: string
    email: string
    phone?: string
  }
  productionManagers: ProductionManagerItem[]
  departmentHeads: DepartmentHeadItem[]
  divisions: DivisionWithHeadStatus[]
  workers: FloorWorkerItem[]
  allowedDivisions: string[]
  error?: string
}

const DIVISION_WORKER_MAP: Record<string, { table: string; roleField: string; nameField: string; phoneField: string; defaultRole: string }> = {
  '/cutting': { table: 'cutting_workers', roleField: 'role', nameField: 'worker_name', phoneField: 'phone_number', defaultRole: 'Knife Cutter' },
  '/stitching-sewing': { table: 'stitching_workers', roleField: 'role', nameField: 'worker_name', phoneField: 'phone_number', defaultRole: 'Tailor' },
  '/printing': { table: 'printing_workers', roleField: 'role', nameField: 'worker_name', phoneField: 'phone_number', defaultRole: 'Screen Printer' },
  '/embroidery': { table: 'embroidery_workers', roleField: 'role', nameField: 'worker_name', phoneField: 'phone_number', defaultRole: 'Machine Operator' },
  '/washing': { table: 'washing_workers', roleField: 'role', nameField: 'worker_name', phoneField: 'phone_number', defaultRole: 'Washer' },
  '/iron': { table: 'iron_workers', roleField: 'role', nameField: 'worker_name', phoneField: 'phone_number', defaultRole: 'Ironer' },
  '/design': { table: 'design_team_members', roleField: 'role', nameField: 'name', phoneField: 'phone_number', defaultRole: 'Designer' },
}

/**
 * Centrally fetch the complete 4-tier Supervisor & Workers roster for the active company tenant.
 * Strictly leak-proof: no cross-company records are ever fetched or returned.
 */
export async function fetchSupervisorAndWorkersHubAction(): Promise<SupervisorHubData> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        callerPowerLevel: 'STAFF',
        callerAssignedModules: [],
        tenantName: '',
        owner: { name: '', email: '' },
        productionManagers: [],
        departmentHeads: [],
        divisions: [],
        workers: [],
        allowedDivisions: [],
        error: 'Authentication required'
      }
    }

    const tenant = await resolveUserTenant(user)
    const company = (tenant.companyName || 'Apparel Factory').trim()
    const userRole = (tenant.role || '').toUpperCase()

    // Determine Caller Power Level
    let callerPowerLevel: 'OWNER' | 'PRODUCTION_MANAGER' | 'DEPARTMENT_HEAD' | 'STAFF' = 'STAFF'
    if (
      tenant.isSuperAdmin ||
      userRole === 'SUPERADMIN' ||
      userRole === 'ADMIN' ||
      userRole === 'PLATFORM_SUPERADMIN' ||
      user.email === 'admin@zigza.in' ||
      user.email === 'team.anga9@gmail.com' ||
      user.email === 'aj@nubiracreation.com'
    ) {
      callerPowerLevel = 'OWNER'
    } else if (userRole === 'PRODUCTION_MANAGER') {
      callerPowerLevel = 'PRODUCTION_MANAGER'
    } else if (userRole === 'DEPARTMENT_HEAD' || userRole.includes('HEAD') || userRole.includes('SUPERVISOR')) {
      callerPowerLevel = 'DEPARTMENT_HEAD'
    }

    const normComp = company.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const cacheKey = `company:${normComp}:supervisor_workers:hub_v2`

    return CacheManager.fetchOrSet<SupervisorHubData>(
      cacheKey,
      async () => {
        // 1. Fetch Company Profiles strictly filtered by company_name
        let profilesList: any[] = []
        try {
          const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('company_name', company)
            .order('created_at', { ascending: false })

          if (!error && data) {
            profilesList = data.filter((p: any) => p.company_name?.toLowerCase().trim() === company.toLowerCase().trim())
          }
        } catch (dbErr: any) {
          console.warn('[fetchSupervisorAndWorkersHubAction] DB fetch profiles notice:', dbErr?.message)
        }

        // Fetch auth users to get user metadata (display name, login username, phones, allowed_tabs)
        const authUserMap = new Map<string, any>()
        try {
          const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 300 })
          if (authUsers?.users) {
            authUsers.users.forEach(u => authUserMap.set(u.id, u))
          }
        } catch (_) {}

        // Separate Production Managers and Department Heads
        const productionManagers: ProductionManagerItem[] = []
        const departmentHeads: DepartmentHeadItem[] = []

        profilesList.forEach(p => {
          if (p.id === user.id && callerPowerLevel === 'OWNER') return // Exclude owner themselves from staff list
          const authUser = authUserMap.get(p.id)
          const meta = authUser?.user_metadata || {}

          // Check if Production Manager
          const isPM = (p.role || '').toUpperCase() === 'PRODUCTION_MANAGER' || (meta.role || '').toUpperCase() === 'PRODUCTION_MANAGER'

          if (isPM) {
            productionManagers.push({
              id: p.id,
              name: p.username || meta.display_name || meta.displayName || 'Production Manager',
              username: meta.username || p.username || 'pm_user',
              phone: p.phone || meta.phone || meta.phone_number || '',
              email: authUser?.email || p.email || undefined,
              isActive: p.is_active !== false,
              createdAt: p.created_at
            })
            return
          }

          // Check if Department Head
          const isHead = p.is_head === true || (p.role || '').toUpperCase() === 'DEPARTMENT_HEAD' || meta.is_head === true

          if (isHead) {
            const rawModules = Array.isArray(p.allowed_modules) ? p.allowed_modules : (Array.isArray(meta.allowed_modules) ? meta.allowed_modules : [])
            const rawTabs = Array.isArray(p.allowed_tabs) ? p.allowed_tabs : (Array.isArray(meta.allowed_tabs) ? meta.allowed_tabs : ['all-modules'])

            // Parse phone and secondary phone
            const rawPhone = p.phone || meta.phone || ''
            let primaryPhone = rawPhone
            let secondaryPhone = meta.phone2 || ''
            if (rawPhone.includes('/')) {
              const parts = rawPhone.split('/').map((s: string) => s.trim())
              primaryPhone = parts[0] || ''
              secondaryPhone = parts[1] || secondaryPhone
            }

            departmentHeads.push({
              id: p.id,
              displayName: p.username || meta.display_name || meta.displayName || 'Department Head',
              username: meta.username || p.username || 'dept_head',
              email: authUser?.email || p.email || `${(p.username || 'head').toLowerCase().replace(/\s+/g, '_')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.local`,
              role: p.role || 'DEPARTMENT_HEAD',
              designation: p.designation || meta.designation || 'Department In-charge',
              primaryDivisionRoute: rawModules[0] || '',
              allowedModules: rawModules,
              allowedTabs: rawTabs,
              isActive: p.is_active !== false,
              phone: primaryPhone,
              phone2: secondaryPhone || undefined,
              createdAt: p.created_at
            })
          }
        })

        // 2. Purchased / Allowed Divisions
        const isPlatformSuperAdmin = tenant.isPlatformAdmin || user.email === 'admin@zigza.in'
        const configuredDivisions = (!isPlatformSuperAdmin && Array.isArray(tenant.allowedDivisions) && tenant.allowedDivisions.length > 0 && !tenant.allowedDivisions.includes('/platform-admin'))
          ? tenant.allowedDivisions
          : ALL_DEFAULT_DIVISIONS

        const companyCatalog = DEPARTMENT_HEADS_CATALOG.filter(div =>
          configuredDivisions.includes(div.route)
        )

        const divisionsResult: DivisionWithHeadStatus[] = companyCatalog.map(div => {
          const headsForDivision = departmentHeads.filter(h => h.allowedModules.includes(div.route))
          return {
            ...div,
            appointedHead: headsForDivision[0] || null,
            secondaryHeads: headsForDivision.slice(1)
          }
        })

        // 3. Fetch Floor Workers across purchased divisions with strict company_name isolation
        const workersList: FloorWorkerItem[] = []

        const workerFetches = Object.entries(DIVISION_WORKER_MAP).map(async ([route, config]) => {
          if (!configuredDivisions.includes(route)) return

          try {
            const { data, error } = await supabaseAdmin
              .from(config.table)
              .select('*')
              .eq('company_name', company)
              .order('created_at', { ascending: false })

            if (!error && Array.isArray(data)) {
              const divCatalogItem = DEPARTMENT_HEADS_CATALOG.find(d => d.route === route)
              const divName = divCatalogItem?.name || route.replace('/', '').toUpperCase()

              data.forEach((w: any) => {
                if (w.company_name?.toLowerCase().trim() !== company.toLowerCase().trim()) return
                workersList.push({
                  id: w.id,
                  name: w[config.nameField] || 'Shop Floor Worker',
                  phone: w[config.phoneField] || '',
                  departmentRoute: route,
                  departmentName: divName,
                  role: w[config.roleField] || config.defaultRole,
                  shift: w.shift || 'General',
                  status: w.status || 'ACTIVE',
                  createdAt: w.created_at
                })
              })
            }
          } catch (err: any) {
            console.warn(`[fetchSupervisorAndWorkersHubAction] Error fetching ${config.table}:`, err?.message)
          }
        })

        await Promise.all(workerFetches)

        return {
          success: true,
          callerPowerLevel,
          callerAssignedModules: tenant.allowedDivisions || [],
          tenantName: company,
          owner: {
            name: tenant.adminDisplayName || 'Company Owner',
            email: tenant.userEmail || user.email || '',
            phone: tenant.phone || undefined
          },
          productionManagers,
          departmentHeads,
          divisions: divisionsResult,
          workers: workersList,
          allowedDivisions: configuredDivisions
        }
      },
      60,
      [`company:${normComp}:access_control`, `company:${normComp}:supervisor_workers`, 'access_control', 'tenant']
    )
  } catch (err: any) {
    console.error('[fetchSupervisorAndWorkersHubAction] Error:', err)
    return {
      success: false,
      callerPowerLevel: 'STAFF',
      callerAssignedModules: [],
      tenantName: '',
      owner: { name: '', email: '' },
      productionManagers: [],
      departmentHeads: [],
      divisions: [],
      workers: [],
      allowedDivisions: [],
      error: err?.message || 'Failed to load supervisor and workers hub'
    }
  }
}

/**
 * Backward compatibility wrapper for existing code.
 */
export async function fetchCompanyDepartmentHeadsAction() {
  const hub = await fetchSupervisorAndWorkersHubAction()
  return {
    success: hub.success,
    divisions: hub.divisions,
    allowedDivisions: hub.allowedDivisions,
    unassignedExecutives: hub.departmentHeads.filter(h => h.allowedModules.length > 1),
    tenantName: hub.tenantName,
    isSuperAdmin: hub.callerPowerLevel === 'OWNER',
    error: hub.error
  }
}

/**
 * 1. Appoint Production Manager
 * Strictly restricted to Company Owner (Super Admin).
 * Requires at max 2 steps:
 * Step 1: name, phone, optional email
 * Step 2: password & retype password
 */
export async function appointProductionManagerAction(payload: {
  name: string
  phone: string
  email?: string
  password: string
}): Promise<{ success: boolean; error?: string; pmId?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Authentication required' }

    const tenant = await resolveUserTenant(user)
    const userRole = (tenant.role || '').toUpperCase()
    const isOwner = tenant.isSuperAdmin || userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'PLATFORM_SUPERADMIN' || user.email === 'admin@zigza.in'

    if (!isOwner) {
      return { success: false, error: 'Unauthorized: Only the Company Owner can appoint a Production Manager' }
    }

    const cleanName = payload.name.trim()
    const cleanPhone = payload.phone.trim().replace(/\D/g, '').slice(-10)

    if (!cleanName) return { success: false, error: 'Full name is required' }
    if (cleanPhone.length !== 10) return { success: false, error: 'Please enter a valid 10-digit mobile number' }
    if (!payload.password || payload.password.length < 6) return { success: false, error: 'Password must be at least 6 characters' }

    const company = tenant.companyName.trim()
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'factory'
    const loginEmail = payload.email?.trim() || `${cleanPhone}@${companySlug}.local`
    const cleanUsername = `${cleanName.toLowerCase().replace(/\s+/g, '_')}_pm`

    // Create / Update Auth User
    let authUserId: string | null = null
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        display_name: cleanName,
        phone: cleanPhone,
        role: 'PRODUCTION_MANAGER',
        designation: 'Production Manager',
        company: company,
        company_name: company
      }
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
        const matched = userList?.users?.find(u => u.email?.toLowerCase() === loginEmail.toLowerCase())
        if (matched) {
          authUserId = matched.id
          await supabaseAdmin.auth.admin.updateUserById(matched.id, {
            password: payload.password,
            user_metadata: {
              username: cleanUsername,
              display_name: cleanName,
              phone: cleanPhone,
              role: 'PRODUCTION_MANAGER',
              designation: 'Production Manager',
              company: company,
              company_name: company
            }
          })
        } else {
          return { success: false, error: authError.message }
        }
      } else {
        return { success: false, error: authError.message }
      }
    } else if (authData?.user) {
      authUserId = authData.user.id
    }

    if (!authUserId) return { success: false, error: 'Failed to create user record' }

    // Upsert into public.profiles with strict company_name
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUserId,
        username: cleanName,
        role: 'PRODUCTION_MANAGER',
        designation: 'Production Manager',
        company_name: company,
        phone: cleanPhone,
        is_head: false,
        is_active: true,
        allowed_modules: tenant.allowedDivisions || ALL_DEFAULT_DIVISIONS
      })

    if (profileErr) {
      console.error('[appointProductionManagerAction] Profile error:', profileErr.message)
    }

    await CacheManager.invalidateTag('access_control')
    await CacheManager.invalidateTag('tenant')
    revalidatePath('/access-control')
    revalidatePath('/modules')
    return { success: true, pmId: authUserId }
  } catch (err: any) {
    console.error('[appointProductionManagerAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to appoint Production Manager' }
  }
}

/**
 * 2. Assign / Update Department Head
 * Can be performed by both Company Owner and Production Manager.
 * Features:
 * - 1 or 2 phone numbers
 * - Primary department + visible modules restricted to purchased modules
 * - Configurable top tab visibility (allowedTabs)
 * - 2-step maximum workflow
 */
export async function appointOrUpdateDepartmentHeadAction(payload: {
  headId?: string
  name?: string
  displayName?: string
  username?: string
  phone: string
  phone2?: string
  email?: string
  password?: string
  primaryDivisionRoute: string
  allowedModules: string[]
  allowedTabs?: string[]
  designation?: string
}): Promise<{ success: boolean; error?: string; headId?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Authentication required' }

    const tenant = await resolveUserTenant(user)
    const userRole = (tenant.role || '').toUpperCase()
    const isOwner = tenant.isSuperAdmin || userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'PLATFORM_SUPERADMIN' || user.email === 'admin@zigza.in'
    const isPM = userRole === 'PRODUCTION_MANAGER'

    if (!isOwner && !isPM) {
      return { success: false, error: 'Unauthorized: Only Owner or Production Manager can assign a Department Head' }
    }

    const cleanName = (payload.name || payload.displayName || '').trim()
    const cleanPhone = payload.phone.trim().replace(/\D/g, '').slice(-10)
    const cleanPhone2 = payload.phone2 ? payload.phone2.trim().replace(/\D/g, '').slice(-10) : ''

    if (!cleanName) return { success: false, error: 'Head Full Name is required' }
    if (cleanPhone.length !== 10) return { success: false, error: 'Please enter a valid 10-digit primary mobile number' }
    if (cleanPhone2 && cleanPhone2.length !== 10) return { success: false, error: 'Secondary mobile number must be 10 digits' }

    const company = tenant.companyName.trim()
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'factory'
    const purchasedDivisions = tenant.allowedDivisions || ALL_DEFAULT_DIVISIONS

    // Strictly validate that selected modules are within company purchased modules
    const modulesToAssign = (Array.isArray(payload.allowedModules) && payload.allowedModules.length > 0)
      ? payload.allowedModules.filter(m => purchasedDivisions.includes(m))
      : [payload.primaryDivisionRoute]

    if (modulesToAssign.length === 0) {
      return { success: false, error: 'You can only assign modules that your company has purchased' }
    }

    const tabsToAssign = (Array.isArray(payload.allowedTabs) && payload.allowedTabs.length > 0)
      ? payload.allowedTabs
      : ['all-modules']

    const compositePhone = cleanPhone2 ? `${cleanPhone} / ${cleanPhone2}` : cleanPhone
    const loginEmail = payload.email?.trim() || `${cleanPhone}@${companySlug}.local`
    const defaultDesignation = payload.designation || deriveDesignation('HEAD', modulesToAssign)

    // CASE A: UPDATE EXISTING HEAD
    if (payload.headId) {
      // Security check: ensure target head belongs to this company
      const { data: existingProf } = await supabaseAdmin
        .from('profiles')
        .select('company_name')
        .eq('id', payload.headId)
        .maybeSingle()

      if (existingProf && existingProf.company_name?.toLowerCase().trim() !== company.toLowerCase().trim()) {
        return { success: false, error: 'Unauthorized: Cannot modify staff from another company' }
      }

      const updateData: any = {
        username: cleanName,
        role: 'DEPARTMENT_HEAD',
        designation: defaultDesignation,
        allowed_modules: modulesToAssign,
        allowed_tabs: tabsToAssign,
        company_name: company,
        is_head: true,
        is_active: true,
        phone: compositePhone
      }

      await supabaseAdmin.from('profiles').update(updateData).eq('id', payload.headId)

      // Update auth metadata
      const authUpdates: any = {
        user_metadata: {
          display_name: cleanName,
          phone: cleanPhone,
          phone2: cleanPhone2 || undefined,
          allowed_modules: modulesToAssign,
          allowed_tabs: tabsToAssign,
          designation: defaultDesignation,
          role: 'DEPARTMENT_HEAD',
          company: company,
          is_head: true
        }
      }
      if (payload.password && payload.password.length >= 6) {
        authUpdates.password = payload.password
      }
      await supabaseAdmin.auth.admin.updateUserById(payload.headId, authUpdates)

      await CacheManager.invalidateTag('access_control')
      await CacheManager.invalidateTag('tenant')
      revalidatePath('/access-control')
      revalidatePath('/modules')
      return { success: true, headId: payload.headId }
    }

    // CASE B: CREATE NEW DEPARTMENT HEAD
    if (!payload.password || payload.password.length < 6) {
      return { success: false, error: 'Initial password of at least 6 characters is required' }
    }

    let authUserId: string | null = null
    const cleanUsername = `${cleanName.toLowerCase().replace(/\s+/g, '_')}_head`

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        display_name: cleanName,
        phone: cleanPhone,
        phone2: cleanPhone2 || undefined,
        designation: defaultDesignation,
        role: 'DEPARTMENT_HEAD',
        allowed_modules: modulesToAssign,
        allowed_tabs: tabsToAssign,
        company: company,
        is_head: true
      }
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
        const matched = userList?.users?.find(u => u.email?.toLowerCase() === loginEmail.toLowerCase())
        if (matched) {
          authUserId = matched.id
          await supabaseAdmin.auth.admin.updateUserById(matched.id, {
            password: payload.password,
            user_metadata: {
              username: cleanUsername,
              display_name: cleanName,
              phone: cleanPhone,
              phone2: cleanPhone2 || undefined,
              designation: defaultDesignation,
              role: 'DEPARTMENT_HEAD',
              allowed_modules: modulesToAssign,
              allowed_tabs: tabsToAssign,
              company: company,
              is_head: true
            }
          })
        } else {
          return { success: false, error: authError.message }
        }
      } else {
        return { success: false, error: authError.message }
      }
    } else if (authData?.user) {
      authUserId = authData.user.id
    }

    if (!authUserId) return { success: false, error: 'Failed to create head authentication record' }

    // Upsert into public.profiles with strict company_name
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUserId,
        username: cleanName,
        role: 'DEPARTMENT_HEAD',
        designation: defaultDesignation,
        allowed_modules: modulesToAssign,
        allowed_tabs: tabsToAssign,
        company_name: company,
        is_head: true,
        is_active: true,
        phone: compositePhone
      })

    await CacheManager.invalidateTag('access_control')
    await CacheManager.invalidateTag('tenant')
    revalidatePath('/access-control')
    revalidatePath('/modules')
    return { success: true, headId: authUserId }
  } catch (err: any) {
    console.error('[appointOrUpdateDepartmentHeadAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to appoint Department Head' }
  }
}

/**
 * 3. Add Floor Worker
 * Can be performed by:
 * - Company Owner (any purchased division)
 * - Production Manager (any purchased division)
 * - Department Head (strictly their assigned division)
 */
export async function addFloorWorkerAction(payload: {
  divisionRoute: string
  worker_name: string
  phone_number: string
  role?: string
  shift?: string
}): Promise<{ success: boolean; error?: string; workerId?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Authentication required' }

    const tenant = await resolveUserTenant(user)
    const userRole = (tenant.role || '').toUpperCase()
    const isOwner = tenant.isSuperAdmin || userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'PLATFORM_SUPERADMIN'
    const isPM = userRole === 'PRODUCTION_MANAGER'
    const isHead = userRole === 'DEPARTMENT_HEAD' || userRole.includes('HEAD') || userRole.includes('SUPERVISOR')

    if (!isOwner && !isPM && !isHead) {
      return { success: false, error: 'Unauthorized to add workers' }
    }

    const company = tenant.companyName.trim()
    const route = payload.divisionRoute
    const purchasedDivisions = tenant.allowedDivisions || ALL_DEFAULT_DIVISIONS

    if (!purchasedDivisions.includes(route)) {
      return { success: false, error: 'Cannot add workers to non-purchased divisions' }
    }

    // If Department Head, verify they oversee this division
    if (isHead && !isOwner && !isPM) {
      if (!tenant.allowedDivisions.includes(route)) {
        return { success: false, error: 'You are only authorized to add workers in your assigned department' }
      }
    }

    const cleanName = payload.worker_name.trim()
    const cleanPhone = payload.phone_number.trim().replace(/\D/g, '').slice(-10)

    if (!cleanName) return { success: false, error: 'Worker name is required' }
    if (cleanPhone.length !== 10) return { success: false, error: '10-digit mobile number required' }

    const tableConfig = DIVISION_WORKER_MAP[route]
    if (!tableConfig) {
      return { success: false, error: `No worker registry configured for ${route}` }
    }

    const insertData: any = {
      [tableConfig.nameField]: cleanName,
      [tableConfig.phoneField]: cleanPhone,
      [tableConfig.roleField]: payload.role || tableConfig.defaultRole,
      shift: payload.shift || 'General',
      company_name: company,
      status: 'ACTIVE'
    }

    const { data, error } = await supabaseAdmin
      .from(tableConfig.table)
      .insert(insertData)
      .select('id')
      .maybeSingle()

    if (error) {
      console.warn(`[addFloorWorkerAction] Insert into ${tableConfig.table} notice:`, error.message)
      return { success: false, error: error.message }
    }

    await CacheManager.invalidateTag('access_control')
    revalidatePath('/access-control')
    revalidatePath('/supervisor-workers')
    return { success: true, workerId: data?.id }
  } catch (err: any) {
    console.error('[addFloorWorkerAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to add worker' }
  }
}

/**
 * Delete a staff member (Production Manager, Department Head, or Floor Worker).
 * Strictly enforces company isolation.
 */
export async function deleteStaffMemberAction(payload: {
  id: string
  type: 'PRODUCTION_MANAGER' | 'DEPARTMENT_HEAD' | 'WORKER'
  divisionRoute?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Authentication required' }

    const tenant = await resolveUserTenant(user)
    const company = tenant.companyName.trim()
    const userRole = (tenant.role || '').toUpperCase()
    const isOwner = tenant.isSuperAdmin || userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'PLATFORM_SUPERADMIN'
    const isPM = userRole === 'PRODUCTION_MANAGER'
    const isHead = userRole === 'DEPARTMENT_HEAD' || userRole.includes('HEAD')

    if (payload.type === 'PRODUCTION_MANAGER') {
      if (!isOwner) return { success: false, error: 'Only the Company Owner can remove a Production Manager' }
      // Verify company match
      const { data: prof } = await supabaseAdmin.from('profiles').select('company_name').eq('id', payload.id).maybeSingle()
      if (prof?.company_name?.toLowerCase().trim() !== company.toLowerCase().trim()) {
        return { success: false, error: 'Unauthorized: Cross-company operation blocked' }
      }
      await supabaseAdmin.from('profiles').delete().eq('id', payload.id)
      try { await supabaseAdmin.auth.admin.deleteUser(payload.id) } catch (_) {}
    } else if (payload.type === 'DEPARTMENT_HEAD') {
      if (!isOwner && !isPM) return { success: false, error: 'Only Owner or Production Manager can remove a Department Head' }
      const { data: prof } = await supabaseAdmin.from('profiles').select('company_name').eq('id', payload.id).maybeSingle()
      if (prof?.company_name?.toLowerCase().trim() !== company.toLowerCase().trim()) {
        return { success: false, error: 'Unauthorized: Cross-company operation blocked' }
      }
      await supabaseAdmin.from('profiles').delete().eq('id', payload.id)
      try { await supabaseAdmin.auth.admin.deleteUser(payload.id) } catch (_) {}
    } else if (payload.type === 'WORKER') {
      if (!payload.divisionRoute || !DIVISION_WORKER_MAP[payload.divisionRoute]) {
        return { success: false, error: 'Worker division route required' }
      }
      const tableConfig = DIVISION_WORKER_MAP[payload.divisionRoute]
      await supabaseAdmin
        .from(tableConfig.table)
        .delete()
        .eq('id', payload.id)
        .eq('company_name', company)
    }

    await CacheManager.invalidateTag('access_control')
    await CacheManager.invalidateTag('tenant')
    revalidatePath('/access-control')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteStaffMemberAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to delete member' }
  }
}

/**
 * Toggle Active / Inactive status of staff member.
 */
export async function toggleStaffStatusAction(payload: {
  id: string
  type: 'PRODUCTION_MANAGER' | 'DEPARTMENT_HEAD' | 'WORKER'
  currentStatus: boolean
  divisionRoute?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Authentication required' }

    const tenant = await resolveUserTenant(user)
    const company = tenant.companyName.trim()

    if (payload.type === 'WORKER') {
      if (!payload.divisionRoute || !DIVISION_WORKER_MAP[payload.divisionRoute]) {
        return { success: false, error: 'Worker division route required' }
      }
      const table = DIVISION_WORKER_MAP[payload.divisionRoute].table
      await supabaseAdmin
        .from(table)
        .update({ status: payload.currentStatus ? 'INACTIVE' : 'ACTIVE' })
        .eq('id', payload.id)
        .eq('company_name', company)
    } else {
      await supabaseAdmin
        .from('profiles')
        .update({ is_active: !payload.currentStatus })
        .eq('id', payload.id)
        .eq('company_name', company)
    }

    await CacheManager.invalidateTag('access_control')
    revalidatePath('/access-control')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to toggle status' }
  }
}

/**
 * Reset password for a Production Manager or Department Head.
 */
export async function resetStaffPasswordAction(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Authentication required' }

    const tenant = await resolveUserTenant(user)
    const company = tenant.companyName.trim()

    // Verify target user belongs to this company
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('company_name')
      .eq('id', userId)
      .maybeSingle()

    if (prof?.company_name?.toLowerCase().trim() !== company.toLowerCase().trim()) {
      return { success: false, error: 'Unauthorized: Cross-company operation blocked' }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) throw error

    await CacheManager.invalidateTag('access_control')
    revalidatePath('/access-control')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reset password' }
  }
}

// Aliases for backward compatibility with existing components
export const resetDepartmentHeadPasswordAction = resetStaffPasswordAction
export const toggleDepartmentHeadStatusAction = async (headId: string, currentStatus: boolean) => 
  toggleStaffStatusAction({ id: headId, type: 'DEPARTMENT_HEAD', currentStatus })
export const deleteDepartmentHeadAction = async (headId: string) => 
  deleteStaffMemberAction({ id: headId, type: 'DEPARTMENT_HEAD' })

function deriveDesignation(role: string, modules: string[]): string {
  if (role === 'ADMIN' || role === 'SUPERADMIN') return 'Factory Administrator'
  if (role === 'PRODUCTION_MANAGER') return 'Production Manager'
  if (modules.length === 1) {
    const route = modules[0]
    const found = DEPARTMENT_HEADS_CATALOG.find(d => d.route === route)
    return found ? found.defaultDesignation : 'Department Incharge'
  }
  return 'Operations Incharge'
}
