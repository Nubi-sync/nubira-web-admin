'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { CacheManager } from '@/lib/cache/cache-manager'
import {
  WashBatch,
  WashRecipe,
  WasherMachine,
  WaterAuditLog,
  ShrinkageQcRecord,
  WashBatchStatus,
  QcVerdict
} from './types/washing'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// -----------------------------------------------------------------------------
// 1. FETCH WASHING DASHBOARD DATA
// -----------------------------------------------------------------------------

export async function fetchWashingDashboardDataAction(companyName?: string): Promise<{
  batches: WashBatch[]
  recipes: WashRecipe[]
  shrinkageQc: ShrinkageQcRecord[]
}> {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:washing:dashboard`

  return CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      try {
        const isNonNubira = companyName && companyName.toLowerCase() !== 'nubira creation'
        const targetComp = (companyName || '').toUpperCase()

        const [batchesRes, recipesRes, shrinkageRes] = await Promise.all([
          supabaseAdmin
            .from('washing_batches')
            .select('*, order:merchandising_orders(po_number, style_name, brands:buyer_id(brand_name)), recipe:washing_recipes(recipe_code, wash_type)')
            .order('started_at', { ascending: false })
            .limit(50),
          supabaseAdmin.from('washing_recipes').select('*').order('recipe_code', { ascending: true }),
          supabaseAdmin
            .from('washing_shrinkage_alerts')
            .select('*, batch:washing_batches(batch_number, order:merchandising_orders(brands:buyer_id(brand_name)))')
            .order('created_at', { ascending: false })
            .limit(50)
        ])

        const rawBatches = batchesRes.data || []
        const rawRecipes = recipesRes.data || []
        const rawShrinkage = shrinkageRes.data || []

        const batches: WashBatch[] = rawBatches.map((b: any) => ({
          id: b.id,
          batchNumber: b.batch_number || `WB-${b.id?.slice(0, 5)}`,
          challanId: b.order?.po_number || 'CH-PENDING',
          articleName: b.order?.style_name || 'Standard Garment',
          color: 'Standard Color',
          totalPieces: b.total_garments || 0,
          washerMachineId: b.machine_id || 'Washer 01',
          operatorName: 'Floor Operator',
          recipeName: b.recipe?.wash_type || 'Bio-Enzyme Wash 55°C',
          stage: b.status === 'COMPLETED' ? 'CYCLE_COMPLETED' : 'WASH_CYCLE',
          cycleTimeMinutes: 45,
          waterLitersConsumed: 450,
          temperatureC: 55,
          phLevel: 5.5,
          status: (b.status === 'IN_PROGRESS' ? 'RUNNING' : b.status || 'QUEUED') as WashBatchStatus,
          startTime: b.started_at || new Date().toISOString(),
          endTime: b.completed_at || undefined,
          dryerMachineId: 'Dryer 01',
          dryerTemperatureC: 75,
          dryerMinutes: 30,
          hydroExtractorMinutes: 10
        }))

        const recipes: WashRecipe[] = rawRecipes.map((r: any) => ({
          id: r.id,
          recipeCode: r.recipe_code,
          washType: r.wash_type || 'Bio-Enzyme Wash',
          enzymeGpl: 1.5,
          detergentGpl: 1.0,
          softenerGpl: 2.0,
          temperatureC: r.wash_temperature_c || 55,
          cycleMinutes: r.cycle_time_minutes || 45,
          phTarget: String(r.ph_target || '5.5'),
          liquorRatio: r.liquor_ratio || '1:10',
          targetHandFeel: 'Peach Finish / Ultra-Soft',
          approvedBy: 'Lab Chemist',
          status: 'ACTIVE'
        }))

        const shrinkageQc: ShrinkageQcRecord[] = rawShrinkage.map((s: any) => {
          const lenShrink = Number(s.length_shrinkage_percent) || 0
          const widShrink = Number(s.width_shrinkage_percent) || 0
          const isFail = !s.is_within_spec || lenShrink > 2.5 || widShrink > 2.5
          return {
            id: s.id,
            qcCode: `SQC-${s.id?.slice(0, 5)}`,
            batchId: s.batch_id,
            batchNumber: s.batch?.batch_number || 'WB-BATCH',
            articleName: 'French Terry Hoodie',
            samplePiecesTested: 10,
            preWashLengthCm: Number(s.pre_wash_length_cm) || 70,
            postWashLengthCm: Number(s.post_wash_length_cm) || 69,
            avgLengthShrinkPct: lenShrink,
            preWashWidthCm: Number(s.pre_wash_width_cm) || 55,
            postWashWidthCm: Number(s.post_wash_width_cm) || 54.5,
            avgWidthShrinkPct: widShrink,
            colorfastnessRating: 4.5,
            qcStatus: (isFail ? 'CRITICAL_FAIL' : 'PASS') as QcVerdict,
            cuttingAlertSent: isFail,
            auditorName: 'QC Inspector',
            auditDate: s.created_at || new Date().toISOString()
          }
        })

        return { batches, recipes, shrinkageQc }
      } catch (error) {
        console.error('fetchWashingDashboardDataAction error:', error)
        return { batches: [], recipes: [], shrinkageQc: [] }
      }
    },
    60,
    [`company:${normComp}:washing`, 'washing_dashboard']
  )
}

// -----------------------------------------------------------------------------
// 2. MUTATION ACTIONS
// -----------------------------------------------------------------------------

export async function createWashingBatchAction(payload: {
  batch_number: string
  order_id?: string
  recipe_id?: string
  machine_id: string
  operator_id?: string
  total_garments: number
  dry_input_weight_kg: number
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('washing_batches')
      .insert({
        batch_number: payload.batch_number,
        order_id: payload.order_id || null,
        recipe_id: payload.recipe_id || null,
        machine_id: payload.machine_id,
        operator_id: payload.operator_id || null,
        total_garments: payload.total_garments,
        dry_input_weight_kg: payload.dry_input_weight_kg,
        status: 'WASHING'
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/washing')
    return { success: true, batchId: data.id }
  } catch (error: any) {
    console.error('createWashingBatchAction error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateWashingBatchStatusAction(
  batchId: string,
  status: WashBatchStatus,
  additionalData?: Partial<WashBatch>
) {
  try {
    const dbStatusMap: Record<string, string> = {
      WASHING: 'WASHING',
      HYDRO: 'HYDRO_EXTRACTION',
      DRYING: 'TUMBLE_DRYING',
      PASSED: 'COMPLETED',
      FAILED: 'QC_AUDIT'
    }

    const { error } = await supabaseAdmin
      .from('washing_batches')
      .update({
        status: dbStatusMap[status] || status,
        completed_at: status === 'PASSED' ? new Date().toISOString() : null
      })
      .eq('id', batchId)

    if (error) throw error

    revalidatePath('/washing')
    return { success: true }
  } catch (error: any) {
    console.error('updateWashingBatchStatusAction error:', error)
    return { success: false, error: error.message }
  }
}

export async function recordShrinkageAuditAction(payload: {
  batch_id: string
  specimen_size: string
  pre_wash_length_cm: number
  post_wash_length_cm: number
  pre_wash_width_cm: number
  post_wash_width_cm: number
  spirality_angle_deg?: number
  is_within_spec: boolean
  inspector_id?: string
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('washing_shrinkage_alerts')
      .insert({
        batch_id: payload.batch_id,
        specimen_size: payload.specimen_size,
        pre_wash_length_cm: payload.pre_wash_length_cm,
        post_wash_length_cm: payload.post_wash_length_cm,
        pre_wash_width_cm: payload.pre_wash_width_cm,
        post_wash_width_cm: payload.post_wash_width_cm,
        spirality_angle_deg: payload.spirality_angle_deg || 0,
        is_within_spec: payload.is_within_spec,
        inspector_id: payload.inspector_id || null
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/washing')
    return { success: true, auditId: data.id }
  } catch (error: any) {
    console.error('recordShrinkageAuditAction error:', error)
    return { success: false, error: error.message }
  }
}

// -----------------------------------------------------------------------------
// 4. WASHING FLOOR WORKERS
// -----------------------------------------------------------------------------

const isUUID = (val?: string | null) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

export async function fetchWashingWorkersAction(companyName?: string): Promise<any[]> {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:washing:workers`

  return CacheManager.fetchOrSet<any[]>(
    cacheKey,
    async () => {
      try {
        if (!companyName || !companyName.trim()) {
          return []
        }

        const { data, error } = await supabaseAdmin
          .from('washing_workers')
          .select('*')
          .eq('company_name', companyName.trim())
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('[fetchWashingWorkersAction] Supabase notice:', error.message)
          return []
        }

        return (data || []).map((w: any) => ({
          id: w.id,
          worker_user_id: w.worker_user_id || undefined,
          worker_name: w.worker_name,
          phone_number: w.phone_number,
          worker_email: w.worker_email,
          role: w.role || 'Washer Operator',
          roles: Array.isArray(w.roles) ? w.roles : ['WASH_MASTER'],
          assigned_machine: w.assigned_machine || 'Washer 01',
          shift: w.shift || 'MORNING',
          status: w.status || 'ACTIVE',
          assigned_pieces: w.assigned_pieces || 0,
          completed_pieces: w.completed_pieces || 0,
          company_name: w.company_name,
          created_at: w.created_at
        }))
      } catch (err) {
        console.error('[fetchWashingWorkersAction] Unexpected error:', err)
        return []
      }
    },
    120,
    [`company:${normComp}:washing`, 'washing_workers']
  )
}

