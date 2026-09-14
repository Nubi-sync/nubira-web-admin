'use server'

// ============================================================================
// Zigza MES Enterprise - Department Heads & Module Incharge RBAC Actions
// Strictly manages Executive Department Heads across the 12 manufacturing divisions
// ============================================================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { resolveUserTenant, ALL_DEFAULT_DIVISIONS } from '@/lib/tenant-context'
import { DEPARTMENT_HEADS_CATALOG, ALL_DIVISION_ROUTES } from '@/lib/access-control'

export interface DepartmentHeadItem {
  id: string
  displayName: string
  username: string
  email: string
  role: string
  designation: string
  allowedModules: string[]
  isActive: boolean
  phone?: string
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

/**
 * Centrally fetch the 12 manufacturing divisions and their appointed Department Heads
 * for the authenticated Company Tenant.
 */
export async function fetchCompanyDepartmentHeadsAction(): Promise<{
  success: boolean
  divisions: DivisionWithHeadStatus[]
  allowedDivisions: string[]
  unassignedExecutives: DepartmentHeadItem[]
  tenantName: string
  isSuperAdmin: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        divisions: [],
        allowedDivisions: [],
        unassignedExecutives: [],
        tenantName: '',
        isSuperAdmin: false,
        error: 'Authentication required'
      }
    }

    const tenant = await resolveUserTenant(user)
    const company = tenant.companyName || 'Apparel Factory'

    // Fetch all profiles belonging to this tenant/company or marked as heads
    // Gracefully handle schema differences (allowed_modules, designation, is_head)
    let profilesList: any[] = []
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        profilesList = data
      }
    } catch (dbErr: any) {
      console.warn('[fetchCompanyDepartmentHeadsAction] DB fetch notice:', dbErr?.message)
    }

    // Filter profiles belonging to this company tenant
    // STRICT RULE: Only include profiles explicitly marked as Department Heads (is_head: true)
    // Regular factory workers, linemen, tailors, helpers must NEVER appear on the Executive RBAC page.
    const companyProfiles = profilesList.filter(p => {
      if (p.id === user.id) return false // Exclude the company admin themselves
      if (p.is_head !== true) return false // Exclude all floor staff / workers

      if (p.company_name && p.company_name.toLowerCase() === company.toLowerCase()) return true
      if (tenant.isProvisionedTenant && p.username && p.username.toLowerCase().includes(tenant.companyName.toLowerCase())) return true
      return !p.company_name && p.role !== 'PLATFORM_SUPERADMIN'
    })

    // Map profiles into clean DepartmentHeadItem objects
    const mappedHeads: DepartmentHeadItem[] = companyProfiles.map(p => {
      const rawModules = Array.isArray(p.allowed_modules) ? p.allowed_modules : []
      // If allowed_modules is empty, infer from role
      const inferredModules = rawModules.length > 0 
        ? rawModules 
        : (p.role === 'ADMIN' ? [...ALL_DIVISION_ROUTES] : [`/${(p.role || '').toLowerCase().replace(/_/g, '-')}`])

      return {
        id: p.id,
        displayName: p.username || 'Department Lead',
        username: p.username || 'staff_user',
        email: p.email || `${(p.username || 'head').toLowerCase().replace(/\s+/g, '_')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'factory'}.local`,
        role: p.role || 'OPERATIONS_HEAD',
        designation: p.designation || deriveDesignation(p.role, inferredModules),
        allowedModules: inferredModules,
        isActive: p.is_active !== false,
        phone: p.phone || undefined,
        createdAt: p.created_at
      }
    })

    // Respect company tenant's purchased / allowed divisions
    const isPlatformSuperAdmin = tenant.isPlatformAdmin || user.email === 'admin@zigza.in'
    const configuredDivisions = (!isPlatformSuperAdmin && Array.isArray(tenant.allowedDivisions) && tenant.allowedDivisions.length > 0 && !tenant.allowedDivisions.includes('/platform-admin'))
      ? tenant.allowedDivisions
      : ALL_DEFAULT_DIVISIONS

    // Strictly filter DEPARTMENT_HEADS_CATALOG to ONLY the tenant's subscribed modules
    const companyCatalog = DEPARTMENT_HEADS_CATALOG.filter(div =>
      configuredDivisions.includes(div.route)
    )

    // Map each of the allowed divisions to its appointed head
    const divisionsResult: DivisionWithHeadStatus[] = companyCatalog.map(div => {
      // Find head whose allowedModules includes this division's route
      const headsForDivision = mappedHeads.filter(h => h.allowedModules.includes(div.route))

      return {
        ...div,
        appointedHead: headsForDivision[0] || null,
        secondaryHeads: headsForDivision.slice(1)
      }
    })

    // Multi-module or executive heads overseeing multiple divisions
    const unassignedExecutives = mappedHeads.filter(h => h.allowedModules.length > 1)

    return {
      success: true,
      divisions: divisionsResult,
      allowedDivisions: configuredDivisions,
      unassignedExecutives,
      tenantName: company,
      isSuperAdmin: tenant.isSuperAdmin
    }
  } catch (err: any) {
    console.error('[fetchCompanyDepartmentHeadsAction] Error:', err)
    return {
      success: false,
      divisions: [],
      allowedDivisions: [],
      unassignedExecutives: [],
      tenantName: '',
      isSuperAdmin: false,
      error: err?.message || 'Failed to load department heads'
    }
  }
}

