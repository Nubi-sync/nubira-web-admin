'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { CacheManager } from '@/lib/cache/cache-manager'
import { StitchingWorker, StitchingTaskAllocation, StitchingSubmissionRecord } from './types/stitching'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const isUUID = (val?: string | null) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

// -----------------------------------------------------------------------------
// 1. STITCHING WORKERS
// -----------------------------------------------------------------------------

export async function fetchStitchingWorkersAction(companyName?: string): Promise<StitchingWorker[]> {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:stitching:workers`

  return CacheManager.fetchOrSet<StitchingWorker[]>(
    cacheKey,
    async () => {
      try {
        if (!companyName || !companyName.trim()) {
          return []
        }

        const { data, error } = await supabaseAdmin
          .from('stitching_workers')
          .select('*')
          .eq('company_name', companyName.trim())
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('[fetchStitchingWorkersAction] Supabase notice:', error.message)
          return []
        }

        return (data || []).map((w: any) => ({
          id: w.id,
          worker_user_id: w.worker_user_id || undefined,
          worker_name: w.worker_name,
          phone_number: w.phone_number,
          worker_email: w.worker_email,
          role: w.role || 'Tailor / Sewing Operator',
          roles: Array.isArray(w.roles) ? w.roles : ['TAILOR'],
          assigned_machine: w.assigned_machine || 'Single Needle (SNLS)',
          machine_specialty: w.machine_specialty || w.assigned_machine || 'Single Needle Lockstitch (SNLS)',
          shift: w.shift || 'MORNING',
          status: w.status || 'ACTIVE',
          assigned_pieces: w.assigned_pieces || 0,
          completed_pieces: w.completed_pieces || 0,
          piece_rate_inr: Number(w.piece_rate_inr) || 12,
          company_name: w.company_name,
          created_at: w.created_at
        }))
      } catch (err) {
        console.error('[fetchStitchingWorkersAction] Error:', err)
        return []
      }
    },
    120,
    [`company:${normComp}:stitching`, 'stitching_workers']
  )
}

export async function registerStitchingWorkerAction(payload: {
  worker_name: string
  phone_number: string
  password: string
  roles: string[]
  assigned_machine?: string
  machine_specialty?: string
  shift?: 'MORNING' | 'EVENING' | 'NIGHT'
  piece_rate_inr?: number
  company_name?: string
}) {
  try {
    const rawDigits = payload.phone_number.replace(/\D/g, '')
    const phone10 = rawDigits.slice(-10)
    const nameClean = payload.worker_name.trim()
    const internalEmail = `${phone10}@stitching.nubira.local`

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
            role: 'STITCHING_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
            assigned_machine: payload.assigned_machine,
            machine_specialty: payload.machine_specialty,
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
            role: 'STITCHING_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
            assigned_machine: payload.assigned_machine,
            machine_specialty: payload.machine_specialty,
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

    // 2. Insert or update in stitching_workers table
    const primaryRoleLabel = payload.roles.map(r => r.replace(/_/g, ' ')).join(', ')
    try {
      await supabaseAdmin
        .from('stitching_workers')
        .upsert({
          worker_user_id: authUserId || null,
          worker_name: nameClean,
          phone_number: phone10,
          worker_email: internalEmail,
          roles: payload.roles,
          role: primaryRoleLabel,
          assigned_machine: payload.assigned_machine || 'Single Needle (SNLS)',
          machine_specialty: payload.machine_specialty || payload.assigned_machine || 'Single Needle Lockstitch (SNLS)',
          shift: payload.shift || 'MORNING',
          piece_rate_inr: payload.piece_rate_inr || 12,
          company_name: payload.company_name,
          status: 'ACTIVE'
        }, { onConflict: 'phone_number' })
    } catch (dbErr) {
      console.warn('stitching_workers db warning:', dbErr)
    }

    revalidatePath('/stitching-sewing')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/stitching-sewing/worker')
    revalidatePath('/stitching-sewing/worker/history')

    return {
      success: true,
      worker: {
        id: `sw-${Date.now()}`,
        worker_user_id: authUserId || undefined,
        worker_name: nameClean,
        phone_number: phone10,
        worker_email: internalEmail,
        roles: payload.roles as any,
        role: primaryRoleLabel,
        assigned_machine: payload.assigned_machine || 'Single Needle (SNLS)',
        machine_specialty: payload.machine_specialty || payload.assigned_machine || 'Single Needle Lockstitch (SNLS)',
        shift: payload.shift || 'MORNING',
        status: 'ACTIVE' as const,
        assigned_pieces: 0,
        completed_pieces: 0,
        piece_rate_inr: payload.piece_rate_inr || 12,
        company_name: payload.company_name,
        created_at: new Date().toISOString()
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register stitching operator.' }
  }
}

export async function deleteStitchingWorkerAction(workerId: string) {
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
      console.warn('deleteStitchingWorker auth cleanup warning:', authErr)
    }

    if (workerId && isUUID(workerId)) {
      await supabaseAdmin.from('stitching_workers').delete().eq('id', workerId)
    }
    if (phone10) {
      await supabaseAdmin.from('stitching_workers').delete().eq('phone_number', phone10)
    }
    if (workerId && !isUUID(workerId)) {
      await supabaseAdmin.from('stitching_workers').delete().or(`id.eq.${workerId},worker_name.ilike.%${workerId}%`)
    }

    revalidatePath('/stitching-sewing')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/stitching-sewing/worker')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteStitchingWorkerAction] Error:', err)
    return { success: false, error: err.message }
  }
}

// -----------------------------------------------------------------------------
// 2. STITCHING TASK ALLOCATIONS
// -----------------------------------------------------------------------------

export async function fetchStitchingTaskAllocationsAction(companyName?: string): Promise<StitchingTaskAllocation[]> {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:stitching:allocations`

  return CacheManager.fetchOrSet<StitchingTaskAllocation[]>(
    cacheKey,
    async () => {
      try {
        if (!companyName || !companyName.trim()) {
          return []
        }

        const { data, error } = await supabaseAdmin
          .from('stitching_task_allocations')
          .select('*')
          .eq('company_name', companyName.trim())
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('[fetchStitchingTaskAllocationsAction] Supabase notice:', error.message)
          return []
        }

        return (data || []).map((t: any) => ({
          id: t.id,
          task_ref: t.task_ref || `STK-${t.id?.slice(0, 5)}`,
          lot_number: t.lot_number || 'LOT-DEFAULT',
          po_number: t.po_number,
          article_name: t.article_name || 'Standard Article',
          style_number: t.style_number,
          operation_type: t.operation_type || 'Full Garment Assembly',
          machine_type: t.machine_type || 'Single Needle (SNLS)',
          target_quantity: Number(t.target_quantity) || 0,
          completed_quantity: Number(t.completed_quantity) || 0,
          rejected_quantity: Number(t.rejected_quantity) || 0,
          piece_rate_inr: Number(t.piece_rate_inr) || 12,
          alloted_hours: Number(t.alloted_hours) || 8,
          worker_id: t.worker_id,
          worker_name: t.worker_name,
          worker_phone: t.worker_phone,
          status: t.status || 'PENDING',
          due_date: t.due_date,
          priority: t.priority || 'NORMAL',
          company_name: t.company_name,
          notes: t.notes,
          started_at: t.started_at,
          completed_at: t.completed_at,
          created_at: t.created_at
        }))
      } catch (err) {
        console.error('[fetchStitchingTaskAllocationsAction] Error:', err)
        return []
      }
    },
    30,
    [`company:${normComp}:stitching`, 'stitching_allocations']
  )
}

