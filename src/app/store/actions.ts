'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { CacheManager } from '@/lib/cache/cache-manager'
import { resolveUserTenant } from '@/lib/tenant-context'

// ----------------------------------------------------
// 1. CREATE ACCESSORY CHALLAN INWARD (TRUCK INWARD / GRN)
// ----------------------------------------------------
export type TruckInwardItemInput = {
  item_name: string
  quantity: number
  challan_qty?: number
  unit: string
  size_label?: string
  status: 'RECEIVED' | 'SHORTAGE' | 'DUE' | 'DEFECTIVE'
  shortage_qty?: number
  remarks?: string
}

export type CreateTruckInwardPayload = {
  party_name: string
  article_no?: string | null
  garment_type?: string | null
  challan_no?: string | null
  truck_no?: string | null
  inward_date: string
  challan_photo_url?: string | null
  notes?: string | null
  items: TruckInwardItemInput[]
}

export async function createTruckInwardGrn(payload: CreateTruckInwardPayload) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const tenant = user ? await resolveUserTenant(user) : null
    const companyName = tenant?.companyName || 'Nubira Creation'
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
    const defectiveCount = payload.items.filter(i => i.status === 'DEFECTIVE').length
    const overallStatus = dueCount > 0 ? 'DUE_PENDING' : shortageCount > 0 ? 'SHORTAGE' : defectiveCount > 0 ? 'DEFECTIVE' : 'VERIFIED'
    const grnNo = `GRN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    // Map line items JSON
    const lineItemsJson = payload.items.map(i => {
      const cQty = i.challan_qty ?? (i.quantity + (i.shortage_qty || 0))
      return {
        item_name: i.item_name.trim(),
        size_color: i.size_label?.trim() || '',
        challan_qty: cQty,
        received_qty: i.quantity,
        unit: i.unit || 'pcs',
        status: i.status,
        shortage_qty: i.shortage_qty || 0,
        remarks: i.remarks?.trim() || ''
      }
    })

    const baseNotes = payload.notes?.trim() || ''
    const companyTag = `[Company: ${companyName}]`
    const finalNotes = baseNotes.includes(companyTag) ? baseNotes : (baseNotes ? `${baseNotes} ${companyTag}` : companyTag)

    // Check if currentUserId is a valid profile in public.profiles to satisfy foreign key constraint
    let validProfileId: string | null = null
    if (currentUserId) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', currentUserId)
        .maybeSingle()
      if (prof?.id) {
        validProfileId = prof.id
      }
    }

    // 1. Insert into truck_inwards with fallback resilience for garment_type and received_by
    const insertPayload: any = {
      grn_no: grnNo,
      party_name: payload.party_name.trim(),
      article_no: payload.article_no?.trim() || null,
      garment_type: payload.garment_type?.trim() || null,
      challan_no: payload.challan_no?.trim() || null,
      truck_no: payload.truck_no?.trim() || null,
      inward_date: payload.inward_date || new Date().toISOString().split('T')[0],
      total_items: payload.items.length,
      due_items_count: dueCount,
      shortage_items_count: shortageCount,
      status: overallStatus,
      challan_photo_url: payload.challan_photo_url || null,
      line_items: lineItemsJson,
      notes: finalNotes,
      receiver_name: currentUserName,
      received_by: validProfileId,
    }

    let { data: insertedInward, error: inwardError } = await supabase
      .from('truck_inwards')
      .insert(insertPayload)
      .select('id, grn_no')
      .single()

    // Graceful fallback if garment_type column does not exist yet in Supabase
    if (inwardError && inwardError.message?.toLowerCase().includes('garment_type')) {
      delete insertPayload.garment_type
      if (payload.garment_type?.trim()) {
        insertPayload.notes = insertPayload.notes
          ? `${insertPayload.notes} [Garment: ${payload.garment_type.trim()}]`
          : `[Garment: ${payload.garment_type.trim()}]`
      }
      const retry = await supabase
        .from('truck_inwards')
        .insert(insertPayload)
        .select('id, grn_no')
        .single()
      insertedInward = retry.data
      inwardError = retry.error
    }

    // Graceful fallback if received_by foreign key fails
    if (inwardError && (inwardError.message?.toLowerCase().includes('received_by') || inwardError.code === '23503')) {
      delete insertPayload.received_by
      const retry = await supabase
        .from('truck_inwards')
        .insert(insertPayload)
        .select('id, grn_no')
        .single()
      insertedInward = retry.data
      inwardError = retry.error
    }

    if (inwardError || !insertedInward) {
      console.error('Error inserting truck inward:', inwardError)
      return { error: inwardError?.message || 'Failed to record GRN slip' }
    }

    const truckInwardId = insertedInward.id

    // 2. Insert child items into truck_inward_items
    const childItemRows = payload.items.map(it => {
      const cQty = it.challan_qty ?? (it.quantity + (it.shortage_qty || 0))
      return {
        truck_inward_id: truckInwardId,
        item_name: it.item_name.trim(),
        quantity: it.quantity, // Physical received count
        challan_qty: cQty,     // Billed challan count
        unit: it.unit || 'pcs',
        size_label: it.size_label?.trim() || null,
        size_color: it.size_label?.trim() || null,
        status: it.status,
        shortage_qty: it.shortage_qty || 0,
        remarks: it.remarks?.trim() || null
      }
    })

    const { error: itemsError } = await supabase.from('truck_inward_items').insert(childItemRows)
    if (itemsError) {
      console.warn('Warning inserting truck_inward_items:', itemsError)
    }

    // 3. Log inward rows in accessories table so godown stock is instantly credited
    const accessoryRows = payload.items
      .filter(it => it.quantity > 0)
      .map(it => {
        const sizeSuffix = it.size_label?.trim() ? ` (${it.size_label.trim()})` : ''
        const issueNote = (it.shortage_qty && it.shortage_qty > 0) ? ` • ${it.status}: ${it.shortage_qty} ${it.unit}` : ''
        return {
          item_name: it.item_name.trim() + sizeSuffix,
          action: 'IN',
          quantity: it.quantity, // Only what is physically received enters godown stock
          unit: it.unit || 'pcs',
          party_name: payload.party_name.trim(),
          entry_date: payload.inward_date || new Date().toISOString().split('T')[0],
          notes: `Challan #${payload.challan_no?.trim() || '-'} • Art ${payload.article_no?.trim() || '-'} • ${grnNo}${issueNote}`,
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