/**
 * Appoint or update a Department Head for a division.
 */
export async function appointOrUpdateDepartmentHeadAction(payload: {
  headId?: string
  primaryDivisionRoute: string
  displayName: string
  username: string
  password?: string
  designation?: string
  allowedModules: string[]
  phone?: string
}): Promise<{ success: boolean; error?: string; headId?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Authentication required' }

    const tenant = await resolveUserTenant(user)
    if (!tenant.isSuperAdmin && tenant.role !== 'ADMIN' && tenant.role !== 'SUPERADMIN' && tenant.role !== 'PLATFORM_SUPERADMIN') {
      return { success: false, error: 'Unauthorized: Only Factory Admin can appoint department heads' }
    }

    const cleanName = payload.displayName.trim()
    const cleanUsername = payload.username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')
    const modulesToAssign = Array.isArray(payload.allowedModules) && payload.allowedModules.length > 0
      ? payload.allowedModules
      : [payload.primaryDivisionRoute]

    if (!cleanName || !cleanUsername) {
      return { success: false, error: 'Head Full Name and Login Username are required' }
    }

    const companySlug = tenant.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'factory'
    const authEmail = `${cleanUsername}@${companySlug}.local`
    const defaultDesignation = payload.designation || deriveDesignation('HEAD', modulesToAssign)

    // CASE A: UPDATE EXISTING DEPARTMENT HEAD
    if (payload.headId) {
      // 1. Update public.profiles
      const updateData: any = {
        username: cleanName,
        designation: defaultDesignation,
        allowed_modules: modulesToAssign,
        company_name: tenant.companyName,
        is_head: true,
        is_active: true
      }
      if (payload.phone) updateData.phone = payload.phone.trim()

      const { error: profErr } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', payload.headId)

      if (profErr) {
        console.warn('[appointOrUpdateDepartmentHeadAction] Profile update warning:', profErr.message)
      }

      // 2. If password provided, update auth
      if (payload.password && payload.password.length >= 6) {
        await supabaseAdmin.auth.admin.updateUserById(payload.headId, {
          password: payload.password,
          user_metadata: {
            username: cleanUsername,
            display_name: cleanName,
            designation: defaultDesignation,
            allowed_modules: modulesToAssign,
            company: tenant.companyName
          }
        })
      } else {
        await supabaseAdmin.auth.admin.updateUserById(payload.headId, {
          user_metadata: {
            username: cleanUsername,
            display_name: cleanName,
            designation: defaultDesignation,
            allowed_modules: modulesToAssign,
            company: tenant.companyName
          }
        })
      }

      revalidatePath('/modules/access-control')
      revalidatePath('/modules')
      return { success: true, headId: payload.headId }
    }

    // CASE B: CREATE NEW DEPARTMENT HEAD
    if (!payload.password || payload.password.length < 6) {
      return { success: false, error: 'Initial password of at least 6 characters is required' }
    }

    // Check duplicate username in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .ilike('username', cleanName)
      .maybeSingle()

    if (existingProfile) {
      return { success: false, error: `A staff account with name "${cleanName}" already exists. Please choose a distinct name.` }
    }

    // Create in Supabase Auth
    let authUserId: string | null = null
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        display_name: cleanName,
        designation: defaultDesignation,
        role: 'DEPARTMENT_HEAD',
        allowed_modules: modulesToAssign,
        company: tenant.companyName,
        is_head: true
      }
    })

    if (authError) {
      // If user already exists in auth, link it
      if (authError.message.toLowerCase().includes('already')) {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
        const matched = userList?.users?.find(u => u.email?.toLowerCase() === authEmail.toLowerCase())
        if (matched) {
          authUserId = matched.id
          await supabaseAdmin.auth.admin.updateUserById(matched.id, {
            password: payload.password,
            user_metadata: {
              username: cleanUsername,
              display_name: cleanName,
              designation: defaultDesignation,
              role: 'DEPARTMENT_HEAD',
              allowed_modules: modulesToAssign,
              company: tenant.companyName,
              is_head: true
            }
          })
        } else {
          return { success: false, error: `Auth registration failed: ${authError.message}` }
        }
      } else {
        return { success: false, error: authError.message }
      }
    } else if (authData?.user) {
      authUserId = authData.user.id
    }

    if (!authUserId) {
      return { success: false, error: 'Failed to create Department Head authentication record' }
    }

    // Upsert into public.profiles
    const profileRow = {
      id: authUserId,
      username: cleanName,
      role: 'DEPARTMENT_HEAD',
      designation: defaultDesignation,
      allowed_modules: modulesToAssign,
      company_name: tenant.companyName,
      is_head: true,
      is_active: true,
      phone: payload.phone?.trim() || null
    }

    const { error: insertErr } = await supabaseAdmin
      .from('profiles')
      .upsert(profileRow)

    if (insertErr) {
      console.warn('[appointOrUpdateDepartmentHeadAction] Profiles insert warning:', insertErr.message)
    }

    revalidatePath('/modules/access-control')
    revalidatePath('/modules')
    return { success: true, headId: authUserId }
  } catch (err: any) {
    console.error('[appointOrUpdateDepartmentHeadAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to appoint Department Head' }
  }
}