export async function registerWashingWorkerAction(payload: {
  worker_name: string
  phone_number: string
  password: string
  roles: string[]
  assigned_machine?: string
  shift?: 'MORNING' | 'EVENING' | 'NIGHT'
  company_name?: string
}) {
  try {
    const rawDigits = payload.phone_number.replace(/\D/g, '')
    const phone10 = rawDigits.slice(-10)
    const nameClean = payload.worker_name.trim()
    const internalEmail = `${phone10}@washing.nubira.local`

    if (!phone10 || phone10.length !== 10) {
      return { success: false, error: 'Valid 10-digit phone number is required.' }
    }
    if (!payload.password || payload.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    // 1. Create or Update Supabase Auth User
    let authUserId: string | undefined
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
      const foundUser = userList?.users?.find(
        u => u.email?.toLowerCase() === internalEmail.toLowerCase() ||
             u.user_metadata?.phone_number === phone10
      )

      if (foundUser) {
        authUserId = foundUser.id
        await supabaseAdmin.auth.admin.updateUserById(foundUser.id, {
          password: payload.password,
          user_metadata: {
            role: 'WASHING_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
            assigned_machine: payload.assigned_machine,
            shift: payload.shift,
            company_name: payload.company_name
          }
        })
      } else {
        const { data: newUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: internalEmail,
          password: payload.password,
          email_confirm: true,
          user_metadata: {
            role: 'WASHING_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
            assigned_machine: payload.assigned_machine,
            shift: payload.shift,
            company_name: payload.company_name
          }
        })
        if (!authErr && newUser?.user) {
          authUserId = newUser.user.id
        }
      }
    } catch (authErr) {
      console.warn('Supabase auth user creation warning:', authErr)
    }

    // 2. Insert or update in washing_workers table
    const primaryRoleLabel = payload.roles.map(r => r.replace(/_/g, ' ')).join(', ')
    try {
      await supabaseAdmin
        .from('washing_workers')
        .upsert({
          worker_user_id: authUserId || null,
          worker_name: nameClean,
          phone_number: phone10,
          worker_email: internalEmail,
          roles: payload.roles,
          role: primaryRoleLabel,
          assigned_machine: payload.assigned_machine || 'Washer 01',
          shift: payload.shift || 'MORNING',
          company_name: payload.company_name,
          status: 'ACTIVE'
        }, { onConflict: 'phone_number' })
    } catch (dbErr) {
      console.warn('washing_workers db warning:', dbErr)
    }

    revalidatePath('/washing')
    revalidatePath('/washing/worker')
    revalidatePath('/washing/worker/history')

    return {
      success: true,
      worker: {
        id: `ww-${Date.now()}`,
        worker_user_id: authUserId || undefined,
        worker_name: nameClean,
        phone_number: phone10,
        worker_email: internalEmail,
        roles: payload.roles,
        role: primaryRoleLabel,
        assigned_machine: payload.assigned_machine || 'Washer 01',
        shift: payload.shift || 'MORNING',
        status: 'ACTIVE' as const,
        assigned_pieces: 0,
        completed_pieces: 0,
        created_at: new Date().toISOString()
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register washing worker.' }
  }
}

export async function deleteWashingWorkerAction(workerId: string) {
  try {
    const rawDigits = workerId.replace(/\D/g, '')
    const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : ''

    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
      if (userList?.users) {
        const found = userList.users.find(u => {
          if (workerId && u.id === workerId) return true
          const uPhone = (u.user_metadata?.phone_number || '').replace(/\D/g, '').slice(-10)
          if (phone10 && uPhone === phone10) return true
          if (phone10 && u.email?.startsWith(phone10)) return true
          return false
        })
        if (found) {
          await supabaseAdmin.auth.admin.deleteUser(found.id)
        }
      }
    } catch (authErr) {
      console.warn('deleteWashingWorker auth cleanup warning:', authErr)
    }

    if (workerId && isUUID(workerId)) {
      await supabaseAdmin.from('washing_workers').delete().eq('id', workerId)
    }
    if (phone10) {
      await supabaseAdmin.from('washing_workers').delete().eq('phone_number', phone10)
    }
    if (workerId && !isUUID(workerId)) {
      await supabaseAdmin.from('washing_workers').delete().or(`id.eq.${workerId},worker_name.ilike.%${workerId}%`)
    }

    revalidatePath('/washing')
    revalidatePath('/washing/worker')
    revalidatePath('/washing/worker/history')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteWashingWorkerAction] Error:', err)
    return { success: false, error: err.message }
  }
}

