'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// 1. LINEMAN DESK: ADVANCE STITCHING LOT TO MENDING TABLE
// ---------------------------------------------------------------------------
export async function adminAdvanceToMending(payload: {
  allotment_id: string
  mending_supervisor_id?: string
  mending_supervisor_name?: string
  handover_notes?: string
  operator_name?: string
}) {
  try {
    const {
      allotment_id,
      mending_supervisor_id,
      mending_supervisor_name,
      handover_notes,
      operator_name
    } = payload
    if (!allotment_id) return { error: 'Invalid allotment ID' }

    const stamp = operator_name ? `Admin Override (${operator_name})` : 'Plant Admin Floor Override'
    const nowIso = new Date().toISOString()

    const { error } = await supabaseAdmin
      .from('allotments')
      .update({
        status: 'COMPLETED',
        mending_status: 'PENDING_MENDING',
        mending_supervisor_id: mending_supervisor_id || null,
        mending_supervisor_name: mending_supervisor_name || 'MENDING',
        handed_to_mending_by: stamp,
        handed_to_mending_at: nowIso,
        mending_handover_notes: handover_notes || 'Advanced to Mending by Admin floor override'
      })
      .eq('id', allotment_id)

    if (error) throw error

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminAdvanceToMending:', err)
    return { error: err.message || 'Failed to advance lot to Mending' }
  }
}

// ---------------------------------------------------------------------------
// 2. MENDING DESK: VERIFY PIECE COUNT & HANDOVER TO QC
// ---------------------------------------------------------------------------
export async function adminHandoverToQc(payload: {
  allotment_id: string
  counted_qty: number
  qc_supervisor_id?: string
  qc_supervisor_name?: string
  handover_notes?: string
  operator_name?: string
}) {
  try {
    const {
      allotment_id,
      counted_qty,
      qc_supervisor_id,
      qc_supervisor_name,
      handover_notes,
      operator_name
    } = payload
    if (!allotment_id) return { error: 'Invalid allotment ID' }

    const stamp = operator_name ? `Admin Override (${operator_name})` : 'Plant Admin Floor Override'
    const nowIso = new Date().toISOString()
    const todayStr = nowIso.split('T')[0]

    // Fetch allotment metadata for foreign keys
    const { data: allot } = await supabaseAdmin
      .from('allotments')
      .select('id, article_id, lineman_id, target_qty')
      .eq('id', allotment_id)
      .single()

    const targetQty = allot?.target_qty || 0
    const variance = Number(counted_qty) - targetQty
    const varianceRemark =
      variance === 0
        ? 'Exact 100% Match (Zero Shortage)'
        : variance < 0
        ? `Shortage: ${variance} pcs from Stitching floor`
        : `Excess: +${variance} pcs`

    // 1. Insert audit record into qc_logs (Exact mobile app parity: stage = RECEIVING)
    if (allot?.article_id) {
      try {
        await supabaseAdmin.from('qc_logs').insert({
          allotment_id: allotment_id,
          article_id: allot.article_id,
          from_lineman_id: allot.lineman_id || null,
          stage: 'RECEIVING',
          qty_received: Number(counted_qty) || 0,
          qty_passed: Number(counted_qty) || 0,
          qty_rejected: 0,
          defect_type: 'NONE',
          remarks: `Mending Floor Physical Count Verified (${counted_qty} pcs). ${varianceRemark}${
            handover_notes ? ` • Note: ${handover_notes}` : ''
          } • [${stamp}]`,
          mending_status: 'COUNTING_VERIFIED',
          entry_date: todayStr
        })
      } catch (logErr) {
        console.warn('qc_logs receiving audit insertion warning:', logErr)
      }
    }

    // 2. Update allotment status to QC_PENDING with custody metadata
    const { error } = await supabaseAdmin
      .from('allotments')
      .update({
        mending_status: 'QC_PENDING',
        qc_status: 'QC_PENDING',
        mending_total_counted: Number(counted_qty) || 0,
        mending_verified_at: nowIso,
        qc_supervisor_id: qc_supervisor_id || null,
        qc_supervisor_name: qc_supervisor_name || 'CHECKING',
        handed_to_qc_by: stamp,
        handed_to_qc_at: nowIso,
        qc_handover_notes: handover_notes || 'Handed over by Plant Admin override'
      })
      .eq('id', allotment_id)

    if (error) throw error

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminHandoverToQc:', err)
    return { error: err.message || 'Failed to handover lot to QC' }
  }
}

