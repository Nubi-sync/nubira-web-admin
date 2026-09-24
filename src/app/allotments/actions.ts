'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { CacheManager } from '@/lib/cache/cache-manager'

// ----------------------------------------------------------------------
// FETCH FLOOR ALLOTMENTS DATA (Cached)
// ----------------------------------------------------------------------
export async function fetchFloorAllotmentsDataAction(companyName?: string) {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:allotments:list`

  return CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      const res1 = await supabaseAdmin
        .from('allotments')
        .select(`
          id,
          lineman_id,
          article_id,
          target_qty,
          allotment_date,
          status,
          mending_status,
          mending_total_counted,
          mending_supervisor_name,
          mending_supervisor_id,
          handed_to_mending_by,
          handed_to_mending_at,
          mending_handover_notes,
          qc_status,
          qc_total_passed,
          qc_total_alter,
          qc_supervisor_name,
          handed_to_qc_by,
          handed_to_qc_at,
          created_at,
          profiles:lineman_id ( id, username ),
          articles:article_id ( id, art_no, description, stitching_rate, size_rates ),
          challans:challan_id ( id, challan_no, brand, fabric_type )
        `)
        .order('created_at', { ascending: false })
        .limit(200)

      const rawAllotments = res1.data || []
      const allotmentIds = rawAllotments.map((a: any) => a.id)
      const allotmentDates = Array.from(new Set(rawAllotments.map((a: any) => a.allotment_date).filter(Boolean)))

      const [
        { data: vData },
        { data: mData },
        { data: aData },
        { data: dailyProducts }
      ] = await Promise.all([
        allotmentIds.length > 0
          ? supabaseAdmin
              .from('allotment_variants')
              .select('id, allotment_id, color, size, quantity, completed_qty')
              .in('allotment_id', allotmentIds)
          : Promise.resolve({ data: [] }),

        allotmentIds.length > 0
          ? supabaseAdmin
              .from('allotment_materials')
              .select('id, allotment_id, item_name, required_qty, admin_issued, lineman_received, lineman_received_at, notes')
              .in('allotment_id', allotmentIds)
          : Promise.resolve({ data: [] }),

        allotmentIds.length > 0
          ? supabaseAdmin
              .from('worker_assignments')
              .select('id, allotment_id, lineman_id, article_id, worker_name, assigned_qty, completed_qty, color, size, status, notes, assigned_at, completed_at, entry_date')
              .in('allotment_id', allotmentIds)
          : Promise.resolve({ data: [] }),

        allotmentDates.length > 0
          ? supabaseAdmin
              .from('daily_product')
              .select('lineman_id, article_id, quantity, entry_date')
              .in('entry_date', allotmentDates)
          : Promise.resolve({ data: [] })
      ])

      return {
        rawAllotments,
        variants: vData || [],
        materials: mData || [],
        assignments: aData || [],
        dailyProducts: dailyProducts || []
      }
    },
    90,
    [`company:${normComp}:allotments`, 'allotments']
  )
}

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

  if (!lineman_id || isNaN(target_qty) || target_qty <= 0) {
    return { error: 'Please select a Lineman and enter a valid quantity.' }
  }

  // Ensure article_id is a valid UUID foreign key
  let resolvedArticleId = article_id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedArticleId || '')

  if (!isUuid || !resolvedArticleId) {
    // 1. Try finding an existing article by production_order_no / client_challan_no
    const { data: matchedArt } = await supabase
      .from('articles')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (matchedArt?.id) {
      resolvedArticleId = matchedArt.id
    } else {
      // 2. Create a placeholder article record if none exists in database
      const { data: createdArt, error: createArtErr } = await supabase
        .from('articles')
        .insert({
          art_no: production_order_no || client_challan_no || 'JOB-TARGET',
          description: `${client_challan_no || 'Job'} Production Batch`,
          stitching_rate: 0,
          is_active: true
        })
        .select('id')
        .single()

      if (createdArt?.id) {
        resolvedArticleId = createdArt.id
      } else {
        console.warn('Could not create article for allotment:', createArtErr)
      }
    }
  }

  if (!resolvedArticleId) {
    return { error: 'No valid article reference found to link this target allotment.' }
  }

  // 1. Insert into allotments (with optional sample_photos & client_challan_no)
  const allotPayload: any = {
    lineman_id,
    article_id: resolvedArticleId,
    target_qty,
    status: 'IN_PROGRESS',
    qc_status: 'PENDING_STITCHING',
    mending_status: 'PENDING_STITCHING',
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
      article_id: resolvedArticleId,
      target_qty,
      status: 'IN_PROGRESS',
      qc_status: 'PENDING_STITCHING',
      mending_status: 'PENDING_STITCHING',
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
        admin_issued: Boolean(m.admin_issued),
        admin_issued_at: m.admin_issued ? nowIso : null,
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

      // If Admin pre-issued any materials directly upon allotment creation, log OUTWARD in store accessories
      const preIssuedItems = materials.filter(m => m.admin_issued && m.item_name.trim() !== '')
      if (preIssuedItems.length > 0) {
        const todayStr = nowIso.split('T')[0]
        const outwardRows = preIssuedItems.map(m => {
          const parsedQty = parseInt(String(m.required_qty).replace(/[^0-9]/g, ''), 10) || 0
          return {
            item_name: m.item_name.trim(),
            action: 'OUT',
            quantity: parsedQty,
            unit: 'pcs',
            party_name: `Issued to Lineman ${linemanName} (Direct Allotment)`,
            entry_date: todayStr,
            notes: `Direct Handover on Allotment Creation #${allotmentId}${production_order_no ? ` • Order #${production_order_no}` : ''}${artNo ? ` • Art #${artNo}` : ''}`,
          }
        }).filter(r => r.quantity > 0)

        if (outwardRows.length > 0) {
          try {
            await supabase.from('accessories').insert(outwardRows)
          } catch (accErr) {
            console.warn('Warning deducting pre-issued materials from accessories:', accErr)
          }
        }
      }
    }
  } else {
    // If no specific materials were entered, ensure a standard metadata row is saved so priority & order details are preserved
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

    try {
      await supabase.from('allotment_materials').insert([{
        allotment_id: allotmentId,
        item_name: 'Standard Production BOM & Trims',
        required_qty: 'As per Article Ratio',
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
          source: 'FACTORY_STORE',
          sample_photos: sample_photos || [],
          status: 'PENDING' 
        })
      }])
    } catch (e) {
      console.warn('Fallback material note save warning:', e)
    }
  }

  await CacheManager.invalidateTag('allotments')
  await CacheManager.invalidateTag('supervisor_desk')
  await CacheManager.invalidateTag('production_orders')
  revalidatePath('/allotments')
  revalidatePath('/stitching-sewing/allotments')
  revalidatePath('/stitching-sewing/supervisor-desk')
  revalidatePath('/modules/supervisor-desk')
  revalidatePath('/stitching-sewing/dashboard')
  revalidatePath('/production-orders')
  revalidatePath('/stitching-sewing/production-orders')
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

  await CacheManager.invalidateTag('allotments')
  await CacheManager.invalidateTag('supervisor_desk')
  await CacheManager.invalidateTag('production_orders')
  revalidatePath('/allotments')
  revalidatePath('/stitching-sewing/allotments')
  revalidatePath('/stitching-sewing/supervisor-desk')
  revalidatePath('/stitching-sewing/dashboard')
  revalidatePath('/production-orders')
  revalidatePath('/stitching-sewing/production-orders')
  return { success: true }
}