// -----------------------------------------------------------------------------
// 5. WASHING TASK ALLOCATIONS
// -----------------------------------------------------------------------------

export async function fetchWashingTaskAllocationsAction(companyName?: string): Promise<any[]> {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:washing:allocations`

  return CacheManager.fetchOrSet<any[]>(
    cacheKey,
    async () => {
      try {
        if (!companyName || !companyName.trim()) {
          return []
        }

        const { data, error } = await supabaseAdmin
          .from('washing_task_allocations')
          .select('*')
          .eq('company_name', companyName.trim())
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('[fetchWashingTaskAllocationsAction] Supabase notice:', error.message)
          return []
        }
        return data || []
      } catch (err) {
        console.error('[fetchWashingTaskAllocationsAction] Unexpected error:', err)
        return []
      }
    },
    30,
    [`company:${normComp}:washing`, 'washing_allocations']
  )
}

export async function saveWashingTaskAllocationAction(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    let existingId: string | undefined
    if (isUUID(payload.id)) {
      existingId = payload.id
    } else if (payload.task_ref) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('washing_task_allocations')
          .select('id')
          .eq('task_ref', payload.task_ref)
          .limit(1)
          .maybeSingle()
        if (existing?.id) existingId = existing.id
      } catch (_) {}
    }

    let validWorkerId: string | null = isUUID(payload.worker_id) ? payload.worker_id : null
    if (!validWorkerId && (payload.worker_phone || payload.worker_name)) {
      try {
        const phone10 = (payload.worker_phone || '').replace(/\D/g, '').slice(-10)
        let query = supabaseAdmin.from('washing_workers').select('id')
        if (phone10) {
          query = query.or(`phone_number.eq.${phone10},phone_number.ilike.%${phone10}%`)
        } else if (payload.worker_name) {
          query = query.ilike('worker_name', payload.worker_name.trim())
        }
        const { data: worker } = await query.limit(1).maybeSingle()
        if (worker?.id && isUUID(worker.id)) validWorkerId = worker.id
      } catch (_) {}
    }

    const cleanPayload: any = {
      ...(existingId ? { id: existingId } : {}),
      task_ref: payload.task_ref,
      buyer_id: isUUID(payload.buyer_id) ? payload.buyer_id : null,
      buyer_name: payload.buyer_name || 'Direct Buyer',
      article_number: payload.article_number,
      article_name: payload.article_name || null,
      worker_id: validWorkerId,
      worker_name: payload.worker_name,
      worker_phone: payload.worker_phone || null,
      table_number: payload.table_number || payload.machine_number || 'Washer 01 (Tumbler 600kg)',
      pieces_to_wash: Number(payload.pieces_to_wash || payload.pieces_to_embroider || payload.pieces_to_cut) || 0,
      completed_pieces: Number(payload.completed_pieces) || 0,
      alloted_hours: Number(payload.alloted_hours) || 4.0,
      due_time: payload.due_time || null,
      wash_recipe: payload.wash_recipe || 'Bio-Enzyme Wash 55°C',
      notes: payload.notes || null,
      company_name: payload.company_name,
      status: payload.status || 'ASSIGNED',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('washing_task_allocations')
      .upsert(cleanPayload)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[saveWashingTaskAllocationAction] Supabase notice:', error.message)
      return { success: false, error: error.message, data: payload }
    }

    revalidatePath('/washing')
    revalidatePath('/washing/worker')
    revalidatePath('/washing/worker/history')
    await CacheManager.invalidateTag('washing_allocations')
    await CacheManager.invalidateCompanyModule(payload.company_name || 'all', 'washing')
    return { success: true, data }
  } catch (err: any) {
    console.error('[saveWashingTaskAllocationAction] Error:', err)
    return { success: false, error: err.message, data: payload }
  }
}

export async function deleteWashingTaskAllocationAction(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabaseAdmin.from('washing_task_allocations').delete()
    if (isUUID(taskId)) {
      query = query.eq('id', taskId)
    } else {
      query = query.eq('task_ref', taskId)
    }

    const { error } = await query

    if (error) {
      console.warn('[deleteWashingTaskAllocationAction] Supabase notice:', error.message)
    }

    revalidatePath('/washing')
    revalidatePath('/washing/worker')
    revalidatePath('/washing/worker/history')
    await CacheManager.invalidateTag('washing_allocations')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteWashingTaskAllocationAction] Error:', err)
    return { success: true }
  }
}