// ---------------------------------------------------------------------------
// 3. QC DESK: APPROVE QC & PASS LOT FOR STORE GODOWN
// ---------------------------------------------------------------------------
export async function adminPassQc(payload: {
  allotment_id: string
  passed_qty: number
  alter_qty: number
  defect_notes?: string
  operator_name?: string
  operator_id?: string
}) {
  try {
    const { allotment_id, passed_qty, alter_qty, defect_notes, operator_name, operator_id } = payload
    if (!allotment_id) return { error: 'Invalid allotment ID' }

    const stamp = operator_name ? `Admin Override (${operator_name})` : 'Plant Admin (QC Override)'
    const nowIso = new Date().toISOString()
    const todayStr = nowIso.split('T')[0]

    // Fetch allotment metadata
    const { data: allot } = await supabaseAdmin
      .from('allotments')
      .select('id, article_id, lineman_id')
      .eq('id', allotment_id)
      .single()

    // 1. Insert QC inspection log into qc_logs
    if (allot?.article_id) {
      try {
        await supabaseAdmin.from('qc_logs').insert({
          allotment_id: allotment_id,
          article_id: allot.article_id,
          from_lineman_id: allot.lineman_id || null,
          stage: 'CHECKING',
          qty_received: (Number(passed_qty) || 0) + (Number(alter_qty) || 0),
          qty_passed: Number(passed_qty) || 0,
          qty_rejected: Number(alter_qty) || 0,
          defect_type: 'NONE',
          remarks: `Checked & Passed by QC Floor [${stamp}]${defect_notes ? ` • Note: ${defect_notes}` : ''}`,
          mending_status: 'NONE',
          entry_date: todayStr
        })
      } catch (logErr) {
        console.warn('qc_logs inspection insertion warning:', logErr)
      }
    }

    // 2. Mark allotment approved for store
    const updateData: any = {
      qc_status: 'APPROVED_FOR_STORE',
      store_inward_status: 'PENDING',
      qc_total_passed: Number(passed_qty) || 0,
      qc_total_alter: Number(alter_qty) || 0,
      qc_passed_at: nowIso,
      qc_supervisor_name: stamp,
      qc_handover_notes: defect_notes || 'Approved by Plant Admin QC Override'
    }

    if (operator_id || operator_name) {
      updateData.admin_approved_by = operator_id || operator_name
      updateData.admin_approved_at = nowIso
    }

    const { error } = await supabaseAdmin
      .from('allotments')
      .update(updateData)
      .eq('id', allotment_id)

    if (error) throw error

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminPassQc:', err)
    return { error: err.message || 'Failed to pass QC for lot' }
  }
}

// ---------------------------------------------------------------------------
// 4. QC DESK: SEND LOT TO LINEMAN FOR ALTERATION REPAIR
// ---------------------------------------------------------------------------
export async function adminSendToAlteration(payload: {
  allotment_id: string
  alter_qty: number
  defect_type: string
  defect_notes?: string
  operator_name?: string
}) {
  try {
    const { allotment_id, alter_qty, defect_type, defect_notes, operator_name } = payload
    if (!allotment_id) return { error: 'Invalid allotment ID' }

    const stamp = operator_name ? `Admin Override (${operator_name})` : 'Plant Admin'
    const nowIso = new Date().toISOString()
    const todayStr = nowIso.split('T')[0]

    // Fetch allotment metadata
    const { data: allot } = await supabaseAdmin
      .from('allotments')
      .select('id, article_id, lineman_id, qc_total_passed')
      .eq('id', allotment_id)
      .single()

    // 1. Insert alteration defect record into qc_logs
    // (This immediately triggers the Lineman Dashboard alert banner!)
    if (allot?.article_id) {
      try {
        await supabaseAdmin.from('qc_logs').insert({
          allotment_id: allotment_id,
          article_id: allot.article_id,
          from_lineman_id: allot.lineman_id || null,
          stage: 'CHECKING',
          qty_received: Number(alter_qty) || 0,
          qty_passed: 0,
          qty_rejected: Number(alter_qty) || 0,
          defect_type: defect_type || 'STITCHING_ALTER',
          remarks: `Flagged by QC Desk [${stamp}]: ${defect_notes || defect_type}`,
          mending_status: 'WITH_LINEMAN_FOR_REPAIR',
          entry_date: todayStr
        })
      } catch (logErr) {
        console.warn('qc_logs alteration insertion warning:', logErr)
      }
    }

    // 2. Update allotment status to notify Lineman
    const { error } = await supabaseAdmin
      .from('allotments')
      .update({
        qc_status: 'IN_QC_CHECKING',
        mending_status: 'WITH_LINEMAN_FOR_REPAIR',
        qc_total_alter: Number(alter_qty) || 0,
        qc_supervisor_name: stamp,
        qc_handover_notes: `[Defect: ${defect_type}] ${defect_notes || 'Sent for alteration by Admin'}`
      })
      .eq('id', allotment_id)

    if (error) throw error

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminSendToAlteration:', err)
    return { error: err.message || 'Failed to send lot to alteration' }
  }
}