export async function saveStitchingTaskAllocationAction(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    let existingId: string | undefined
    if (isUUID(payload.id)) {
      existingId = payload.id
    } else if (payload.task_ref) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('stitching_task_allocations')
          .select('id')
          .eq('task_ref', payload.task_ref)
          .maybeSingle()
        if (existing?.id) existingId = existing.id
      } catch (_) {}
    }

    const dbRow: any = {
      task_ref: payload.task_ref,
      lot_number: payload.lot_number || 'LOT-DEFAULT',
      po_number: payload.po_number || null,
      article_name: payload.article_name,
      style_number: payload.style_number || null,
      operation_type: payload.operation_type || 'Full Assembly',
      machine_type: payload.machine_type || 'Single Needle (SNLS)',
      target_quantity: Number(payload.target_quantity) || 0,
      completed_quantity: Number(payload.completed_quantity) || 0,
      rejected_quantity: Number(payload.rejected_quantity) || 0,
      piece_rate_inr: Number(payload.piece_rate_inr) || 12,
      alloted_hours: Number(payload.alloted_hours) || 8,
      worker_id: payload.worker_id,
      worker_name: payload.worker_name,
      worker_phone: payload.worker_phone || null,
      status: payload.status || 'PENDING',
      due_date: payload.due_date || null,
      priority: payload.priority || 'NORMAL',
      company_name: payload.company_name,
      notes: payload.notes || null,
      started_at: payload.started_at || null,
      completed_at: payload.completed_at || null,
      created_at: payload.created_at || new Date().toISOString()
    }

    let savedRecord: any
    if (existingId) {
      const { data, error } = await supabaseAdmin
        .from('stitching_task_allocations')
        .update(dbRow)
        .eq('id', existingId)
        .select()
        .single()
      if (error) throw error
      savedRecord = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('stitching_task_allocations')
        .insert([dbRow])
        .select()
        .single()
      if (error) throw error
      savedRecord = data
    }

    revalidatePath('/stitching-sewing')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/stitching-sewing/worker')
    return { success: true, data: savedRecord }
  } catch (err: any) {
    console.error('[saveStitchingTaskAllocationAction] Error:', err)
    return { success: false, error: err.message }
  }
}

