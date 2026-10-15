'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { resolveUserTenant } from '@/lib/tenant-context'
import { CacheManager } from '@/lib/cache/cache-manager'
import { revalidatePath } from 'next/cache'

interface PurgeActionResponse {
  success: boolean
  message?: string
  error?: string
  deletedCount?: number
}

/**
 * Purges all operational data (challans, allotments, lots, tasks, QC logs)
 * strictly scoped to the authenticated user's tenant company.
 * ZERO data leak — NEVER touches other companies' records.
 */
export async function purgeDivisionOperationalDataAction(payload: {
  divisionSlug: string
  divisionCode?: string
  confirmationText: string
}): Promise<PurgeActionResponse> {
  try {
    const { divisionSlug, divisionCode, confirmationText } = payload

    if (!confirmationText || confirmationText.trim().toUpperCase() !== 'DELETE') {
      return { success: false, error: 'Confirmation mismatch. Please type "DELETE" to confirm.' }
    }

    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized: Session expired. Please log in again.' }
    }

    // 2. Resolve verified tenant context
    const tenant = await resolveUserTenant(user)
    if (!tenant.companyName || !tenant.companyName.trim()) {
      return { success: false, error: 'Security Constraint: No verified company linked to your account.' }
    }

    const compName = tenant.companyName.trim()
    const isNubira = compName.toLowerCase().includes('nubira')
    const normSlug = divisionSlug.replace(/\/dashboard$/, '').replace(/\/profile$/, '')

    // 3. Authorization check
    const userRole = (tenant.role || '').toUpperCase()
    const isAuthorized =
      tenant.isSuperAdmin ||
      tenant.isPlatformAdmin ||
      ['SUPERADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'FACTORY_OWNER', 'DIRECTOR'].includes(userRole) ||
      (tenant.allowedDivisions || []).includes(normSlug)

    if (!isAuthorized) {
      return { success: false, error: 'Forbidden: You do not have administrative clearance to purge division data.' }
    }

    let recordsPurged = 0

    // 4. Scoped deletion based on Division
    if (normSlug === '/stitching-sewing' || divisionCode === '06') {
      // A. Tenant Challans
      let challanQuery = supabaseAdmin.from('challans').select('id')
      if (isNubira) {
        challanQuery = challanQuery.or('brand.ilike.%nubira%,company_name.ilike.%nubira%,brand.is.null')
      } else {
        challanQuery = challanQuery.or(`brand.ilike.%${compName}%,company_name.ilike.%${compName}%`)
      }
      const { data: tenantChallans } = await challanQuery
      const challanIds = (tenantChallans || []).map((c: any) => c.id)

      // B. Tenant Company Profiles (Linemen / Workers)
      let profQuery = supabaseAdmin.from('profiles').select('id')
      if (isNubira) {
        profQuery = profQuery.or('company_name.ilike.%nubira%,company_name.is.null')
      } else {
        profQuery = profQuery.ilike('company_name', `%${compName}%`)
      }
      const { data: compProfiles } = await profQuery
      const profileIds = (compProfiles || []).map((p: any) => p.id)

      // C. Allotments lookup
      let allotmentIds: string[] = []
      if (challanIds.length > 0) {
        const { data: a1 } = await supabaseAdmin.from('allotments').select('id').in('challan_id', challanIds)
        if (a1) allotmentIds.push(...a1.map((a: any) => a.id))
      }
      if (profileIds.length > 0) {
        const { data: a2 } = await supabaseAdmin.from('allotments').select('id').in('lineman_id', profileIds)
        if (a2) allotmentIds.push(...a2.map((a: any) => a.id))
      }
      allotmentIds = Array.from(new Set(allotmentIds))

      // D. Cascade delete allotment dependencies
      if (allotmentIds.length > 0) {
        await Promise.allSettled([
          supabaseAdmin.from('allotment_variants').delete().in('allotment_id', allotmentIds),
          supabaseAdmin.from('allotment_materials').delete().in('allotment_id', allotmentIds),
          supabaseAdmin.from('worker_assignments').delete().in('allotment_id', allotmentIds),
          supabaseAdmin.from('daily_product').delete().in('allotment_id', allotmentIds),
          supabaseAdmin.from('qc_logs').delete().in('allotment_id', allotmentIds),
          supabaseAdmin.from('store_transactions').delete().in('allotment_id', allotmentIds),
        ])
        const { count } = await supabaseAdmin.from('allotments').delete({ count: 'exact' }).in('id', allotmentIds)
        recordsPurged += (count || allotmentIds.length)
      }

      // E. Delete Challans & Delivery Challans
      if (challanIds.length > 0) {
        await supabaseAdmin.from('delivery_challans').delete().in('challan_id', challanIds)
        const { count } = await supabaseAdmin.from('challans').delete({ count: 'exact' }).in('id', challanIds)
        recordsPurged += (count || challanIds.length)
      }

      // F. Delete Stitching Tasks & Submissions
      let taskAllocQuery = supabaseAdmin.from('stitching_task_allocations').delete({ count: 'exact' })
      let subQuery = supabaseAdmin.from('stitching_submissions').delete({ count: 'exact' })
      if (isNubira) {
        const [r1, r2] = await Promise.allSettled([
          taskAllocQuery.or('company_name.ilike.%nubira%,company_name.is.null'),
          subQuery.or('company_name.ilike.%nubira%,company_name.is.null'),
        ])
        if (r1.status === 'fulfilled' && (r1.value as any).count) recordsPurged += (r1.value as any).count
        if (r2.status === 'fulfilled' && (r2.value as any).count) recordsPurged += (r2.value as any).count
      } else {
        const [r1, r2] = await Promise.allSettled([
          taskAllocQuery.ilike('company_name', `%${compName}%`),
          subQuery.ilike('company_name', `%${compName}%`),
        ])
        if (r1.status === 'fulfilled' && (r1.value as any).count) recordsPurged += (r1.value as any).count
        if (r2.status === 'fulfilled' && (r2.value as any).count) recordsPurged += (r2.value as any).count
      }
    } else if (normSlug === '/cutting' || divisionCode === '03') {
      const q = isNubira ? 'company_name.ilike.%nubira%,company_name.is.null' : `company_name.ilike.%${compName}%`
      const [r1, r2] = await Promise.allSettled([
        supabaseAdmin.from('cutting_task_allocations').delete({ count: 'exact' }).or(q),
        supabaseAdmin.from('cutting_orders').delete({ count: 'exact' }).or(q),
      ])
      if (r1.status === 'fulfilled' && (r1.value as any).count) recordsPurged += (r1.value as any).count
      if (r2.status === 'fulfilled' && (r2.value as any).count) recordsPurged += (r2.value as any).count
    } else if (normSlug === '/embroidery' || divisionCode === '05') {
      const q = isNubira ? 'company_name.ilike.%nubira%,company_name.is.null' : `company_name.ilike.%${compName}%`
      const [r1, r2] = await Promise.allSettled([
        supabaseAdmin.from('embroidery_task_allocations').delete({ count: 'exact' }).or(q),
        supabaseAdmin.from('embroidery_orders').delete({ count: 'exact' }).or(q),
      ])
      if (r1.status === 'fulfilled' && (r1.value as any).count) recordsPurged += (r1.value as any).count
      if (r2.status === 'fulfilled' && (r2.value as any).count) recordsPurged += (r2.value as any).count
    } else if (normSlug === '/washing' || divisionCode === '07') {
      const q = isNubira ? 'company_name.ilike.%nubira%,company_name.is.null' : `company_name.ilike.%${compName}%`
      const [r1, r2] = await Promise.allSettled([
        supabaseAdmin.from('washing_task_allocations').delete({ count: 'exact' }).or(q),
        supabaseAdmin.from('washing_batches').delete({ count: 'exact' }).or(q),
      ])
      if (r1.status === 'fulfilled' && (r1.value as any).count) recordsPurged += (r1.value as any).count
      if (r2.status === 'fulfilled' && (r2.value as any).count) recordsPurged += (r2.value as any).count
    } else if (normSlug === '/iron' || divisionCode === '08') {
      const q = isNubira ? 'company_name.ilike.%nubira%,company_name.is.null' : `company_name.ilike.%${compName}%`
      const [r1, r2] = await Promise.allSettled([
        supabaseAdmin.from('iron_task_allocations').delete({ count: 'exact' }).or(q),
        supabaseAdmin.from('ironing_orders').delete({ count: 'exact' }).or(q),
      ])
      if (r1.status === 'fulfilled' && (r1.value as any).count) recordsPurged += (r1.value as any).count
      if (r2.status === 'fulfilled' && (r2.value as any).count) recordsPurged += (r2.value as any).count
    } else if (normSlug === '/store' || divisionCode === '11') {
      const q = isNubira ? 'company_name.ilike.%nubira%,company_name.is.null' : `company_name.ilike.%${compName}%`
      const [r1, r2] = await Promise.allSettled([
        supabaseAdmin.from('store_transactions').delete({ count: 'exact' }).or(q),
        supabaseAdmin.from('material_issues').delete({ count: 'exact' }).or(q),
      ])
      if (r1.status === 'fulfilled' && (r1.value as any).count) recordsPurged += (r1.value as any).count
      if (r2.status === 'fulfilled' && (r2.value as any).count) recordsPurged += (r2.value as any).count
    }

    // 5. Invalidate caches and refresh pages
    const normComp = compName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    await Promise.allSettled([
      CacheManager.invalidateTag(`company:${normComp}:stitching`),
      CacheManager.invalidateTag(`company:${normComp}`),
      CacheManager.invalidateTag('allotments'),
      CacheManager.invalidateTag('challans'),
    ])

    revalidatePath(normSlug)
    revalidatePath(`${normSlug}/profile`)
    revalidatePath(`${normSlug}/dashboard`)
    revalidatePath('/dashboard')

    return {
      success: true,
      deletedCount: recordsPurged,
      message: `Successfully purged operational records for ${compName} in ${normSlug}.`,
    }
  } catch (err: any) {
    console.error('[purgeDivisionOperationalDataAction] Error:', err)
    return { success: false, error: err.message || 'Failed to purge division operational data.' }
  }
}