export async function updateTruckInwardChallanPhoto(truckInwardId: string, photoUrl: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase
      .from('truck_inwards')
      .update({ challan_photo_url: photoUrl })
      .eq('id', truckInwardId)

    if (error) return { error: error.message }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to update slip photo' }
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

// ----------------------------------------------------
// 6. FLOOR ACCESSORY RE-ISSUE & LOSS ENTRY
// ----------------------------------------------------
export type FloorAccessoryReissuePayload = {
  allotment_id?: string | null
  article_id?: string | null
  article_no: string
  challan_no?: string | null
  worker_name: string
  lineman_name?: string | null
  item_name: string
  quantity: number
  unit?: string
  reason: 'LOST' | 'MACHINE_DAMAGE' | 'DEFECTIVE_PIECE' | 'SHORT_IN_LOT'
  channel?: 'DIRECT_COUNTER' | 'VIA_LINEMAN'
  notes?: string | null
}

export async function reissueFloorAccessory(payload: FloorAccessoryReissuePayload) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Store Supervisor'
    const todayStr = new Date().toISOString().split('T')[0]

    if (!payload.worker_name?.trim()) {
      return { error: 'Please specify the Worker / Tailor name.' }
    }
    if (!payload.article_no?.trim()) {
      return { error: 'Please specify the Target Article.' }
    }
    if (!payload.item_name?.trim()) {
      return { error: 'Please select or enter the Accessory Item.' }
    }
    if (!payload.quantity || payload.quantity <= 0) {
      return { error: 'Please enter a valid quantity greater than 0.' }
    }

    const reasonLabelMap: Record<string, string> = {
      LOST: 'Worker Lost (खोगी)',
      MACHINE_DAMAGE: 'Machine Damage (मशीन में टूटी/कटी)',
      DEFECTIVE_PIECE: 'Defective (खराब निकली)',
      SHORT_IN_LOT: 'Lot Shortage (कम निकली)',
    }
    const reasonText = reasonLabelMap[payload.reason] || payload.reason

    // 1. Insert into floor_accessory_reissues
    const { error: reissueError } = await supabase
      .from('floor_accessory_reissues')
      .insert({
        allotment_id: payload.allotment_id || null,
        article_id: payload.article_id || null,
        article_no: payload.article_no.trim(),
        challan_no: payload.challan_no?.trim() || null,
        worker_name: payload.worker_name.trim(),
        lineman_name: payload.lineman_name?.trim() || null,
        item_name: payload.item_name.trim(),
        quantity: payload.quantity,
        unit: payload.unit || 'pcs',
        reason: payload.reason,
        channel: payload.channel || 'DIRECT_COUNTER',
        issued_by: currentUserName,
        notes: payload.notes?.trim() || null,
        entry_date: todayStr,
      })

    if (reissueError) {
      console.warn('Warning inserting floor_accessory_reissues (table may be pending migration):', reissueError.message)
    }

    // 2. Insert into accessories table with action: 'OUT' so Godown Stock is deducted in real-time
    const partyLabel = `Floor Re-Issue: ${payload.worker_name.trim()}${payload.lineman_name ? ` (Line: ${payload.lineman_name})` : ''}`
    const noteText = `Art #${payload.article_no.trim()}${payload.challan_no ? ` • Challan #${payload.challan_no.trim()}` : ''} • Reason: ${reasonText} • Via: ${payload.channel === 'VIA_LINEMAN' ? 'Lineman Auth' : 'Direct Counter'}${payload.notes ? ` • ${payload.notes.trim()}` : ''}`

    const { error: accError } = await supabase
      .from('accessories')
      .insert({
        item_name: payload.item_name.trim(),
        action: 'OUT',
        quantity: payload.quantity,
        unit: payload.unit || 'pcs',
        party_name: partyLabel,
        entry_date: todayStr,
        notes: noteText,
      })

    if (accError) {
      console.error('Error deducting accessory from godown stock:', accError)
      return { error: accError.message }
    }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    revalidatePath('/allotments')
    return { success: true }
  } catch (err: any) {
    console.error('Exception in reissueFloorAccessory:', err)
    return { error: err?.message || 'Failed to record floor accessory re-issue' }
  }
}

