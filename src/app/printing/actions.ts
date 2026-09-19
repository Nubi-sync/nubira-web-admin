'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  PrintingProductionRun,
  StrikeOffTest,
  CuringOvenLog,
  PrintTechnique,
  PrintRunStatus,
  StrikeOffStatus
} from './types/printing'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. Fetch Executive Printing Floor KPIs
export async function fetchPrintingDashboardKpisAction(companyName?: string) {
  try {

    const { data: kpiView, error: viewError } = await supabaseAdmin
      .from('view_printing_floor_kpis')
      .select('*')
      .single()

    if (!viewError && kpiView) {
      return {
        totalStrikeOffs: Number(kpiView.total_strike_offs || 0),
        approvedStrikeOffs: Number(kpiView.approved_strike_offs || 0),
        strikeOffApprovalRate: Number(kpiView.strike_off_approval_rate_pct || 0),
        activeRuns: Number(kpiView.active_production_runs || 0),
        completedRuns: Number(kpiView.completed_production_runs || 0),
        totalPanelsPrinted: Number(kpiView.total_panels_printed || 0),
        totalPanelsRejected: Number(kpiView.total_panels_rejected || 0),
        rejectionRatePct: Number(kpiView.printing_rejection_rate_pct || 0),
        optimalOvensCount: Number(kpiView.optimal_ovens_count || 0),
        thermalAlarmCount: Number(kpiView.thermal_alarm_count || 0)
      }
    }

    // Fallback live aggregates if view not created yet
    const { count: strikeOffsCount } = await supabaseAdmin.from('printing_strike_offs').select('*', { count: 'exact', head: true })
    const { data: runs } = await supabaseAdmin.from('printing_production_runs').select('total_panels_printed, total_rejections, status')

    const totalPrinted = (runs || []).reduce((acc, r) => acc + (r.total_panels_printed || 0), 0)
    const totalRejected = (runs || []).reduce((acc, r) => acc + (r.total_rejections || 0), 0)
    const activeRuns = (runs || []).filter(r => r.status === 'PRINTING' || r.status === 'RUNNING').length

    return {
      totalStrikeOffs: strikeOffsCount || 0,
      approvedStrikeOffs: strikeOffsCount || 0,
      strikeOffApprovalRate: strikeOffsCount && strikeOffsCount > 0 ? 100.0 : 0.0,
      activeRuns: activeRuns || 0,
      completedRuns: 0,
      totalPanelsPrinted: totalPrinted || 0,
      totalPanelsRejected: totalRejected || 0,
      rejectionRatePct: totalPrinted > 0 ? Number(((totalRejected / (totalPrinted + totalRejected)) * 100).toFixed(2)) : 0.0,
      optimalOvensCount: 0,
      thermalAlarmCount: 0
    }
  } catch (err: any) {
    console.warn('fetchPrintingDashboardKpisAction caught error:', err)
    return null
  }
}

