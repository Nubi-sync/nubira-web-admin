'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export type VariantPayload = {
  color: string
  size: string
  quantity: number
}

export type MaterialPayload = {
  item_name: string
  required_qty: string
  admin_issued: boolean
  source?: 'CLIENT' | 'FACTORY_STORE'
}

export async function createDetailedAllotment(payload: {
  lineman_id: string
  article_id: string
  target_qty: number
  production_order_no?: string
  manager_name?: string
  due_date?: string
  target_hours?: number
  priority?: 'NORMAL' | 'RUSH' | 'CRITICAL'
  client_challan_no?: string
  sample_photos?: string[]
  variants: VariantPayload[]
  materials: MaterialPayload[]
}) {
  try {
    let supabase: any = supabaseAdmin
    try {
      const serverClient = await createClient()
      if (serverClient) supabase = serverClient
    } catch (_) {
      supabase = supabaseAdmin
    }

  const { 
    lineman_id, 
    article_id, 
    target_qty, 
    production_order_no, 
    manager_name, 
    due_date, 
    target_hours, 
    priority, 
    client_challan_no, 
    sample_photos, 
    variants, 
    materials 
  } = payload

  if (!lineman_id || !article_id || isNaN(target_qty) || target_qty <= 0) {
    return { error: 'Please select a Lineman, an Article, and enter a valid quantity.' }
  }

  // 1. Insert into allotments (with optional sample_photos & client_challan_no)
  const allotPayload: any = {
    lineman_id,
    article_id,
    target_qty,
    status: 'IN_PROGRESS',
    allotment_date: new Date().toISOString().split('T')[0]
  }
  if (production_order_no) allotPayload.production_order_no = production_order_no
  if (manager_name) allotPayload.manager_name = manager_name
  if (due_date) allotPayload.due_date = due_date
  if (target_hours) allotPayload.target_hours = target_hours
  if (priority) allotPayload.priority = priority
  if (client_challan_no) allotPayload.client_challan_no = client_challan_no
  if (sample_photos && sample_photos.length > 0) allotPayload.sample_photos = sample_photos

  let { data: allotment, error: allotError } = await supabase
    .from('allotments')
    .insert(allotPayload)
    .select('id')
    .single()

  // Fallback if client_challan_no or sample_photos columns are not yet present in allotments schema
  if (allotError && (allotError.message?.includes('column') || allotError.code === '42703')) {
    const fallbackPayload = {
      lineman_id,
      article_id,
      target_qty,
      status: 'IN_PROGRESS',
      allotment_date: new Date().toISOString().split('T')[0]
    }
    const res = await supabase.from('allotments').insert(fallbackPayload).select('id').single()
    allotment = res.data
    allotError = res.error
  }

  if (allotError || !allotment) {
    return { error: allotError?.message || 'Failed to create allotment' }
  }

  const allotmentId = allotment.id

  // 1.1 Article linking completed directly via allotment_id

  // 2. Insert variants if provided
  if (variants && variants.length > 0) {
    const validVariants = variants
      .filter(v => v.color.trim() !== '' && v.size.trim() !== '' && v.quantity > 0)
      .map(v => ({
        allotment_id: allotmentId,
        color: v.color.trim(),
        size: v.size.trim(),
        quantity: v.quantity,
        completed_qty: 0
      }))

    if (validVariants.length > 0) {
      const { error: varError } = await supabase
        .from('allotment_variants')
        .insert(validVariants)

      if (varError) {
        console.error('Error inserting variants:', varError)
      }
    }
  }

  // 3. Insert materials checklist if provided
  if (materials && materials.length > 0) {
    let linemanName = 'Lineman'
    try {
      const { data: prof } = await supabase.from('profiles').select('username').eq('id', lineman_id).single()
      if (prof?.username) linemanName = prof.username
    } catch (_) {}

    let artNo = ''
    let artDesc = ''
    try {
      const { data: aData } = await supabase.from('articles').select('art_no, description').eq('id', article_id).single()
      if (aData) {
        artNo = aData.art_no || ''
        artDesc = aData.description || ''
      }
    } catch (_) {}

    const nowIso = new Date().toISOString()
    const validMaterials = materials
      .filter(m => m.item_name.trim() !== '')
      .map(m => ({
        allotment_id: allotmentId,
        item_name: m.item_name.trim(),
        required_qty: m.required_qty.trim() || 'As required',
        admin_issued: false,
        admin_issued_at: null,
        lineman_received: false,
        notes: JSON.stringify({ 
          lineman_name: linemanName, 
          article_id: article_id,
          art_no: artNo,
          article_description: artDesc, 
          lineman_id: lineman_id, 
          production_order_no: production_order_no || '',
          manager_name: manager_name || 'Production Manager',
          due_date: due_date || '',
          target_hours: target_hours || 16,
          priority: priority || 'NORMAL',
          client_challan_no: client_challan_no || '',
          source: m.source || (m.item_name.includes('Sewing Thread') ? 'FACTORY_STORE' : 'CLIENT'),
          sample_photos: sample_photos || [],
          status: 'PENDING' 
        })
      }))

    if (validMaterials.length > 0) {
      const { error: matError } = await supabase
        .from('allotment_materials')
        .insert(validMaterials)

      if (matError) {
        console.error('Error inserting materials:', matError)
      }
    }
  }

  revalidatePath('/allotments')
  return { success: true }
  } catch (globalErr: any) {
    console.error('Fatal error in createDetailedAllotment:', globalErr)
    return { error: globalErr?.message || 'Server error while creating allotment. Please try again.' }
  }
}

