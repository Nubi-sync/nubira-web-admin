'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

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
  client_challan_no?: string
  sample_photos?: string[]
  variants: VariantPayload[]
  materials: MaterialPayload[]
}) {
  const supabase = await createClient()

  const { lineman_id, article_id, target_qty, client_challan_no, sample_photos, variants, materials } = payload

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

    const nowIso = new Date().toISOString()
    const validMaterials = materials
      .filter(m => m.item_name.trim() !== '')
      .map(m => ({
        allotment_id: allotmentId,
        item_name: m.item_name.trim(),
        required_qty: m.required_qty.trim() || 'As required',
        admin_issued: m.admin_issued ?? true,
        admin_issued_at: m.admin_issued ? nowIso : null,
        lineman_received: false,
        notes: JSON.stringify({ 
          lineman_name: linemanName, 
          lineman_id: lineman_id, 
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

  if (error) {
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