/**
 * Resets / removes the registered workforce directory for a division
 * strictly within the authenticated company.
 * Preserves the calling admin user.
 */
export async function purgeDivisionStaffAction(payload: {
  divisionSlug: string
  divisionCode?: string
  confirmationText: string
}): Promise<PurgeActionResponse> {
  try {
    const { divisionSlug, divisionCode, confirmationText } = payload

    if (!confirmationText || confirmationText.trim().toUpperCase() !== 'DELETE') {
      return { success: false, error: 'Confirmation mismatch. Please type "DELETE" to confirm.' }
    }

    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized: Session expired.' }
    }

    // 2. Resolve tenant
    const tenant = await resolveUserTenant(user)
    if (!tenant.companyName || !tenant.companyName.trim()) {
      return { success: false, error: 'Security Constraint: Company context missing.' }
    }

    const compName = tenant.companyName.trim()
    const isNubira = compName.toLowerCase().includes('nubira')
    const normSlug = divisionSlug.replace(/\/dashboard$/, '').replace(/\/profile$/, '')

    // 3. Authorization check
    const userRole = (tenant.role || '').toUpperCase()
    const isAuthorized =
      tenant.isSuperAdmin ||
      tenant.isPlatformAdmin ||
      ['SUPERADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'FACTORY_OWNER', 'DIRECTOR'].includes(userRole)

    if (!isAuthorized) {
      return { success: false, error: 'Forbidden: Insufficient privileges to reset staff directory.' }
    }

    // 4. Fetch staff belonging to this company
    let staffQuery = supabaseAdmin
      .from('profiles')
      .select('id, username, allowed_modules, role, company_name')

    if (isNubira) {
      staffQuery = staffQuery.or('company_name.ilike.%nubira%,company_name.is.null')
    } else {
      staffQuery = staffQuery.ilike('company_name', `%${compName}%`)
    }

    const { data: allStaff } = await staffQuery
    let staffRemoved = 0

    if (allStaff && allStaff.length > 0) {
      const candidates = allStaff.filter((p: any) => {
        // NEVER delete caller or platform superadmins
        if (p.id === user.id) return false
        if (p.role === 'PLATFORM_SUPERADMIN' || p.role === 'SUPERADMIN') return false

        const mods: string[] = Array.isArray(p.allowed_modules) ? p.allowed_modules : []
        return mods.includes(normSlug) || ['LINEMAN', 'TAILOR', 'QC', 'MENDING'].includes(p.role)
      })

      for (const p of candidates) {
        const currentMods = Array.isArray(p.allowed_modules) ? p.allowed_modules : []
        const remainingMods = currentMods.filter((m: string) => m !== normSlug)

        if (remainingMods.length > 0) {
          await supabaseAdmin.from('profiles').update({ allowed_modules: remainingMods }).eq('id', p.id)
        } else {
          await supabaseAdmin.from('profiles').delete().eq('id', p.id)
        }
        staffRemoved++
      }
    }

    // 5. Clean up division workers table if applicable
    if (normSlug === '/stitching-sewing' || divisionCode === '06') {
      const q = isNubira ? 'company_name.ilike.%nubira%,company_name.is.null' : `company_name.ilike.%${compName}%`
      await supabaseAdmin.from('stitching_workers').delete().or(q)
    } else if (normSlug === '/cutting' || divisionCode === '03') {
      const q = isNubira ? 'company_name.ilike.%nubira%,company_name.is.null' : `company_name.ilike.%${compName}%`
      await supabaseAdmin.from('cutting_workers').delete().or(q)
    }

    revalidatePath(normSlug)
    revalidatePath(`${normSlug}/profile`)

    return {
      success: true,
      deletedCount: staffRemoved,
      message: `Successfully removed ${staffRemoved} personnel from ${normSlug} directory.`,
    }
  } catch (err: any) {
    console.error('[purgeDivisionStaffAction] Error:', err)
    return { success: false, error: err.message || 'Failed to reset division workforce directory.' }
  }
}

