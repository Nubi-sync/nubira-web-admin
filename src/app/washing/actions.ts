'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
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

export async function fetchWashingDashboardDataAction(): Promise<{
  batches: WashBatch[]
  recipes: WashRecipe[]
  shrinkageQc: ShrinkageQcRecord[]
}> {
  try {
    const [batchesRes, recipesRes, shrinkageRes] = await Promise.all([
      supabaseAdmin.from('washing_batches').select('*, order:merchandising_orders(po_number, style_name), recipe:washing_recipes(recipe_code, wash_type)').order('started_at', { ascending: false }).limit(50),
      supabaseAdmin.from('washing_recipes').select('*').order('recipe_code', { ascending: true }),
      supabaseAdmin.from('washing_shrinkage_alerts').select('*, batch:washing_batches(batch_number)').order('created_at', { ascending: false }).limit(50)
    ])

    const batches: WashBatch[] = (batchesRes.data || []).map((b: any) => ({
      id: b.id,
      batchNumber: b.batch_number || `WB-${b.id?.slice(0, 5)}`,
      challanId: b.order?.po_number || 'CH-2026-901',
      articleName: b.order?.style_name || 'Heavyweight French Terry Hoodie',
      color: 'Vintage Charcoal',
      totalPieces: b.total_garments || 0,
      washerMachineId: b.machine_id || 'Washer 01',
      operatorName: 'Floor Operator',
      recipeName: b.recipe?.wash_type || 'Bio-Enzyme Wash 55°C',
      dryWeightKg: Number(b.dry_input_weight_kg) || 480,
      waterVolumeLiters: (Number(b.dry_input_weight_kg) || 480) * 5,
      tumblerTempC: 65,
      cycleDurationMinutes: 45,
      measuredShrinkageLengthPct: 1.1,
      measuredShrinkageWidthPct: 0.9,
      colorfastnessRating: 4.5,
      status: (b.status as WashBatchStatus) || 'WASHING',
      startedAt: b.started_at || new Date().toISOString()
    }))

    const recipes: WashRecipe[] = (recipesRes.data || []).map((r: any) => ({
      id: r.id,
      recipeCode: r.recipe_code,
      recipeName: `${r.wash_type} (${r.liquor_ratio || '1:10'})`,
      category: 'BIO_POLISH',
      enzymeType: 'Neutral Cellulase Enzyme',
      enzymeDoseGpl: 1.5,
      aceticAcidGpl: 0.8,
      softenerGpl: 2.0,
      temperatureC: r.wash_temperature_c || 55,
      cycleMinutes: r.cycle_time_minutes || 45,
      phTarget: String(r.ph_target || '5.5'),
      liquorRatio: r.liquor_ratio || '1:10',
      targetHandFeel: 'Peach Finish / Ultra-Soft',
      approvedBy: 'Lab Chemist',
      status: 'ACTIVE'
    }))

    const shrinkageQc: ShrinkageQcRecord[] = (shrinkageRes.data || []).map((s: any) => {
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