// ---------------------------------------------------------------------------
// 5. STORE DESK: VERIFY & INWARD FINISHED GOODS TO GODOWN
// ---------------------------------------------------------------------------
export async function adminStoreInward(payload: {
  allotment_id: string
  quantity?: number
  operator_name?: string
  notes?: string
}) {
  try {
    const { allotment_id, quantity, operator_name, notes } = payload
    if (!allotment_id) return { error: 'Invalid allotment ID' }

    const stamp = operator_name ? `Admin Store Override (${operator_name})` : 'Admin Godown Inward'
    const nowIso = new Date().toISOString()
    const todayStr = nowIso.split('T')[0]

    // Fetch allotment metadata
    const { data: allot } = await supabaseAdmin
      .from('allotments')
      .select(`
        id,
        article_id,
        challan_id,
        target_qty,
        qc_total_passed,
        lineman_id,
        profiles:lineman_id ( username ),
        challans:challan_id ( challan_no )
      `)
      .eq('id', allotment_id)
      .single()

    const inwardQty = Number(quantity) || allot?.qc_total_passed || allot?.target_qty || 0
    const linemanName = (allot as any)?.profiles?.username || 'Lineman'
    const challanNo = (allot as any)?.challans?.challan_no || ''

    // 1. Insert into store_transactions
    try {
      await supabaseAdmin.from('store_transactions').insert({
        type: 'INWARD',
        quantity: inwardQty,
        party_name: 'QC Finishing Floor',
        receiver_name: stamp,
        allotment_id: allotment_id,
        article_id: allot?.article_id || null,
        challan_no: challanNo || null,
        entry_date: todayStr,
        notes: `Inwarded from QC by ${stamp} • Lineman: ${linemanName}${notes ? ` • ${notes}` : ''}`
      })
    } catch (txErr) {
      console.warn('store_transactions inward error:', txErr)
    }

    // 2. Update allotment store inward status
    const { error } = await supabaseAdmin
      .from('allotments')
      .update({
        store_inward_status: 'INWARDED',
        store_inward_at: nowIso,
        store_receiver_name: stamp
      })
      .eq('id', allotment_id)

    if (error) throw error

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/store')
    revalidatePath('/inventory')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminStoreInward:', err)
    return { error: err.message || 'Failed to inward goods to godown' }
  }
}

// ---------------------------------------------------------------------------
// 6. LINEMAN DESK: COMPLETE BUNDLE / ALL BUNDLES FOR A LOT
// ---------------------------------------------------------------------------
export async function adminCompleteLinemanBundle(payload: {
  allotment_id: string
  variant_id?: string
  completed_qty: number
  advance_to_mending?: boolean
  operator_name?: string
}) {
  try {
    const { allotment_id, variant_id, completed_qty, advance_to_mending, operator_name } = payload
    if (!allotment_id) return { error: 'Invalid allotment ID' }

    if (variant_id) {
      await supabaseAdmin
        .from('allotment_variants')
        .update({ completed_qty: Number(completed_qty) || 0 })
        .eq('id', variant_id)
    } else {
      const { data: variants } = await supabaseAdmin
        .from('allotment_variants')
        .select('id, quantity')
        .eq('allotment_id', allotment_id)

      if (variants && variants.length > 0) {
        for (const v of variants) {
          await supabaseAdmin
            .from('allotment_variants')
            .update({ completed_qty: v.quantity })
            .eq('id', v.id)
        }
      }
    }

    // Check if we should advance lot to Mending
    if (advance_to_mending) {
      await adminAdvanceToMending({
        allotment_id,
        operator_name: operator_name || 'Admin Floor Override'
      })
    }

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/production-orders')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminCompleteLinemanBundle:', err)
    return { error: err.message || 'Failed to update bundle completion' }
  }
}