export async function createAllotment(formData: FormData) {
  const lineman_id = formData.get('lineman_id') as string
  const article_id = formData.get('article_id') as string
  const target_qty_str = formData.get('target_qty') as string
  const target_qty = parseInt(target_qty_str, 10)

  return createDetailedAllotment({
    lineman_id,
    article_id,
    target_qty,
    variants: [],
    materials: []
  })
}

export async function updateAllotmentStatus(allotmentId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('allotments')
    .update({ status: newStatus })
    .eq('id', allotmentId)

  if (!error) {
    try {
      // Sync status to allotment_materials notes for mobile dashboard consistency
      const { data: mats } = await supabase.from('allotment_materials').select('id, notes').eq('allotment_id', allotmentId)
      if (mats && mats.length > 0) {
        for (const m of mats) {
          let nObj: Record<string, any> = {}
          try { if (m.notes) nObj = JSON.parse(m.notes) } catch (_) {}
          nObj.status = newStatus
          await supabase.from('allotment_materials').update({ notes: JSON.stringify(nObj) }).eq('id', m.id)
        }
      }
    } catch (_) {}
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/allotments')
  return { success: true }
}

export async function deleteAllotment(allotmentId: string) {
  let supabase: any = supabaseAdmin
  try {
    const serverClient = await createClient()
    if (serverClient) supabase = serverClient
  } catch (_) {
    supabase = supabaseAdmin
  }

  // 1. Delete associated child records first to ensure clean cascade
  try {
    await supabase.from('allotment_variants').delete().eq('allotment_id', allotmentId)
    await supabase.from('allotment_materials').delete().eq('allotment_id', allotmentId)
    await supabase.from('worker_assignments').delete().eq('allotment_id', allotmentId)
    await supabase.from('floor_alerts').delete().eq('allotment_id', allotmentId)
  } catch (e) {
    console.warn('Child table deletion warning:', e)
  }

  // 2. Delete main allotment record
  const { error } = await supabase
    .from('allotments')
    .delete()
    .eq('id', allotmentId)

  if (error) {
    console.error('Failed to delete allotment:', error)
    return { error: error.message }
  }

  revalidatePath('/allotments')
  return { success: true }
}

export async function toggleMaterialIssue(materialId: string, issued: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('allotment_materials')
    .update({
      admin_issued: issued,
      admin_issued_at: issued ? new Date().toISOString() : null
    })
    .eq('id', materialId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/allotments')
  return { success: true }
}

// =========================================================================
// FLOOR SOS & ANDON LINE ALERT ACTIONS
// =========================================================================

export type FloorAlert = {
  id: string
  allotment_id: string
  lineman_id?: string
  lineman_name?: string
  production_order_no?: string
  category: 'MACHINE_BREAKDOWN' | 'MATERIAL_SHORTAGE' | 'CUTTING_DEFECT' | 'GENERAL_DELAY'
  machine_station?: string
  description?: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  resolved_by?: string
  resolved_at?: string
  created_at: string
}

export async function createFloorAlert(payload: {
  allotment_id: string
  lineman_id?: string
  lineman_name?: string
  production_order_no?: string
  category: string
  machine_station?: string
  description?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('floor_alerts')
    .insert({
      allotment_id: payload.allotment_id,
      lineman_id: payload.lineman_id || null,
      lineman_name: payload.lineman_name || 'Floor Lineman',
      production_order_no: payload.production_order_no || '',
      category: payload.category,
      machine_station: payload.machine_station || 'GENERAL',
      description: payload.description || '',
      status: 'OPEN'
    })

  if (error) {
    console.warn('Floor alert insert error (table may be pending migration):', error.message)
  }

  revalidatePath('/allotments')
  return { success: true }
}

export async function resolveFloorAlert(alertId: string, resolvedBy: string = 'Production Manager') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('floor_alerts')
    .update({
      status: 'RESOLVED',
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString()
    })
    .eq('id', alertId)

  if (error) {
    console.warn('Floor alert resolve error:', error.message)
  }

  revalidatePath('/allotments')
  return { success: true }
}