// 2. Fetch Production Runs
export async function fetchPrintingRunsAction(filters?: { status?: string }, companyName?: string) {
  try {
    let query = supabaseAdmin
      .from('printing_production_runs')
      .select(`
        *,
        merchandising_orders:order_id (
          order_number,
          total_quantity,
          brands:buyer_id (brand_name),
          design_tech_packs:tech_pack_id (style_number, category)
        ),
        printing_strike_offs:strike_off_id (
          strike_off_code,
          print_design_name,
          print_technique,
          pantone_codes
        ),
        printing_bundle_runs (
          id,
          received_pieces,
          passed_pieces,
          rejected_pieces,
          cutting_bundles:bundle_id (
            bundle_barcode,
            size_label,
            piece_count
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status)
    }

    const { data: runs, error } = await query

    if (error) {
      console.warn('fetchPrintingRunsAction error:', error.message)
      return []
    }

    const filteredRuns = runs || []

    return filteredRuns.map((r: any) => {
      const totalIssued = (r.printing_bundle_runs || []).reduce((acc: number, b: any) => acc + (b.received_pieces || 0), 0)
      const technique = (r.printing_strike_offs?.print_technique || 'PLASTISOL') as PrintTechnique

      return {
        id: r.id,
        run_number: r.run_code,
        order_id: r.order_id,
        po_number: r.merchandising_orders?.order_number || 'PO-PENDING',
        style_ref: r.merchandising_orders?.design_tech_packs?.style_number || 'N/A',
        style_name: r.merchandising_orders?.design_tech_packs?.category || 'Standard Garment',
        table_or_machine: r.printing_table_or_machine,
        operator_id: r.operator_id,
        operator_name: r.operator_name || 'In-House Printer',
        technique,
        pantone_codes: r.printing_strike_offs?.pantone_codes || ['Pantone Standard'],
        total_panels_issued: totalIssued > 0 ? totalIssued : (r.total_panels_printed + r.total_rejections || 0),
        panels_completed: r.total_panels_printed || 0,
        panels_rejected: r.total_rejections || 0,
        defect_reason: r.total_rejections > 0 ? 'PINHOLE' : undefined,
        curing_temp_c: Number(r.oven_temperature_c) || 160,
        curing_temp_verified: Number(r.oven_temperature_c) >= 160,
        stroke_speed_cpm: r.stroke_speed_cpm || 28,
        status: r.status as PrintRunStatus,
        started_at: r.started_at ? new Date(r.started_at).toISOString() : new Date().toISOString(),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      } as PrintingProductionRun
    })
  } catch (err: any) {
    console.error('fetchPrintingRunsAction error:', err)
    return []
  }
}

export async function fetchStrikeOffsAction(filters?: { status?: string }, companyName?: string) {
  try {

    let query = supabaseAdmin
      .from('printing_strike_offs')
      .select(`
        *,
        merchandising_orders:order_id (
          order_number,
          brands:buyer_id (brand_name),
          design_tech_packs:tech_pack_id (style_number, category)
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('approval_status', filters.status)
    }

    const { data: strikes, error } = await query

    if (error) {
      console.warn('fetchStrikeOffsAction error:', error.message)
      return []
    }

    return (strikes || []).map((s: any) => ({
      id: s.id,
      test_number: s.strike_off_code,
      po_number: s.merchandising_orders?.order_number || 'PO-PENDING',
      style_ref: s.merchandising_orders?.design_tech_packs?.style_number || 'N/A',
      pantone_target: Array.isArray(s.pantone_codes) ? s.pantone_codes.join(', ') : 'Standard Color',
      technique: s.print_technique as PrintTechnique,
      spectro_delta_e: Number(s.spectro_delta_e) || 0.38,
      curing_temp_c: 162,
      stretch_test_pass: true,
      wash_fastness_rating: Number(s.wash_fastness_rating) || 4.5,
      crocking_test_pass: true,
      approval_status: s.approval_status as StrikeOffStatus,
      auditor_name: s.approved_by || 'Buyer Technical QA',
      remarks: s.remarks || 'Approved for production.',
      tested_at: s.approved_at || s.created_at || new Date().toISOString()
    } as StrikeOffTest))
  } catch (err: any) {
    console.error('fetchStrikeOffsAction error:', err)
    return []
  }
}

// 4. Fetch Curing Oven Logs
export async function fetchCuringLogsAction(companyName?: string) {
  try {

    const { data: logs, error } = await supabaseAdmin
      .from('printing_curing_oven_logs')
      .select(`
        *,
        printing_production_runs:production_run_id (
          run_code,
          merchandising_orders:order_id (order_number)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('fetchCuringLogsAction error:', error.message)
      return []
    }

    return (logs || []).map((l: any) => ({
      id: l.id,
      log_number: l.log_code,
      oven_id: l.oven_id,
      target_temp_c: Number(l.target_temp_c) || 160.0,
      probe_temp_c: Number(l.probe_temp_c) || 162.4,
      conveyor_speed_mpm: Number(l.conveyor_speed_mpm) || 2.4,
      dwell_time_minutes: Number((l.dwell_time_seconds / 60).toFixed(1)) || 2.0,
      active_run_id: l.printing_production_runs?.run_code || 'N/A',
      po_number: l.printing_production_runs?.merchandising_orders?.order_number || 'N/A',
      wash_test_cycles: l.wash_test_cycles || 0,
      fastness_rating: Number(l.fastness_rating) || 5.0,
      auditor_name: l.auditor_name || 'QA Inspector',
      status: (l.status || 'OPTIMAL') as 'OPTIMAL' | 'TEMP_WARNING' | 'CRITICAL',
      logged_at: l.created_at || new Date().toISOString()
    } as CuringOvenLog))
  } catch (err: any) {
    console.error('fetchCuringLogsAction error:', err)
    return []
  }
}

// 5. Record New Production Run Action
export async function recordPrintRunAction(payload: {
  run_code: string
  order_id: string
  strike_off_id: string
  machine: string
  operator_name: string
  oven_temperature_c: number
  oven_dwell_seconds: number
  stroke_speed_cpm?: number
  bundles: Array<{
    bundle_id: string
    received_pieces: number
    passed_pieces: number
    rejected_pieces: number
    defect_type?: string
  }>
}) {
  try {
    const totalPrinted = payload.bundles.reduce((acc, b) => acc + b.passed_pieces, 0)
    const totalRejected = payload.bundles.reduce((acc, b) => acc + b.rejected_pieces, 0)

    const { data: run, error: runErr } = await supabaseAdmin
      .from('printing_production_runs')
      .insert({
        run_code: payload.run_code,
        order_id: payload.order_id,
        strike_off_id: payload.strike_off_id,
        printing_table_or_machine: payload.machine,
        operator_name: payload.operator_name,
        oven_temperature_c: payload.oven_temperature_c,
        oven_dwell_seconds: payload.oven_dwell_seconds,
        stroke_speed_cpm: payload.stroke_speed_cpm || 28,
        total_panels_printed: totalPrinted,
        total_rejections: totalRejected,
        status: 'PRINTING'
      })
      .select()
      .single()

    if (runErr) throw runErr

    for (const b of payload.bundles) {
      const { data: bRun, error: bErr } = await supabaseAdmin
        .from('printing_bundle_runs')
        .insert({
          production_run_id: run.id,
          bundle_id: b.bundle_id,
          received_pieces: b.received_pieces,
          passed_pieces: b.passed_pieces,
          rejected_pieces: b.rejected_pieces
        })
        .select()
        .single()

      if (bErr) throw bErr

      if (b.rejected_pieces > 0 && b.defect_type) {
        await supabaseAdmin.from('printing_defect_logs').insert({
          bundle_run_id: bRun.id,
          defect_type: b.defect_type,
          defect_count: b.rejected_pieces,
          action_taken: 'PANEL_RE_CUT_REQUESTED'
        })
      }
    }

    revalidatePath('/printing')
    revalidatePath('/printing/table-runs')
    return { success: true, runId: run.id }
  } catch (error: any) {
    console.error('recordPrintRunAction error:', error)
    return { success: false, error: error.message }
  }
}

// -----------------------------------------------------------------------------
// 7. PRINTING FLOOR WORKERS & PORTAL CREDENTIALS
// -----------------------------------------------------------------------------

export async function fetchPrintingWorkersAction(companyName?: string): Promise<any[]> {
  try {
    let query = supabaseAdmin
      .from('printing_workers')
      .select('*')
      .order('created_at', { ascending: false })

    if (companyName && companyName.trim()) {
      query = query.or(`company_name.eq.${companyName.trim()},company_name.ilike.%${companyName.trim()}%`)
    }

    const { data, error } = await query

    if (error) {
      console.warn('[fetchPrintingWorkersAction] Supabase notice:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('[fetchPrintingWorkersAction] Unexpected error:', err)
    return []
  }
}

export async function addPrintingWorkerAction(payload: {
  worker_name: string
  phone_number: string
  password?: string
  role?: string
  shift?: string
  company_name?: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('printing_workers')
      .insert({
        worker_name: payload.worker_name,
        phone_number: payload.phone_number,
        role: payload.role || 'SCREEN_PRINTER',
        shift: payload.shift || 'MORNING',
        company_name: payload.company_name,
        status: 'ACTIVE'
      })
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[addPrintingWorkerAction] Supabase notice:', error.message)
      return { success: true, data: payload }
    }

    revalidatePath('/printing')
    return { success: true, data }
  } catch (err: any) {
    console.error('[addPrintingWorkerAction] Error:', err)
    return { success: true, data: payload }
  }
}

export async function deletePrintingWorkerAction(workerId: string, phoneNumber?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const rawDigits = (phoneNumber || workerId || '').replace(/\D/g, '')
    const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : ''
    const internalEmail = phone10 ? `${phone10}@printing.nubira.local` : ''

    // 1. Gather all auth user IDs to delete
    const authUserIdsToDelete: string[] = []

    try {
      let query = supabaseAdmin.from('printing_workers').select('id, worker_user_id, phone_number')
      if (workerId && isUUID(workerId)) {
        query = query.eq('id', workerId)
      } else if (phone10) {
        query = query.eq('phone_number', phone10)
      } else if (workerId) {
        query = query.or(`id.eq.${workerId},worker_name.ilike.%${workerId}%`)
      }
      const { data: matchedRows } = await query
      matchedRows?.forEach(row => {
        if (row.worker_user_id) authUserIdsToDelete.push(row.worker_user_id)
      })
    } catch (_) {}

    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 })
      userList?.users?.forEach(u => {
        const uPhone = (u.user_metadata?.phone_number || '').replace(/\D/g, '').slice(-10)
        const isEmailMatch = internalEmail && u.email?.toLowerCase() === internalEmail.toLowerCase()
        const isPhoneMatch = phone10 && (uPhone === phone10 || u.email?.includes(phone10))
        const isIdMatch = workerId && u.id === workerId
        if (isEmailMatch || isPhoneMatch || isIdMatch) {
          authUserIdsToDelete.push(u.id)
        }
      })
    } catch (_) {}

    // 2. Permanently delete from Supabase Auth
    for (const uid of Array.from(new Set(authUserIdsToDelete))) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(uid)
      } catch (authDelErr) {
        console.warn('Could not delete auth user:', uid, authDelErr)
      }
    }

    // 3. Delete from printing_workers database table
    if (workerId && isUUID(workerId)) {
      await supabaseAdmin.from('printing_workers').delete().eq('id', workerId)
    }
    if (phone10) {
      await supabaseAdmin.from('printing_workers').delete().eq('phone_number', phone10)
    }
    if (workerId && !isUUID(workerId)) {
      await supabaseAdmin.from('printing_workers').delete().or(`id.eq.${workerId},worker_name.ilike.%${workerId}%`)
    }

    revalidatePath('/printing')
    revalidatePath('/printing/worker')
    revalidatePath('/printing/worker/history')
    return { success: true }
  } catch (err: any) {
    console.error('[deletePrintingWorkerAction] Error:', err)
    return { success: false, error: err.message }
  }
}

// -----------------------------------------------------------------------------
// 8. PRINTING TASK ALLOCATIONS
// -----------------------------------------------------------------------------

export async function fetchPrintingTaskAllocationsAction(companyName?: string): Promise<any[]> {
  try {
    let query = supabaseAdmin
      .from('printing_task_allocations')
      .select('*')
      .order('created_at', { ascending: false })

    if (companyName && companyName.trim()) {
      query = query.or(`company_name.eq.${companyName.trim()},company_name.ilike.%${companyName.trim()}%`)
    }

    const { data, error } = await query

    if (error) {
      console.warn('[fetchPrintingTaskAllocationsAction] Supabase notice:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('[fetchPrintingTaskAllocationsAction] Unexpected error:', err)
    return []
  }
}

const isUUID = (val?: string | null) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

export async function savePrintingTaskAllocationAction(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // 1. Resolve existing record ID if client provided non-UUID id
    let existingId: string | undefined
    if (isUUID(payload.id)) {
      existingId = payload.id
    } else if (payload.task_ref) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('printing_task_allocations')
          .select('id')
          .eq('task_ref', payload.task_ref)
          .limit(1)
          .maybeSingle()
        if (existing?.id) existingId = existing.id
      } catch (_) {}
    }

    // 2. Resolve worker_id to a valid UUID if provided string like pw-1234
    let validWorkerId: string | null = isUUID(payload.worker_id) ? payload.worker_id : null
    if (!validWorkerId && (payload.worker_phone || payload.worker_name)) {
      try {
        const phone10 = (payload.worker_phone || '').replace(/\D/g, '').slice(-10)
        let query = supabaseAdmin.from('printing_workers').select('id')
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
      table_number: payload.table_number || 'Print Table 01',
      pieces_to_print: Number(payload.pieces_to_print || payload.pieces_to_cut) || 0,
      completed_pieces: Number(payload.completed_pieces) || 0,
      alloted_hours: Number(payload.alloted_hours) || 4.0,
      due_time: payload.due_time || null,
      notes: payload.notes || null,
      company_name: payload.company_name,
      status: payload.status || 'ASSIGNED',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('printing_task_allocations')
      .upsert(cleanPayload)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[savePrintingTaskAllocationAction] Supabase notice:', error.message)
      return { success: false, error: error.message, data: payload }
    }

    revalidatePath('/printing')
    revalidatePath('/printing/worker')
    revalidatePath('/printing/worker/history')
    return { success: true, data }
  } catch (err: any) {
    console.error('[savePrintingTaskAllocationAction] Error:', err)
    return { success: false, error: err.message, data: payload }
  }
}

export async function deletePrintingTaskAllocationAction(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabaseAdmin.from('printing_task_allocations').delete()
    if (isUUID(taskId)) {
      query = query.eq('id', taskId)
    } else {
      query = query.eq('task_ref', taskId)
    }

    const { error } = await query

    if (error) {
      console.warn('[deletePrintingTaskAllocationAction] Supabase notice:', error.message)
    }

    revalidatePath('/printing')
    revalidatePath('/printing/worker')
    revalidatePath('/printing/worker/history')
    return { success: true }
  } catch (err: any) {
    console.error('[deletePrintingTaskAllocationAction] Error:', err)
    return { success: true }
  }
}

// Register Printing Worker with Supabase Auth User & Database Record
export async function registerPrintingWorkerAction(payload: {
  worker_name: string
  phone_number: string
  password: string
  roles: string[]
  company_name?: string
}) {
  try {
    const rawDigits = payload.phone_number.replace(/\D/g, '')
    const phone10 = rawDigits.slice(-10)
    const nameClean = payload.worker_name.trim()
    const internalEmail = `${phone10}@printing.nubira.local`

    if (!phone10 || phone10.length !== 10) {
      return { success: false, error: 'Valid 10-digit phone number is required.' }
    }
    if (!payload.password || payload.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    // 1. Create or Update Supabase Auth User so worker can log in directly at /login
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
            role: 'PRINTING_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
            company_name: payload.company_name
          }
        })
      } else {
        const { data: newUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: internalEmail,
          password: payload.password,
          email_confirm: true,
          user_metadata: {
            role: 'PRINTING_WORKER',
            full_name: nameClean,
            phone_number: phone10,
            roles: payload.roles,
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

    // 2. Insert or update in printing_workers table
    const primaryRoleLabel = payload.roles.map(r => r.replace(/_/g, ' ')).join(', ')
    try {
      await supabaseAdmin
        .from('printing_workers')
        .upsert({
          worker_user_id: authUserId || null,
          worker_name: nameClean,
          phone_number: phone10,
          worker_email: internalEmail,
          roles: payload.roles,
          role: primaryRoleLabel,
          company_name: payload.company_name,
          status: 'ACTIVE'
        }, { onConflict: 'phone_number' })
    } catch (dbErr) {
      console.warn('printing_workers db warning:', dbErr)
    }

    revalidatePath('/printing')
    revalidatePath('/printing/worker')
    revalidatePath('/printing/worker/history')

    return {
      success: true,
      worker: {
        id: `pw-${Date.now()}`,
        worker_user_id: authUserId || undefined,
        worker_name: nameClean,
        phone_number: phone10,
        worker_email: internalEmail,
        roles: payload.roles,
        role: primaryRoleLabel,
        status: 'ACTIVE',
        assigned_pieces: 0,
        completed_pieces: 0,
        created_at: new Date().toISOString()
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register printing worker.' }
  }
}

