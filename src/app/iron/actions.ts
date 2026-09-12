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

export async function fetchIronDashboardDataAction(): Promise<{
  tables: IronTable[]
  logs: IronProductionLog[]
  qcAudits: FinishQcAudit[]
}> {
  try {
    const [tablesRes, logsRes, defectsRes] = await Promise.all([
      supabaseAdmin.from('iron_tables').select('*').order('table_code', { ascending: true }),
      supabaseAdmin.from('iron_production_logs').select('*, table:iron_tables(table_code), order:merchandising_orders(po_number, style_name)').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('iron_defect_audits').select('*, iron_log:iron_production_logs(log_number)').order('created_at', { ascending: false }).limit(50)
    ])

    const tables: IronTable[] = (tablesRes.data || []).map((t: any, idx: number) => ({
      id: t.id,
      tableNumber: t.table_code || `Table ${(idx + 1).toString().padStart(2, '0')}`,
      operatorName: 'Finishing Presser',
      challanId: 'CH-2026-901',
      articleName: 'Heavyweight Loopback Hoodie',
      targetHourlyPcs: 60,
      pieceRate: 2.20,
      currentPiecesPressed: 420,
      status: (t.is_active ? 'ACTIVE' : 'IDLE') as TableStatus,
      ironTempC: 150,
      vacuumActive: true,
      teflonShoeVerified: true,
      shiftStartTime: '08:00 AM'
    }))

    const logs: IronProductionLog[] = (logsRes.data || []).map((l: any) => {
      const pressed = Number(l.garments_pressed) || 0
      const rate = 2.20
      return {
        id: l.id,
        tableNumber: l.table?.table_code || 'Table 01',
        operatorName: 'Finishing Presser',
        challanId: l.order?.po_number || 'CH-2026-901',
        articleName: l.order?.style_name || 'Heavyweight Loopback Hoodie',
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

    const qcAudits: FinishQcAudit[] = (defectsRes.data || []).map((d: any) => {
      const isGlaze = d.defect_type === 'THERMAL_SHINE_GLAZE'
      const isWater = d.defect_type === 'WATER_DROP_STAIN'
      return {
        id: d.id,
        auditCode: `FQC-${d.id?.slice(0, 5)}`,
        tableNumber: 'Table 01',
        operatorName: 'Finishing Presser',
        challanId: 'CH-2026-901',
        articleName: 'Heavyweight Loopback Hoodie',
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
