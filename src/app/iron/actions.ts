'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  IronTable,
  IronProductionLog,
  BoilerTelemetryLog,
  FinishQcAudit,
  TableStatus,
  FinishQcStatus
} from './types/iron'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// -----------------------------------------------------------------------------
// 1. FETCH IRON DASHBOARD DATA
// -----------------------------------------------------------------------------

export async function fetchIronDashboardDataAction(companyName?: string): Promise<{
  tables: IronTable[]
  logs: IronProductionLog[]
  qcAudits: FinishQcAudit[]
}> {
  try {
    const isNonNubira = companyName && companyName.toLowerCase() !== 'nubira creation'
    const targetComp = (companyName || '').toUpperCase()

    const [tablesRes, logsRes, defectsRes] = await Promise.all([
      supabaseAdmin.from('iron_tables').select('*').order('table_code', { ascending: true }),
      supabaseAdmin
        .from('iron_production_logs')
        .select('*, table:iron_tables(table_code), order:merchandising_orders(po_number, style_name, brands:buyer_id(brand_name))')
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('iron_defect_audits')
        .select('*, iron_log:iron_production_logs(log_number, order:merchandising_orders(brands:buyer_id(brand_name)))')
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    const rawTables = tablesRes.data || []
    const rawLogs = logsRes.data || []
    const rawDefects = defectsRes.data || []

    const tables: IronTable[] = rawTables.map((t: any, idx: number) => ({
      id: t.id,
      tableNumber: t.table_code || `Table ${(idx + 1).toString().padStart(2, '0')}`,
      operatorName: 'Unassigned',
      challanId: 'IDLE',
      articleName: 'Ready for lot assignment',
      targetHourlyPcs: 60,
      pieceRate: 2.20,
      currentPiecesPressed: 0,
      status: (t.is_active ? 'ACTIVE' : 'IDLE') as TableStatus,
      ironTempC: 150,
      vacuumActive: true,
      teflonShoeVerified: true,
      shiftStartTime: '08:00 AM'
    }))

    const logs: IronProductionLog[] = rawLogs.map((l: any) => {
      const pressed = Number(l.garments_pressed) || 0
      const rate = 2.20
      return {
        id: l.id,
        tableNumber: l.table?.table_code || 'Table 01',
        operatorName: 'Finishing Presser',
        challanId: l.order?.po_number || 'CH-PENDING',
        articleName: l.order?.style_name || 'Standard Garment',
        piecesPressed: pressed,
        defectShineCount: 0,
        waterStainCount: 0,
        pieceRate: rate,
        totalEarnedWages: Number((pressed * rate).toFixed(2)),
        shiftDate: l.created_at ? l.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        shiftType: (l.shift === 'NIGHT' ? 'SHIFT_2' : 'SHIFT_1') as 'SHIFT_1' | 'SHIFT_2',
        notes: `Steam boiler: ${l.boiler_pressure_bar || 4.5} Bar`
      }
    })

    const qcAudits: FinishQcAudit[] = rawDefects.map((d: any) => {
      const isGlaze = d.defect_type === 'THERMAL_SHINE_GLAZE'
      const isWater = d.defect_type === 'WATER_DROP_STAIN'
      return {
        id: d.id,
        auditCode: `FQC-${d.id?.slice(0, 5)}`,
        tableNumber: 'Table 01',
        operatorName: 'Finishing Presser',
        challanId: 'N/A',
        articleName: 'Standard Garment',
        samplePcs: 20,
        glazeDefects: isGlaze ? (Number(d.defect_count) || 1) : 0,
        waterSpots: isWater ? (Number(d.defect_count) || 1) : 0,
        unalignedSeams: 0,
        qcStatus: (d.disposition === 'SCRAP' || Number(d.defect_count) > 2 ? 'REWORK_ALTERATION' : 'PASS') as FinishQcStatus,
        auditorName: 'QC Inspector',
        timestamp: d.created_at || new Date().toISOString(),
        actionTaken: d.disposition || 'STEAM_RE_WORK'
      }
    })

    return { tables, logs, qcAudits }
  } catch (error) {
    console.error('fetchIronDashboardDataAction error:', error)
    return { tables: [], logs: [], qcAudits: [] }
  }
}

// -----------------------------------------------------------------------------
// 2. MUTATION ACTIONS
// -----------------------------------------------------------------------------

export async function recordIroningLogAction(payload: {
  log_number: string
  order_id?: string
  table_id?: string
  operator_id?: string
  shift?: string
  garments_pressed: number
  boiler_pressure_bar: number
  total_minutes_spent: number
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('iron_production_logs')
      .insert({
        log_number: payload.log_number,
        order_id: payload.order_id || null,
        table_id: payload.table_id || null,
        operator_id: payload.operator_id || null,
        shift: payload.shift || 'DAY',
        garments_pressed: payload.garments_pressed,
        boiler_pressure_bar: payload.boiler_pressure_bar,
        total_minutes_spent: payload.total_minutes_spent,
        status: 'COMPLETED'
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/iron')
    return { success: true, logId: data.id }
  } catch (error: any) {
    console.error('recordIroningLogAction error:', error)
    return { success: false, error: error.message }
  }
}

export async function recordIronDefectAuditAction(payload: {
  iron_log_id: string
  defect_type: string
  defect_count: number
  disposition?: string
  inspector_id?: string
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('iron_defect_audits')
      .insert({
        iron_log_id: payload.iron_log_id,
        defect_type: payload.defect_type,
        defect_count: payload.defect_count,
        disposition: payload.disposition || 'STEAM_RE_WORK',
        inspector_id: payload.inspector_id || null
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/iron')
    return { success: true, auditId: data.id }
  } catch (error: any) {
    console.error('recordIronDefectAuditAction error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateIronTableStatusAction(
  tableId: string,
  isActive: boolean
) {
  try {
    const { error } = await supabaseAdmin
      .from('iron_tables')
      .update({ is_active: isActive })
      .eq('id', tableId)

    if (error) throw error

    revalidatePath('/iron')
    return { success: true }
  } catch (error: any) {
    console.error('updateIronTableStatusAction error:', error)
    return { success: false, error: error.message }
  }
}

// -----------------------------------------------------------------------------
// 3. IRON FLOOR WORKERS
// -----------------------------------------------------------------------------

const isUUID = (val?: string | null) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

export async function fetchIronWorkersAction(companyName?: string): Promise<any[]> {
  try {
    if (!companyName || !companyName.trim()) {
      return []
    }

    const { data, error } = await supabaseAdmin
      .from('iron_workers')
      .select('*')
      .eq('company_name', companyName.trim())
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[fetchIronWorkersAction] Supabase notice:', error.message)
      return []
    }

    return (data || []).map((w: any) => ({
      id: w.id,
      worker_user_id: w.worker_user_id || undefined,
      worker_name: w.worker_name,
      phone_number: w.phone_number,
      worker_email: w.worker_email,
      role: w.role || 'Finishing Presser',
      roles: Array.isArray(w.roles) ? w.roles : ['FINISHING_PRESSER'],
      assigned_table: w.assigned_table || 'Table 01',
      shift: w.shift || 'SHIFT_1',
      status: w.status || 'ACTIVE',
      assigned_pieces: w.assigned_pieces || 0,
      completed_pieces: w.completed_pieces || 0,
      company_name: w.company_name,
      created_at: w.created_at
    }))
  } catch (err) {
    console.error('[fetchIronWorkersAction] Unexpected error:', err)
    return []
  }
}

export async function registerIronWorkerAction(payload: {
  worker_name: string
  phone_number: string
  password: string
  roles: string[]
  assigned_table?: string
  shift?: 'SHIFT_1' | 'SHIFT_2' | 'GENERAL'
  company_name?: string
}) {
  try {
    const rawDigits = payload.phone_number.replace(/\D/g, '')
    const phone10 = rawDigits.slice(-10)
    const nameClean = payload.worker_name.trim()
    const internalEmail = `${phone10}@iron.nubira.local`

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
            role: 'IRON_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
            assigned_table: payload.assigned_table,
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
            role: 'IRON_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
            assigned_table: payload.assigned_table,
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

    // 2. Insert or update in iron_workers table
    const primaryRoleLabel = payload.roles.map(r => r.replace(/_/g, ' ')).join(', ')
    try {
      await supabaseAdmin
        .from('iron_workers')
        .upsert({
          worker_user_id: authUserId || null,
          worker_name: nameClean,
          phone_number: phone10,
          worker_email: internalEmail,
          roles: payload.roles,
          role: primaryRoleLabel,
          assigned_table: payload.assigned_table || 'Table 01',
          shift: payload.shift || 'SHIFT_1',
          company_name: payload.company_name,
          status: 'ACTIVE'
        }, { onConflict: 'phone_number' })
    } catch (dbErr) {
      console.warn('iron_workers db warning:', dbErr)
    }

    revalidatePath('/iron')
    revalidatePath('/iron/worker')
    revalidatePath('/iron/worker/history')

    return {
      success: true,
      worker: {
        id: `iw-${Date.now()}`,
        worker_user_id: authUserId || undefined,
        worker_name: nameClean,
        phone_number: phone10,
        worker_email: internalEmail,
        roles: payload.roles as any,
        role: (payload.roles[0] || 'FINISHING_PRESSER') as any,
        assigned_table: payload.assigned_table || 'Table 01',
        shift: payload.shift || 'SHIFT_1',
        is_active: true,
        company_name: payload.company_name,
        created_at: new Date().toISOString()
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register iron presser.' }
  }
}

export async function deleteIronWorkerAction(workerId: string) {
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
      console.warn('deleteIronWorker auth cleanup warning:', authErr)
    }

    if (workerId && isUUID(workerId)) {
      await supabaseAdmin.from('iron_workers').delete().eq('id', workerId)
    }
    if (phone10) {
      await supabaseAdmin.from('iron_workers').delete().eq('phone_number', phone10)
    }
    if (workerId && !isUUID(workerId)) {
      await supabaseAdmin.from('iron_workers').delete().or(`id.eq.${workerId},worker_name.ilike.%${workerId}%`)
    }

    revalidatePath('/iron')
    revalidatePath('/iron/worker')
    revalidatePath('/iron/worker/history')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteIronWorkerAction] Error:', err)
    return { success: false, error: err.message }
  }
}

// -----------------------------------------------------------------------------
// 4. IRON TASK ALLOCATIONS
// -----------------------------------------------------------------------------

export async function fetchIronTaskAllocationsAction(companyName?: string): Promise<any[]> {
  try {
    if (!companyName || !companyName.trim()) {
      return []
    }

    const { data, error } = await supabaseAdmin
      .from('iron_task_allocations')
      .select('*')
      .eq('company_name', companyName.trim())
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[fetchIronTaskAllocationsAction] Supabase notice:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('[fetchIronTaskAllocationsAction] Unexpected error:', err)
    return []
  }
}

export async function saveIronTaskAllocationAction(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    let existingId: string | undefined
    if (isUUID(payload.id)) {
      existingId = payload.id
    } else if (payload.task_ref) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('iron_task_allocations')
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
        let query = supabaseAdmin.from('iron_workers').select('id')
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
      cutting_allocation_id: isUUID(payload.cutting_allocation_id) ? payload.cutting_allocation_id : null,
      buyer_id: isUUID(payload.buyer_id) ? payload.buyer_id : null,
      buyer_name: payload.buyer_name || 'Direct Buyer',
      article_number: payload.article_number,
      article_name: payload.article_name || null,
      worker_id: validWorkerId,
      worker_name: payload.worker_name,
      worker_phone: payload.worker_phone || null,
      machine_table: payload.machine_table || payload.table_number || 'Steam Table 01 (Vacuum)',
      pieces_to_press: Number(payload.pieces_to_press || payload.pieces_to_wash || payload.pieces_to_embroider || payload.pieces_to_cut) || 0,
      completed_pieces: Number(payload.completed_pieces) || 0,
      alloted_hours: Number(payload.alloted_hours) || 4.0,
      shift: payload.shift || 'SHIFT_1',
      iron_temp_c: Number(payload.iron_temp_c) || 150,
      company_name: payload.company_name,
      status: payload.status || 'PENDING',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('iron_task_allocations')
      .upsert(cleanPayload)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[saveIronTaskAllocationAction] Supabase notice:', error.message)
      return { success: false, error: error.message, data: payload }
    }

    revalidatePath('/iron')
    revalidatePath('/iron/worker')
    revalidatePath('/iron/worker/history')
    return { success: true, data }
  } catch (err: any) {
    console.error('[saveIronTaskAllocationAction] Error:', err)
    return { success: false, error: err.message, data: payload }
  }
}

export async function deleteIronTaskAllocationAction(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabaseAdmin.from('iron_task_allocations').delete()
    if (isUUID(taskId)) {
      query = query.eq('id', taskId)
    } else {
      query = query.eq('task_ref', taskId)
    }

    const { error } = await query

    if (error) {
      console.warn('[deleteIronTaskAllocationAction] Supabase notice:', error.message)
    }

    revalidatePath('/iron')
    revalidatePath('/iron/worker')
    revalidatePath('/iron/worker/history')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteIronTaskAllocationAction] Error:', err)
    return { success: true }
  }
}
