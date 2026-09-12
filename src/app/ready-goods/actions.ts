'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  ReadyGoodsCarton,
  AqlAudit,
  CartonStatus,
  AqlAuditDecision
} from './types/readyGoods'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// -----------------------------------------------------------------------------
// 1. FETCH READY GOODS DASHBOARD DATA
// -----------------------------------------------------------------------------

export async function fetchReadyGoodsDashboardDataAction(): Promise<{
  cartons: ReadyGoodsCarton[]
  aqlAudits: AqlAudit[]
}> {
  try {
    const [cartonsRes, aqlRes] = await Promise.all([
      supabaseAdmin.from('ready_goods_cartons').select('*, order:merchandising_orders(po_number, brand_buyer, style_name), bundles:ready_goods_carton_bundles(bundle_id, pieces_from_bundle)').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('ready_goods_aql_audits').select('*, carton:ready_goods_cartons(carton_barcode, order_id)').order('created_at', { ascending: false }).limit(50)
    ])

    const cartons: ReadyGoodsCarton[] = (cartonsRes.data || []).map((c: any) => {
      const gross = Number(c.gross_weight_kg) || 12.5
      const expected = 12.4
      const bundles = (c.bundles || []).map((b: any) => b.bundle_id?.slice(0, 8) || 'BDL')

      return {
        id: c.id,
        cartonNumber: c.carton_barcode || `CTN-${c.id?.slice(0, 5)}`,
        orderId: c.order_id,
        orderNumber: c.order?.po_number || 'PO-7714',
        buyer: c.order?.brand_buyer || 'Urban Outfitters',
        styleName: c.order?.style_name || 'French Terry Hoodie',
        color: 'Vintage Charcoal',
        totalPieces: c.total_pieces || 0,
        sizeBreakdown: { M: Math.floor((c.total_pieces || 0) / 2), L: Math.ceil((c.total_pieces || 0) / 2) },
        packedBundleIds: bundles.length > 0 ? bundles : ['BDL-7714-01'],
        measuredGrossWeightKg: gross,
        expectedGrossWeightKg: expected,
        weightVarianceKg: Number((gross - expected).toFixed(2)),
        status: (c.status as CartonStatus) || 'PACKED',
        godownBay: 'BAY_3',
        dimensionsCm: `${c.length_cm || 60}x${c.width_cm || 40}x${c.height_cm || 30}`,
        cbmVolume: Number(c.cbm) || 0.072,
        sealedBy: 'Pack Supervisor',
        createdAt: c.created_at || new Date().toISOString(),
        updatedAt: c.updated_at
      }
    })

    const aqlAudits: AqlAudit[] = (aqlRes.data || []).map((a: any) => {
      const isPass = a.verdict === 'PASS'
      return {
        id: a.id,
        auditNumber: `AQL-${a.id?.slice(0, 6)}`,
        orderId: a.carton?.order_id || 'PO-7714',
        orderNumber: 'PO-7714',
        cartonId: a.carton_id,
        cartonNumber: a.carton?.carton_barcode || 'CTN-001',
        inspectorId: a.inspector_id || 'INSP-01',
        inspectorName: 'Quality Lead Auditor',
        lotSizePieces: 1200,
        sampleSizeAudited: a.sample_size || 80,
        criticalDefects: a.critical_defects || 0,
        majorDefects: a.major_defects || 0,
        minorDefects: a.minor_defects || 0,
        auditDecision: (isPass ? 'PASS' : 'REJECT_QUARANTINE') as AqlAuditDecision,
        defects: [],
        remarks: a.audit_notes || 'ISO 2859-1 Level II Audit Completed',
        auditDate: a.created_at ? a.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }
    })

    return { cartons, aqlAudits }
  } catch (error) {
    console.error('fetchReadyGoodsDashboardDataAction error:', error)
    return { cartons: [], aqlAudits: [] }
  }
}

// -----------------------------------------------------------------------------
// 2. MUTATION ACTIONS
// -----------------------------------------------------------------------------

export async function packCartonAction(payload: {
  carton_barcode: string
  order_id?: string
  carton_sequence_num?: number
  packing_type?: string
  total_pieces: number
  gross_weight_kg: number
  length_cm?: number
  width_cm?: number
  height_cm?: number
  pack_operator_id?: string
  bundle_allocations?: Array<{ bundle_id: string; pieces: number }>
}) {
  try {
    const { data: carton, error: cErr } = await supabaseAdmin
      .from('ready_goods_cartons')
      .insert({
        carton_barcode: payload.carton_barcode,
        order_id: payload.order_id || null,
        carton_sequence_num: payload.carton_sequence_num || 1,
        packing_type: payload.packing_type || 'SOLID_SIZE_SOLID_COLOR',
        total_pieces: payload.total_pieces,
        gross_weight_kg: payload.gross_weight_kg,
        length_cm: payload.length_cm || 60.0,
        width_cm: payload.width_cm || 40.0,
        height_cm: payload.height_cm || 30.0,
        pack_operator_id: payload.pack_operator_id || null,
        status: 'PACKED'
      })
      .select()
      .single()

    if (cErr) throw cErr

    if (payload.bundle_allocations && payload.bundle_allocations.length > 0) {
      for (const alloc of payload.bundle_allocations) {
        await supabaseAdmin
          .from('ready_goods_carton_bundles')
          .insert({
            carton_id: carton.id,
            bundle_id: alloc.bundle_id,
            pieces_from_bundle: alloc.pieces
          })
      }
    }

    revalidatePath('/ready-goods')
    return { success: true, cartonId: carton.id }
  } catch (error: any) {
    console.error('packCartonAction error:', error)
    return { success: false, error: error.message }
  }
}

export async function recordAqlAuditAction(payload: {
  carton_id: string
  inspector_id?: string
  sample_size: number
  critical_defects: number
  major_defects: number
  minor_defects: number
  verdict: 'PASS' | 'FAIL'
  audit_notes?: string
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('ready_goods_aql_audits')
      .insert({
        carton_id: payload.carton_id,
        inspector_id: payload.inspector_id || null,
        sample_size: payload.sample_size,
        critical_defects: payload.critical_defects,
        major_defects: payload.major_defects,
        minor_defects: payload.minor_defects,
        verdict: payload.verdict,
        audit_notes: payload.audit_notes || null
      })
      .select()
      .single()

    if (error) throw error

    // Explicit fallback in case the database trigger hasn't fired
    await supabaseAdmin
      .from('ready_goods_cartons')
      .update({
        status: payload.verdict === 'PASS' ? 'AQL_AUDIT_PASSED' : 'QUARANTINED_AQL_FAILED',
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.carton_id)

    revalidatePath('/ready-goods')
    return { success: true, auditId: data.id }
  } catch (error: any) {
    console.error('recordAqlAuditAction error:', error)
    return { success: false, error: error.message }
  }
}