/**
 * Deletes or removes a single staff member from a division.
 * Strictly verifies company ownership.
 */
export async function deleteSingleDivisionStaffAction(payload: {
  staffId: string
  divisionSlug: string
}): Promise<PurgeActionResponse> {
  try {
    const { staffId, divisionSlug } = payload

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized: Please log in.' }
    }

    const tenant = await resolveUserTenant(user)
    if (!tenant.companyName) {
      return { success: false, error: 'Company context missing.' }
    }

    if (staffId === user.id) {
      return { success: false, error: 'Security Protection: You cannot delete your own active administrator account.' }
    }

    const compName = tenant.companyName.trim()
    const isNubira = compName.toLowerCase().includes('nubira')

    // Verify target profile
    const { data: target } = await supabaseAdmin
      .from('profiles')
      .select('id, company_name, allowed_modules, role')
      .eq('id', staffId)
      .single()

    if (!target) {
      return { success: false, error: 'Personnel record not found.' }
    }

    const targetComp = (target.company_name || '').toLowerCase()
    if (!isNubira && !targetComp.includes(compName.toLowerCase())) {
      return { success: false, error: 'Security Violation: Cannot delete personnel from a different company.' }
    }

    const normSlug = divisionSlug.replace(/\/dashboard$/, '').replace(/\/profile$/, '')
    const currentMods = Array.isArray(target.allowed_modules) ? target.allowed_modules : []
    const remainingMods = currentMods.filter((m: string) => m !== normSlug)

    if (remainingMods.length > 0) {
      await supabaseAdmin.from('profiles').update({ allowed_modules: remainingMods }).eq('id', target.id)
    } else {
      await supabaseAdmin.from('profiles').delete().eq('id', target.id)
    }

    if (normSlug === '/stitching-sewing') {
      await supabaseAdmin.from('stitching_workers').delete().eq('worker_user_id', target.id)
    }

    revalidatePath(normSlug)
    revalidatePath(`${normSlug}/profile`)

    return { success: true, message: 'Personnel successfully removed from this division.' }
  } catch (err: any) {
    console.error('[deleteSingleDivisionStaffAction] Error:', err)
    return { success: false, error: err.message || 'Failed to remove staff member.' }
  }
}
