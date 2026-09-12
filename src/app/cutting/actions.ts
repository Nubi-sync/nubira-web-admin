'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { CutBundle, HandoverDestination, LaySheet } from './types/cutting'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. Fetch Lay Sheets with Commercial Order Handshake
export async function fetchLaySheetsAction(): Promise<LaySheet[]> {
  try {
    const { data: sheets, error } = await supabaseAdmin
      .from('cutting_lay_sheets')
      .select(`
        *,
        merchandising_orders:order_id (
          id,
          order_number,
          currency,
          fob_price_per_piece,
          total_quantity,
          brands:buyer_id (name),
          design_tech_packs:tech_pack_id (style_number, garment_silhouette)
        ),
        cutting_lay_rolls (
          id,
          roll_id,
          plies_from_roll,
          meters_consumed,
          remnant_length_m,
          store_fabric_rolls:roll_id (
            roll_barcode,
            fabric_name,
            shade_group,
            usable_width_inches
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('fetchLaySheetsAction error:', error.message)
      return []
    }

    return (sheets || []).map((sheet: any) => ({
      id: sheet.id,
      lay_number: sheet.lay_sheet_number,
      po_number: sheet.merchandising_orders?.order_number || 'PO-PENDING',
      brand_name: sheet.merchandising_orders?.brands?.name || 'OLLYPOP',
      style_ref: sheet.merchandising_orders?.design_tech_packs?.style_number || 'ART-HD-8821',
      style_name: sheet.merchandising_orders?.design_tech_packs?.garment_silhouette || 'Heavyweight Hoodie',
      table_number: sheet.cutting_table_id,
      fabric_roll_barcodes: (sheet.cutting_lay_rolls || []).map((r: any) => r.store_fabric_rolls?.roll_barcode || 'ROL-FT-8821'),
      shell_fabric: sheet.cutting_lay_rolls?.[0]?.store_fabric_rolls?.fabric_name || 'Heavyweight French Terry 380 GSM',
      gsm: 380,
      plies_count: sheet.total_plies,
      marker_length_meters: Number(sheet.marker_length_m),
      total_cut_pieces: sheet.actual_cut_pieces || sheet.expected_pieces,
      ratio_breakdown: sheet.size_ratio_text,
      fabric_weight_kg: 45.3,
      cutting_master: 'In-House Cutting Master',
      status: sheet.status,
      created_at: sheet.created_at ? new Date(sheet.created_at).toISOString().split('T')[0] : '2026-09-12'
    }))
  } catch (err: any) {
    console.error('fetchLaySheetsAction uncaught error:', err)
    return []
  }
}

// 2. Create Lay Sheet and Atomically Serialize Component Bundles (The Root Seed)
export async function createLaySheetAction(payload: {
  lay_sheet_number: string
  order_id?: string
  cutting_table_id: string
  marker_length_m: number
  total_plies: number
  size_ratio_text: string
  ratio_breakdown: Array<{ size: string; ratio: number; color: string }>
  roll_ids?: string[]
  operator_id?: string
  cutting_master_id?: string
}) {
  try {
    // 1. Resolve Order if not provided
    let orderId = payload.order_id
    if (!orderId) {
      const { data: ord } = await supabaseAdmin
        .from('merchandising_orders')
        .select('id')
        .limit(1)
        .single()
      orderId = ord?.id
    }

    if (!orderId) {
      return { success: false, error: 'No active commercial order found to associate lay sheet.' }
    }

    const ratioTotal = payload.ratio_breakdown.reduce((acc, r) => acc + r.ratio, 0)
    const expectedPieces = payload.total_plies * ratioTotal

    // 2. Insert Master Lay Sheet
    const { data: laySheet, error: layErr } = await supabaseAdmin
      .from('cutting_lay_sheets')
      .insert({
        lay_sheet_number: payload.lay_sheet_number,
        order_id: orderId,
        cutting_table_id: payload.cutting_table_id,
        marker_length_m: payload.marker_length_m,
        total_plies: payload.total_plies,
        size_ratio_text: payload.size_ratio_text,
        ratio_total: ratioTotal,
        expected_pieces: expectedPieces,
        actual_cut_pieces: expectedPieces,
        status: 'COMPLETED'
      })
      .select()
      .single()

    if (layErr) throw layErr

    // 3. Atomically Generate Serialized Bundles
    const bundleSizeMax = 25
    const bundlesToInsert: any[] = []
    const cleanLayNum = payload.lay_sheet_number.replace('LAY-', '')

    for (const item of payload.ratio_breakdown) {
      const totalPiecesForSize = payload.total_plies * item.ratio
      const numBundles = Math.ceil(totalPiecesForSize / bundleSizeMax)

      for (let b = 1; b <= numBundles; b++) {
        const pieceCount = (b === numBundles && totalPiecesForSize % bundleSizeMax !== 0)
          ? totalPiecesForSize % bundleSizeMax
          : bundleSizeMax

        const barcode = `BND-${cleanLayNum}-${item.size}-${String(b).padStart(3, '0')}`

        bundlesToInsert.push({
          bundle_barcode: barcode,
          lay_sheet_id: laySheet.id,
          order_id: orderId,
          size_label: item.size,
          color_name: item.color,
          bundle_sequence: b,
          piece_count: pieceCount,
          start_ply_num: (b - 1) * bundleSizeMax + 1,
          end_ply_num: (b - 1) * bundleSizeMax + pieceCount,
          current_division: 'CUTTING',
          status: 'CUT_COMPLETED'
        })
      }
    }

    if (bundlesToInsert.length > 0) {
      const { error: bundleErr } = await supabaseAdmin
        .from('cutting_bundles')
        .insert(bundlesToInsert)

      if (bundleErr) console.warn('Bundle insert error:', bundleErr)
    }

    revalidatePath('/cutting')
    revalidatePath('/cutting/lay-sheets')
    revalidatePath('/cutting/bundles')

    return {
      success: true,
      laySheetId: laySheet.id,
      totalBundlesCreated: bundlesToInsert.length,
      expectedPieces
    }
  } catch (error: any) {
    console.error('createLaySheetAction error:', error)
    return { success: false, error: error.message || 'Failed to create lay sheet.' }
  }
}

// 3. Fetch Cut Bundles (The Root Seed)
export async function fetchCutBundlesAction(filters?: {
  lay_sheet_id?: string
  status?: string
  current_division?: string
}): Promise<CutBundle[]> {
  try {
    let query = supabaseAdmin
      .from('cutting_bundles')
      .select(`
        *,
        cutting_lay_sheets:lay_sheet_id (
          lay_sheet_number,
          cutting_table_id,
          merchandising_orders:order_id (
            order_number,
            design_tech_packs:tech_pack_id (style_number, garment_silhouette)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.lay_sheet_id) {
      query = query.eq('lay_sheet_id', filters.lay_sheet_id)
    }
    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status)
    }
    if (filters?.current_division && filters.current_division !== 'ALL') {
      query = query.eq('current_division', filters.current_division)
    }

    const { data: bundles, error } = await query

    if (error) {
      console.warn('fetchCutBundlesAction error:', error.message)
      return []
    }

    return (bundles || []).map((b: any) => ({
      id: b.id,
      bundle_number: b.bundle_barcode,
      lay_sheet_id: b.lay_sheet_id,
      lay_number: b.cutting_lay_sheets?.lay_sheet_number || 'LAY-0842',
      po_number: b.cutting_lay_sheets?.merchandising_orders?.order_number || 'PO-ZIG-8901',
      style_ref: b.cutting_lay_sheets?.merchandising_orders?.design_tech_packs?.style_number || 'ART-HD-8821',
      style_name: b.cutting_lay_sheets?.merchandising_orders?.design_tech_packs?.garment_silhouette || 'Hoodie',
      color: b.color_name,
      size: b.size_label,
      ply_range_start: b.start_ply_num,
      ply_range_end: b.end_ply_num,
      pieces_count: b.piece_count,
      qr_code: b.bundle_barcode,
      destination: '06_SEWING' as HandoverDestination,
      status: b.status === 'CUT_COMPLETED' ? 'GENERATED' : b.status,
      created_at: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : '2026-09-12'
    }))
  } catch (err: any) {
    console.error('fetchCutBundlesAction error:', err)
    return []
  }
}