export async function updateStitchingTaskStatusAction(
  taskId: string,
  status: StitchingTaskAllocation['status'],
  completedQty?: number,
  notes?: string
) {
  try {
    const updateData: any = { status }
    if (completedQty !== undefined) updateData.completed_quantity = completedQty
    if (notes !== undefined) updateData.notes = notes
    if (status === 'IN_PROGRESS') updateData.started_at = new Date().toISOString()
    if (status === 'COMPLETED') updateData.completed_at = new Date().toISOString()

    if (isUUID(taskId)) {
      await supabaseAdmin.from('stitching_task_allocations').update(updateData).eq('id', taskId)
    } else {
      await supabaseAdmin.from('stitching_task_allocations').update(updateData).eq('task_ref', taskId)
    }

    revalidatePath('/stitching-sewing')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/stitching-sewing/worker')
    return { success: true }
  } catch (err: any) {
    console.error('[updateStitchingTaskStatusAction] Error:', err)
    return { success: false, error: err.message }
  }
}

export async function submitStitchingWorkerProgressAction(payload: {
  taskId: string
  taskRef?: string
  completedPieces: number
  rejectedPieces?: number
  workerId?: string
  workerName?: string
  companyName?: string
  notes?: string
}) {
  try {
    const { taskId, completedPieces, rejectedPieces = 0, notes } = payload

    let task: any
    if (isUUID(taskId)) {
      const { data } = await supabaseAdmin
        .from('stitching_task_allocations')
        .select('*')
        .eq('id', taskId)
        .maybeSingle()
      task = data
    } else {
      const { data } = await supabaseAdmin
        .from('stitching_task_allocations')
        .select('*')
        .eq('task_ref', taskId)
        .maybeSingle()
      task = data
    }

    const currentCompleted = Number(task?.completed_quantity || 0)
    const newCompleted = currentCompleted + completedPieces
    const target = Number(task?.target_quantity || 0)
    const isNowCompleted = newCompleted >= target

    const updateFields: any = {
      completed_quantity: newCompleted,
      rejected_quantity: (Number(task?.rejected_quantity || 0) + rejectedPieces),
      status: isNowCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      notes: notes || task?.notes
    }

    if (isNowCompleted) {
      updateFields.completed_at = new Date().toISOString()
    }

    if (isUUID(taskId)) {
      await supabaseAdmin.from('stitching_task_allocations').update(updateFields).eq('id', taskId)
    } else {
      await supabaseAdmin.from('stitching_task_allocations').update(updateFields).eq('task_ref', taskId)
    }

    // Record submission log
    try {
      const pieceRate = Number(task?.piece_rate_inr || 12)
      await supabaseAdmin.from('stitching_submissions').insert([{
        task_id: task?.id || null,
        task_ref: task?.task_ref || payload.taskRef || 'STK-SUBMIT',
        lot_number: task?.lot_number || 'LOT-DEFAULT',
        article_name: task?.article_name || 'Standard Article',
        operation_type: task?.operation_type || 'Full Assembly',
        worker_id: payload.workerId || task?.worker_id,
        worker_name: payload.workerName || task?.worker_name,
        completed_pieces: completedPieces,
        rejected_pieces: rejectedPieces,
        piece_rate_inr: pieceRate,
        total_earned_inr: completedPieces * pieceRate,
        company_name: payload.companyName || task?.company_name,
        notes: notes || null,
        submitted_at: new Date().toISOString()
      }])
    } catch (_) {}

    revalidatePath('/stitching-sewing')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/stitching-sewing/worker')
    revalidatePath('/stitching-sewing/worker/history')

    return {
      success: true,
      newCompleted,
      status: updateFields.status
    }
  } catch (err: any) {
    console.error('[submitStitchingWorkerProgressAction] Error:', err)
    return { success: false, error: err.message }
  }
}