// ---------------------------------------------------------------------------
// 7. LINEMAN DESK: 1-CLICK LINE REASSIGNMENT
// ---------------------------------------------------------------------------
export async function adminReassignLineman(payload: {
  allotment_id: string
  new_lineman_id: string
  new_lineman_name: string
}) {
  try {
    const { allotment_id, new_lineman_id, new_lineman_name } = payload
    if (!allotment_id || !new_lineman_id) return { error: 'Invalid parameters for reassignment' }

    const { error } = await supabaseAdmin
      .from('allotments')
      .update({
        lineman_id: new_lineman_id,
        status: 'IN_PROGRESS'
      })
      .eq('id', allotment_id)

    if (error) throw error

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/production-orders')
    return { success: true, message: `Allotment successfully reassigned to ${new_lineman_name}` }
  } catch (err: any) {
    console.error('Error in adminReassignLineman:', err)
    return { error: err.message || 'Failed to reassign allotment to new lineman' }
  }
}

// ---------------------------------------------------------------------------
// 8. STORE DESK: 1-CLICK MATERIAL / TRIMS ISSUANCE & OUTWARD
// ---------------------------------------------------------------------------
export async function adminIssueMaterial(payload: {
  material_id: string
  allotment_id: string
  operator_name?: string
}) {
  try {
    const { material_id, allotment_id, operator_name } = payload
    if (!material_id) return { error: 'Invalid material ID' }

    const stamp = operator_name || 'Admin Store Override'
    const todayStr = new Date().toISOString().split('T')[0]

    // Fetch material details
    const { data: mat } = await supabaseAdmin
      .from('allotment_materials')
      .select('id, item_name, required_qty')
      .eq('id', material_id)
      .single()

    const { error } = await supabaseAdmin
      .from('allotment_materials')
      .update({
        admin_issued: true,
        notes: JSON.stringify({
          store_verified: true,
          store_verified_at: new Date().toISOString(),
          issued_by: stamp,
          status: 'ISSUED'
        })
      })
      .eq('id', material_id)

    if (error) throw error

    // Log OUT in accessories table so Godown inventory is reduced
    if (mat?.item_name) {
      try {
        await supabaseAdmin.from('accessories').insert({
          item_name: mat.item_name,
          action: 'OUT',
          quantity: Number(mat.required_qty) || 1,
          party_name: `Issued to Line by ${stamp}`,
          entry_date: todayStr,
          notes: `BOM Handover for Allotment #${allotment_id}`
        })
      } catch (accErr) {
        console.warn('accessories OUT logging warning:', accErr)
      }
    }

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/store')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminIssueMaterial:', err)
    return { error: err.message || 'Failed to issue raw material' }
  }
}

// ---------------------------------------------------------------------------
// 9. DISPATCH DESK: MARK DISPATCHED & LOG GATE PASS
// ---------------------------------------------------------------------------
export async function adminDispatchAllotment(payload: {
  allotment_id: string
  challan_no?: string
  gate_pass_no?: string
  bags_packed?: number
  operator_name?: string
}) {
  try {
    const { allotment_id, challan_no, gate_pass_no, bags_packed, operator_name } = payload
    if (!allotment_id) return { error: 'Invalid allotment ID' }

    const stamp = operator_name || 'Admin Dispatch Gate'
    const nowIso = new Date().toISOString()
    const todayStr = nowIso.split('T')[0]

    // Fetch allotment metadata
    const { data: allot } = await supabaseAdmin
      .from('allotments')
      .select('id, article_id, target_qty, qc_total_passed')
      .eq('id', allotment_id)
      .single()

    const dispatchQty = allot?.qc_total_passed || allot?.target_qty || 0

    // 1. Log OUTWARD in store_transactions
    try {
      await supabaseAdmin.from('store_transactions').insert({
        type: 'OUTWARD',
        quantity: dispatchQty,
        party_name: 'Buyer Delivery Dispatch',
        receiver_name: stamp,
        allotment_id: allotment_id,
        article_id: allot?.article_id || null,
        challan_no: challan_no || null,
        entry_date: todayStr,
        notes: `Dispatched by ${stamp} • Gate Pass: ${gate_pass_no || 'Standard'}`
      })
    } catch (txErr) {
      console.warn('store_transactions outward error:', txErr)
    }

    // 2. Mark allotment dispatched
    const { error } = await supabaseAdmin
      .from('allotments')
      .update({
        status: 'DISPATCHED',
        total_bags_packed: Number(bags_packed) || 1,
        store_inward_status: 'DISPATCHED',
        store_inward_at: nowIso,
        store_receiver_name: stamp
      })
      .eq('id', allotment_id)

    if (error) throw error

    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/production-orders')
    return { success: true }
  } catch (err: any) {
    console.error('Error in adminDispatchAllotment:', err)
    return { error: err.message || 'Failed to dispatch allotment' }
  }
}