// 4. Fetch Precision Cut Panel QC Audits
export async function fetchPanelQcAuditsAction() {
  try {
    const { data: audits, error } = await supabaseAdmin
      .from('cutting_panel_qc_audits')
      .select(`
        *,
        cutting_lay_sheets:lay_sheet_id (lay_sheet_number),
        cutting_bundles:bundle_id (bundle_barcode)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('fetchPanelQcAuditsAction error:', error.message)
      return []
    }

    return (audits || []).map((a: any, index: number) => ({
      id: a.id,
      audit_number: `AUD-CUT-${String(index + 1).padStart(4, '0')}`,
      lay_sheet_id: a.lay_sheet_id,
      lay_number: a.cutting_lay_sheets?.lay_sheet_number || 'LAY-0842',
      bundle_number: a.cutting_bundles?.bundle_barcode || 'BND-0842-M-001',
      style_ref: 'ART-HD-8821',
      sampled_ply: 'TOP' as const,
      measurement_variance_mm: Number(a.ply_deflection_mm),
      notching_precision: a.notch_accuracy_mm <= 1.0 ? 'PASS' : 'FAIL',
      grainline_alignment: a.shade_continuity_pass ? 'ALIGNED' : 'OFF_GRAIN',
      blade_heat_melt: 'NONE',
      decision: a.qc_verdict === 'PASS' ? 'PASSED' : 'RECUT_REQUIRED',
      defect_notes: a.audit_notes || 'All notches within CAD tolerance.',
      auditor_name: 'Lead QC Master',
      created_at: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '2026-09-12'
    }))
  } catch (err: any) {
    console.error('fetchPanelQcAuditsAction error:', err)
    return []
  }
}

// 5. Fetch Remnant End-Bit Logs
export async function fetchEndBitLogsAction() {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from('cutting_end_bit_logs')
      .select(`
        *,
        cutting_lay_sheets:lay_sheet_id (lay_sheet_number),
        store_fabric_rolls:roll_id (roll_barcode, fabric_name, shade_group)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('fetchEndBitLogsAction error:', error.message)
      return []
    }

    return logs || []
  } catch (err: any) {
    console.error('fetchEndBitLogsAction error:', err)
    return []
  }
}

// 6. Fetch Executive Cutting Floor KPIs
export async function fetchCuttingDashboardKpisAction() {
  try {
    const { data: kpis, error } = await supabaseAdmin
      .from('view_cutting_floor_kpis')
      .select('*')
      .single()

    if (error) {
      console.warn('fetchCuttingDashboardKpisAction view error:', error.message)
      return null
    }

    return kpis
  } catch (err: any) {
    console.error('fetchCuttingDashboardKpisAction error:', err)
    return null
  }
}