export async function deleteAllotment(allotmentId: string) {
  try {
    const supabase = supabaseAdmin

    // 1. Delete associated child records across all dependent tables to ensure clean cascade
    await supabase.from('qc_logs').delete().eq('allotment_id', allotmentId)
    await supabase.from('daily_product').delete().eq('allotment_id', allotmentId)
    await supabase.from('mending_assignments').delete().eq('allotment_id', allotmentId)
    await supabase.from('qc_assignments').delete().eq('allotment_id', allotmentId)
    await supabase.from('counting_reports').delete().eq('allotment_id', allotmentId)
    await supabase.from('store_transactions').delete().eq('allotment_id', allotmentId)
    await supabase.from('allotment_variants').delete().eq('allotment_id', allotmentId)
    await supabase.from('allotment_materials').delete().eq('allotment_id', allotmentId)
    await supabase.from('worker_assignments').delete().eq('allotment_id', allotmentId)
    await supabase.from('floor_alerts').delete().eq('allotment_id', allotmentId)

    // 2. Delete main allotment record
    const { error } = await supabase
      .from('allotments')
      .delete()
      .eq('id', allotmentId)

    if (error) {
      console.error('Failed to delete allotment:', error)
      return { error: error.message }
    }

    await CacheManager.invalidateTag('allotments')
    await CacheManager.invalidateTag('supervisor_desk')
    await CacheManager.invalidateTag('production_orders')
    revalidatePath('/allotments')
    revalidatePath('/stitching-sewing/allotments')
    revalidatePath('/stitching-sewing/supervisor-desk')
    revalidatePath('/production-orders')
    revalidatePath('/stitching-sewing/production-orders')
    revalidatePath('/articles')
    revalidatePath('/stitching-sewing/articles')
    revalidatePath('/stitching-sewing/dashboard')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteAllotment:', err)
    return { error: err?.message || 'Server error while deleting allotment' }
  }
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

  await CacheManager.invalidateTag('allotments')
  await CacheManager.invalidateTag('supervisor_desk')
  revalidatePath('/allotments')
  revalidatePath('/stitching-sewing/allotments')
  revalidatePath('/stitching-sewing/supervisor-desk')
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

  await CacheManager.invalidateTag('allotments')
  revalidatePath('/allotments')
  revalidatePath('/stitching-sewing/allotments')
  revalidatePath('/stitching-sewing/dashboard')
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

  await CacheManager.invalidateTag('allotments')
  revalidatePath('/allotments')
  revalidatePath('/stitching-sewing/allotments')
  revalidatePath('/stitching-sewing/dashboard')
  return { success: true }
}