export async function deleteFloorAccessoryReissue(id: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase.from('floor_accessory_reissues').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/store')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete floor re-issue record' }
  }
}

// ============================================================================
// CENTRAL FABRIC INVENTORY & MATERIAL FLOW SERVER ACTIONS
// ============================================================================

export async function fetchCentralFabricInventory(companyName?: string) {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:store:fabric_inventory`

  return CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      try {
        const supabase = supabaseAdmin
        let query = supabase
          .from('central_fabric_inventory')
          .select('*')
          .order('created_at', { ascending: false })

        if (companyName && companyName.trim()) {
          query = query.ilike('company_name', companyName.trim())
        }

        const { data, error } = await query
        if (error) {
          console.error('Error fetching central fabric inventory:', error)
          return { data: [], error: error.message }
        }
        return { data: data || [], error: null }
      } catch (err: any) {
        return { data: [], error: err?.message || 'Failed to fetch fabric inventory' }
      }
    },
    60, // 60 seconds TTL
    [`company:${normComp}:store`, 'store_fabrics']
  )
}

export async function upsertFabricInventoryEntry(payload: {
  id?: string
  fabric_type: string
  color: string
  supplier_name?: string | null
  total_meters: number
  total_weight_kg?: number
  total_rolls?: number
  rack_location?: string
  booked_for_article?: string | null
  booked_meters?: number
  notes?: string | null
  company_name?: string
}) {
  try {
    const supabase = supabaseAdmin
    const company = payload.company_name?.trim() || 'NUBIRA CREATION'

    if (!payload.fabric_type?.trim() || !payload.color?.trim()) {
      return { error: 'Fabric type and color are required.' }
    }

    const rowData: any = {
      company_name: company,
      fabric_type: payload.fabric_type.trim(),
      color: payload.color.trim(),
      supplier_name: payload.supplier_name?.trim() || null,
      total_meters: Number(payload.total_meters) || 0,
      total_weight_kg: Number(payload.total_weight_kg) || 0,
      total_rolls: Number(payload.total_rolls) || 0,
      rack_location: payload.rack_location?.trim() || 'RACK-01',
      booked_for_article: payload.booked_for_article?.trim() || null,
      booked_meters: Number(payload.booked_meters) || 0,
      notes: payload.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    if (payload.id) {
      const { data, error } = await supabase
        .from('central_fabric_inventory')
        .update(rowData)
        .eq('id', payload.id)
        .select()
        .single()
      if (error) return { error: error.message }
      await CacheManager.invalidateCompanyModule(company, 'store')
      revalidatePath('/store')
      return { data, success: true }
    } else {
      const { data, error } = await supabase
        .from('central_fabric_inventory')
        .insert({
          ...rowData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) return { error: error.message }
      await CacheManager.invalidateCompanyModule(company, 'store')
      revalidatePath('/store')
      return { data, success: true }
    }
  } catch (err: any) {
    return { error: err?.message || 'Failed to save fabric inventory' }
  }
}

export async function bookFabricForArticle(inventoryId: string, articleNo: string, meters: number) {
  try {
    const supabase = supabaseAdmin
    if (!inventoryId || !articleNo || meters <= 0) {
      return { error: 'Invalid inventory, article, or meters to book.' }
    }

    const { data: current, error: fetchErr } = await supabase
      .from('central_fabric_inventory')
      .select('total_meters, booked_meters')
      .eq('id', inventoryId)
      .single()

    if (fetchErr || !current) {
      return { error: fetchErr?.message || 'Inventory record not found.' }
    }

    const newBooked = (Number(current.booked_meters) || 0) + Number(meters)
    if (newBooked > Number(current.total_meters)) {
      return { error: `Cannot book ${meters}m. Only ${Number(current.total_meters) - (Number(current.booked_meters) || 0)}m available.` }
    }

    const { error: updateErr } = await supabase
      .from('central_fabric_inventory')
      .update({
        booked_for_article: articleNo.trim(),
        booked_meters: newBooked,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventoryId)

    if (updateErr) return { error: updateErr.message }

    revalidatePath('/store')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to book fabric' }
  }
}

export async function createMaterialIssueChallan(payload: {
  from_division: string
  to_division: string
  article_no?: string | null
  buyer_name?: string | null
  fabric_type?: string | null
  color?: string | null
  quantity: number
  unit?: string
  rolls_count?: number
  issued_by?: string | null
  notes?: string | null
  company_name?: string
}) {
  try {
    const supabase = supabaseAdmin
    const company = payload.company_name?.trim() || 'NUBIRA CREATION'

    if (!payload.from_division || !payload.to_division || Number(payload.quantity) <= 0) {
      return { error: 'Source, destination, and quantity are required.' }
    }

    const challanNo = `ISS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    const { data, error } = await supabase
      .from('central_material_issues')
      .insert({
        company_name: company,
        issue_challan_no: challanNo,
        from_division: payload.from_division.toUpperCase(),
        to_division: payload.to_division.toUpperCase(),
        article_no: payload.article_no?.trim() || null,
        buyer_name: payload.buyer_name?.trim() || null,
        fabric_type: payload.fabric_type?.trim() || null,
        color: payload.color?.trim() || null,
        quantity: Number(payload.quantity),
        unit: payload.unit?.toLowerCase() || 'meters',
        rolls_count: Number(payload.rolls_count) || 0,
        issued_by: payload.issued_by?.trim() || 'Central Store',
        status: 'ISSUED',
        issue_date: new Date().toISOString().split('T')[0],
        notes: payload.notes?.trim() || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return { error: error.message }

    await CacheManager.invalidateCompanyModule(company, 'store')
    revalidatePath('/store')
    revalidatePath('/cutting/store')
    revalidatePath('/printing/store')
    revalidatePath('/embroidery/store')
    revalidatePath('/washing/store')
    revalidatePath('/iron/store')
    return { data, success: true, challanNo }
  } catch (err: any) {
    return { error: err?.message || 'Failed to create material issue challan' }
  }
}

export async function acknowledgeMaterialReceipt(payload: {
  issue_id: string
  division_code: string
  received_quantity: number
  shortage_quantity?: number
  unit?: string
  received_by?: string | null
  rack_location?: string | null
  notes?: string | null
  company_name?: string
}) {
  try {
    const supabase = supabaseAdmin
    const company = payload.company_name?.trim() || 'NUBIRA CREATION'

    if (!payload.issue_id || !payload.division_code || Number(payload.received_quantity) <= 0) {
      return { error: 'Issue reference, division, and received quantity are required.' }
    }

    // 1. Insert receipt record
    const { data: receiptData, error: receiptError } = await supabase
      .from('central_material_receipts')
      .insert({
        company_name: company,
        issue_id: payload.issue_id,
        division_code: payload.division_code.toUpperCase(),
        received_quantity: Number(payload.received_quantity),
        shortage_quantity: Number(payload.shortage_quantity) || 0,
        unit: payload.unit?.toLowerCase() || 'meters',
        received_by: payload.received_by?.trim() || 'Floor Manager',
        rack_location: payload.rack_location?.trim() || 'FLOOR-IN',
        notes: payload.notes?.trim() || null,
        received_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (receiptError) return { error: receiptError.message }

    // 2. Update issue status
    await supabase
      .from('central_material_issues')
      .update({
        status: 'RECEIVED',
        received_by: payload.received_by?.trim() || 'Floor Manager',
        received_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.issue_id)

    await CacheManager.invalidateCompanyModule(company, 'store')
    revalidatePath('/store')
    revalidatePath('/cutting/store')
    revalidatePath('/printing/store')
    revalidatePath('/embroidery/store')
    revalidatePath('/washing/store')
    revalidatePath('/iron/store')
    return { data: receiptData, success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to acknowledge material receipt' }
  }
}

export async function fetchMaterialIssuesByDivision(division?: string, companyName?: string) {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const normDiv = (division || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:store:issues:${normDiv}`

  return CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      try {
        const supabase = supabaseAdmin
        let query = supabase
          .from('central_material_issues')
          .select('*')
          .order('created_at', { ascending: false })

        if (companyName && companyName.trim()) {
          query = query.ilike('company_name', companyName.trim())
        }

        if (division && division.trim()) {
          const d = division.trim().toUpperCase()
          query = query.or(`from_division.eq.${d},to_division.eq.${d}`)
        }

        const { data, error } = await query
        if (error) return { data: [], error: error.message }
        return { data: data || [], error: null }
      } catch (err: any) {
        return { data: [], error: err?.message || 'Failed to fetch material issues' }
      }
    },
    60,
    [`company:${normComp}:store`, 'store_issues']
  )
}

export async function fetchMaterialReceiptsByDivision(division?: string, companyName?: string) {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const normDiv = (division || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:store:receipts:${normDiv}`

  return CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      try {
        const supabase = supabaseAdmin
        let query = supabase
          .from('central_material_receipts')
          .select('*, issue:central_material_issues(*)')
          .order('received_at', { ascending: false })

        if (companyName && companyName.trim()) {
          query = query.ilike('company_name', companyName.trim())
        }

        if (division && division.trim()) {
          query = query.eq('division_code', division.trim().toUpperCase())
        }

        const { data, error } = await query
        if (error) return { data: [], error: error.message }
        return { data: data || [], error: null }
      } catch (err: any) {
        return { data: [], error: err?.message || 'Failed to fetch material receipts' }
      }
    },
    60,
    [`company:${normComp}:store`, 'store_receipts']
  )
}

export async function fetchCentralStoreKpis(companyName?: string) {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:store:kpis`

  return CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      try {
        let truckQuery = supabaseAdmin
          .from('truck_inwards')
          .select('id', { count: 'exact' })

        if (companyName && companyName.trim()) {
          const c = companyName.trim()
          truckQuery = truckQuery.or(`party_name.ilike.%${c}%,notes.ilike.%${c}%`)
        }

        const [fabricRes, issuesRes, receiptsRes, trucksRes] = await Promise.all([
          fetchCentralFabricInventory(companyName),
          fetchMaterialIssuesByDivision(undefined, companyName),
          fetchMaterialReceiptsByDivision(undefined, companyName),
          truckQuery
        ])

        const fabrics = fabricRes.data || []
        const issues = issuesRes.data || []
        const receipts = receiptsRes.data || []

        const totalFabricMeters = fabrics.reduce((sum: number, f: any) => sum + (Number(f.total_meters) || 0), 0)
        const totalFabricRolls = fabrics.reduce((sum: number, f: any) => sum + (Number(f.total_rolls) || 0), 0)
        const totalWeightKg = fabrics.reduce((sum: number, f: any) => sum + (Number(f.total_weight_kg) || 0), 0)
        const totalBookedMeters = fabrics.reduce((sum: number, f: any) => sum + (Number(f.booked_meters) || 0), 0)
        const totalAvailableMeters = Math.max(0, totalFabricMeters - totalBookedMeters)

        const activeIssuesCount = issues.filter((i: any) => i.status === 'ISSUED' || i.status === 'IN_TRANSIT').length
        const completedReceiptsCount = receipts.length
        const totalTrucksInward = trucksRes.count || 0

        return {
          kpis: {
            totalFabricMeters,
            totalFabricRolls,
            totalWeightKg,
            totalAvailableMeters,
            totalBookedMeters,
            activeIssuesCount,
            completedReceiptsCount,
            totalTrucksInward,
          },
          fabrics,
          issues,
          receipts,
        }
      } catch (err: any) {
        console.error('Error fetching central store KPIs:', err)
        return {
          kpis: {
            totalFabricMeters: 0,
            totalFabricRolls: 0,
            totalWeightKg: 0,
            totalAvailableMeters: 0,
            totalBookedMeters: 0,
            activeIssuesCount: 0,
            completedReceiptsCount: 0,
            totalTrucksInward: 0,
          },
          fabrics: [],
          issues: [],
          receipts: [],
        }
      }
    },
    60, // 60 seconds TTL
    [`company:${normComp}:store`, 'store_kpis']
  )
}

