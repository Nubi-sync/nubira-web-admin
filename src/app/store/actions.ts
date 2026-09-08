'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// ----------------------------------------------------
// 1. CREATE ACCESSORY CHALLAN INWARD (TRUCK INWARD / GRN)
// ----------------------------------------------------
export type TruckInwardItemInput = {
  item_name: string
  quantity: number
  unit: string
  size_label?: string
  status: 'RECEIVED' | 'SHORTAGE' | 'DUE' | 'DEFECTIVE'
  shortage_qty?: number
  remarks?: string
}

export type CreateTruckInwardPayload = {
  party_name: string
  article_no?: string
  challan_no?: string
  truck_no?: string
  inward_date: string
  challan_photo_url?: string | null
  notes?: string
  items: TruckInwardItemInput[]
}

export async function createTruckInwardGrn(payload: CreateTruckInwardPayload) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Store Supervisor'
    const currentUserId = user?.id

    if (!payload.party_name?.trim()) {
      return { error: 'Please enter Supplier / Brand Name.' }
    }
    if (!payload.items || payload.items.length === 0) {
      return { error: 'Please add at least 1 item from the challan.' }
    }

    const dueCount = payload.items.filter(i => i.status === 'DUE').length
    const shortageCount = payload.items.filter(i => i.status === 'SHORTAGE').length
    const overallStatus = dueCount > 0 ? 'DUE_PENDING' : shortageCount > 0 ? 'SHORTAGE' : 'VERIFIED'
    const grnNo = `GRN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    // Map line items JSON
    const lineItemsJson = payload.items.map(i => ({
      item_name: i.item_name.trim(),
      size_color: i.size_label?.trim() || '',
      challan_qty: i.quantity,
      unit: i.unit || 'pcs',
      status: i.status,
      shortage_qty: i.shortage_qty || 0,
      remarks: i.remarks?.trim() || ''
    }))

    // 1. Insert into truck_inwards
    const { data: insertedInward, error: inwardError } = await supabase
      .from('truck_inwards')
      .insert({
        grn_no: grnNo,
        party_name: payload.party_name.trim(),
        article_no: payload.article_no?.trim() || null,
        challan_no: payload.challan_no?.trim() || null,
        truck_no: payload.truck_no?.trim() || null,
        inward_date: payload.inward_date || new Date().toISOString().split('T')[0],
        total_items: payload.items.length,
        due_items_count: dueCount,
        shortage_items_count: shortageCount,
        status: overallStatus,
        challan_photo_url: payload.challan_photo_url || null,
        line_items: lineItemsJson,
        notes: payload.notes?.trim() || null,
        receiver_name: currentUserName,
        received_by: currentUserId,
      })
      .select('id, grn_no')
      .single()

    if (inwardError) {
      console.error('Error inserting truck inward:', inwardError)
      return { error: inwardError.message }
    }

    const truckInwardId = insertedInward.id

    // 2. Insert child items into truck_inward_items
    const childItemRows = payload.items.map(it => ({
      truck_inward_id: truckInwardId,
      item_name: it.item_name.trim(),
      quantity: it.quantity,
      challan_qty: it.quantity,
      unit: it.unit || 'pcs',
      size_label: it.size_label?.trim() || null,
      size_color: it.size_label?.trim() || null,
      status: it.status,
      shortage_qty: it.shortage_qty || 0,
      remarks: it.remarks?.trim() || null
    }))

    const { error: itemsError } = await supabase.from('truck_inward_items').insert(childItemRows)
    if (itemsError) {
      console.warn('Warning inserting truck_inward_items:', itemsError)
    }

    // 3. Log inward rows in accessories table so godown stock is instantly credited
    const accessoryRows = payload.items
      .filter(it => it.status !== 'DUE' && it.quantity > 0)
      .map(it => {
        const sizeSuffix = it.size_label?.trim() ? ` (${it.size_label.trim()})` : ''
        return {
          item_name: it.item_name.trim() + sizeSuffix,
          action: 'IN',
          quantity: it.quantity,
          unit: it.unit || 'pcs',
          party_name: payload.party_name.trim(),
          entry_date: payload.inward_date || new Date().toISOString().split('T')[0],
          notes: `Challan #${payload.challan_no?.trim() || '-'} • Art ${payload.article_no?.trim() || '-'} • ${grnNo}`,
        }
      })

    if (accessoryRows.length > 0) {
      await supabase.from('accessories').insert(accessoryRows)
    }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true, grn_no: grnNo }
  } catch (err: any) {
    console.error('Exception in createTruckInwardGrn:', err)
    return { error: err?.message || 'Failed to save inward GRN' }
  }
}