/**
 * Reset password for a Department Head.
 */
export async function resetDepartmentHeadPasswordAction(
  headId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(headId, {
      password: newPassword
    })

    if (error) throw error

    revalidatePath('/modules/access-control')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reset password' }
  }
}

/**
 * Toggle Active / Suspended status of a Department Head.
 */
export async function toggleDepartmentHeadStatusAction(
  headId: string,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', headId)

    if (error) throw error

    revalidatePath('/modules/access-control')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to toggle status' }
  }
}

/**
 * Vacate a Department Head position (remove a division from their authority or deactivate).
 */
export async function vacateDepartmentHeadAction(
  headId: string,
  divisionRoute: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('allowed_modules')
      .eq('id', headId)
      .single()

    const currentModules: string[] = Array.isArray(profile?.allowed_modules) ? profile.allowed_modules : []
    const updatedModules = currentModules.filter(r => r !== divisionRoute)

    if (updatedModules.length === 0) {
      // If no other modules left, mark head inactive
      await supabaseAdmin
        .from('profiles')
        .update({ allowed_modules: [], is_active: false })
        .eq('id', headId)
    } else {
      await supabaseAdmin
        .from('profiles')
        .update({ allowed_modules: updatedModules })
        .eq('id', headId)
    }

    revalidatePath('/modules/access-control')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to vacate division head' }
  }
}

/**
 * Permanently remove a Department Head account.
 */
export async function deleteDepartmentHeadAction(headId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await supabaseAdmin.from('profiles').delete().eq('id', headId)
    try {
      await supabaseAdmin.auth.admin.deleteUser(headId)
    } catch (_) {}

    revalidatePath('/modules/access-control')
    revalidatePath('/modules')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to remove Department Head' }
  }
}

/**
 * Helper to derive appropriate professional title based on role or routes.
 */
function deriveDesignation(role: string, modules: string[]): string {
  if (modules.includes('/cutting')) return 'Cutting Master / CAD Head'
  if (modules.includes('/store')) return 'Central Store & Godown Manager'
  if (modules.includes('/stitching-sewing')) return 'Production Manager / Floor Head'
  if (modules.includes('/ready-goods')) return 'Quality Assurance (QA) Head'
  if (modules.includes('/merchandising')) return 'Senior Merchandiser / Sourcing Lead'
  if (modules.includes('/design')) return 'Design Studio Head'
  if (modules.includes('/washing')) return 'Washing Master'
  if (modules.includes('/iron')) return 'Finishing & Pressing Incharge'
  if (modules.includes('/alter')) return 'Alteration Clinic Master'
  if (modules.includes('/printing')) return 'Printing Studio Head'
  if (modules.includes('/embroidery')) return 'Embroidery Head'
  if (modules.includes('/dispatch')) return 'Dispatch & Logistics Manager'
  return 'Department Incharge'
}