// ----------------------------------------------------
// 2. ISSUE BOM MATERIALS / LINEMAN HANDOVER
// ----------------------------------------------------
export type BomMaterialItemState = {
  id: string
  item_name: string
  unit?: string
  required_qty: string | number
  received_qty: string | number
  status: 'VERIFIED' | 'SHORTAGE' | 'DEFECTIVE'
  shortage_qty?: string | number
  remarks?: string
}

export type IssueBomMaterialsPayload = {
  allotment_id: string
  lineman_name: string
  supplier_challan_no?: string
  article_no?: string
  items: BomMaterialItemState[]
}

export async function issueBomMaterials(payload: IssueBomMaterialsPayload) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Store Supervisor'
    const nowIso = new Date().toISOString()
    const todayStr = nowIso.split('T')[0]

    for (const item of payload.items) {
      // 1. Fetch existing notes to preserve context
      let existingNotes: Record<string, any> = {}
      const { data: matData } = await supabase
        .from('allotment_materials')
        .select('notes, required_qty')
        .eq('id', item.id)
        .single()

      if (matData?.notes) {
        try {
          existingNotes = typeof matData.notes === 'string' ? JSON.parse(matData.notes) : matData.notes
        } catch (_) {}
      }

      const receivedText = String(item.received_qty ?? item.required_qty ?? '')
      existingNotes.lineman_name = payload.lineman_name
      existingNotes.received_qty = receivedText
      existingNotes.status = item.status
      existingNotes.shortage_qty = item.shortage_qty || null
      existingNotes.supplier_challan_no = payload.supplier_challan_no || null
      existingNotes.store_verified = true
      existingNotes.store_verified_at = nowIso
      existingNotes.store_verified_by = currentUserName
      existingNotes.store_remarks = item.remarks || null

      await supabase
        .from('allotment_materials')
        .update({
          admin_issued: true,
          notes: JSON.stringify(existingNotes),
        })
        .eq('id', item.id)

      // 2. Log OUTWARD in accessories table so Godown stock is reduced in real-time
      const parsedQty = parseInt(String(receivedText).replace(/[^0-9]/g, ''), 10) || 0
      if (parsedQty > 0 && item.item_name?.trim()) {
        try {
          await supabase.from('accessories').insert({
            item_name: item.item_name.trim(),
            action: 'OUT',
            quantity: parsedQty,
            unit: item.unit || 'pcs',
            party_name: `Issued to Lineman ${payload.lineman_name}`,
            entry_date: todayStr,
            notes: `BOM Handover for Allotment #${payload.allotment_id} • ${payload.supplier_challan_no ? `Challan #${payload.supplier_challan_no}` : 'Active Batch'}${payload.article_no ? ` • Art #${payload.article_no}` : ''}`,
          })
        } catch (_) {}
      }
    }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/allotments')
    revalidatePath('/production-orders')
    return { success: true }
  } catch (err: any) {
    console.error('Exception in issueBomMaterials:', err)
    return { error: err?.message || 'Failed to issue BOM materials' }
  }
}

// ----------------------------------------------------
// 3. PRODUCTION INWARD (RECEIVE FINISHED GARMENTS)
// ----------------------------------------------------
export type ProductionInwardPayload = {
  article_id: string
  allotment_id?: string | null
  from_party?: string
  lineman_name?: string | null
  mending_name?: string | null
  qc_supervisor_name?: string | null
  challan_no?: string | null
  notes?: string | null
  variants: Array<{
    color: string
    size: string
    quantity: number
  }>
}

export async function saveProductionInward(payload: ProductionInwardPayload) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Store Supervisor'
    const todayStr = new Date().toISOString().split('T')[0]

    const validVariants = payload.variants.filter(v => v.quantity > 0)
    if (validVariants.length === 0) {
      return { error: 'Please enter a receiving quantity greater than 0.' }
    }

    const rowsToInsert = validVariants.map(v => ({
      article_id: payload.article_id,
      type: 'INWARD',
      quantity: v.quantity,
      color: v.color || 'Standard',
      size: v.size || 'Free',
      party_name: payload.from_party?.trim() || 'QC Finishing Floor',
      lineman_name: payload.lineman_name || null,
      mending_name: payload.mending_name || null,
      qc_supervisor_name: payload.qc_supervisor_name || null,
      receiver_name: currentUserName,
      challan_no: payload.challan_no || null,
      allotment_id: payload.allotment_id || null,
      notes: payload.notes?.trim() || null,
      entry_date: todayStr,
    }))

    const { error: insertError } = await supabase.from('store_transactions').insert(rowsToInsert)
    if (insertError) {
      console.error('Error inserting production inward:', insertError)
      return { error: insertError.message }
    }

    // Mark allotment store inward complete if linked
    if (payload.allotment_id) {
      try {
        await supabase
          .from('allotments')
          .update({
            store_inward_status: 'INWARDED',
            store_inward_at: new Date().toISOString(),
            store_receiver_name: currentUserName,
          })
          .eq('id', payload.allotment_id)
      } catch (err) {
        console.warn('Warning updating allotment store inward status:', err)
      }
    }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true, totalPcs: validVariants.reduce((a, b) => a + b.quantity, 0) }
  } catch (err: any) {
    console.error('Exception in saveProductionInward:', err)
    return { error: err?.message || 'Failed to save production inward' }
  }
}

// ----------------------------------------------------
// 4. FINISHED GOODS OUTWARD (DISPATCH GOODS)
// ----------------------------------------------------
export type FinishedGoodsOutwardPayload = {
  article_id: string
  party_name: string
  challan_no?: string | null
  transport_no?: string | null
  notes?: string | null
  variants: Array<{
    color: string
    size: string
    quantity: number
  }>
}

export async function saveFinishedGoodsOutward(payload: FinishedGoodsOutwardPayload) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Store Supervisor'
    const todayStr = new Date().toISOString().split('T')[0]

    const validVariants = payload.variants.filter(v => v.quantity > 0)
    if (validVariants.length === 0) {
      return { error: 'Please enter a dispatch quantity greater than 0.' }
    }

    const rowsToInsert = validVariants.map(v => ({
      article_id: payload.article_id,
      type: 'OUTWARD',
      quantity: v.quantity,
      color: v.color || 'Standard',
      size: v.size || 'Free',
      party_name: payload.party_name.trim() || 'General Dispatch',
      receiver_name: currentUserName,
      challan_no: payload.challan_no?.trim() || null,
      transport_no: payload.transport_no?.trim() || null,
      notes: payload.notes?.trim() || null,
      entry_date: todayStr,
    }))

    const { error: insertError } = await supabase.from('store_transactions').insert(rowsToInsert)
    if (insertError) {
      console.error('Error inserting outward dispatch:', insertError)
      return { error: insertError.message }
    }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dispatch')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true, totalPcs: validVariants.reduce((a, b) => a + b.quantity, 0) }
  } catch (err: any) {
    console.error('Exception in saveFinishedGoodsOutward:', err)
    return { error: err?.message || 'Failed to save outward dispatch' }
  }
}

// ----------------------------------------------------
// 5. APPROVAL & DELETIONS
// ----------------------------------------------------
export async function approveQcForStoreInward(allotmentId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = user?.email || 'Admin'

    const { error } = await supabase
      .from('allotments')
      .update({
        qc_status: 'APPROVED_FOR_STORE',
        admin_approved_at: new Date().toISOString(),
        admin_approved_by: adminEmail,
      })
      .eq('id', allotmentId)

    if (error) return { error: error.message }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dispatch')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to approve lot for store' }
  }
}

export async function deleteTruckInward(truckInwardId: string) {
  try {
    const supabase = supabaseAdmin
    await supabase.from('truck_inward_items').delete().eq('truck_inward_id', truckInwardId)
    const { error } = await supabase.from('truck_inwards').delete().eq('id', truckInwardId)
    if (error) return { error: error.message }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete GRN record' }
  }
}

export async function deleteStoreTransaction(transactionId: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase.from('store_transactions').delete().eq('id', transactionId)
    if (error) return { error: error.message }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete transaction' }
  }
}

export async function deleteAccessory(accessoryId: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase.from('accessories').delete().eq('id', accessoryId)
    if (error) return { error: error.message }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete accessory' }
  }
}

export async function deleteAccessoryByName(itemName: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase.from('accessories').delete().eq('item_name', itemName)
    if (error) return { error: error.message }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete accessory items' }
  }
}
